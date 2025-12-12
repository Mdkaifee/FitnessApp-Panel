import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const FALLBACK_ENDPOINT = 'https://nyc3.digitaloceanspaces.com'
const FALLBACK_CDN = 'https://fitness-app-media.nyc3.cdn.digitaloceanspaces.com'
const FALLBACK_BUCKET = 'fitness-app-media'
const FALLBACK_REGION = 'nyc3'
const FALLBACK_BASE_PATH = 'uploads'

let cachedClient = null
let cachedKey = ''

const trimSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '')

const sanitizeFileName = (filename) => {
  if (!filename) return 'file'
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file'
}

const getSpacesConfig = () => {
  const endpoint = (import.meta.env.VITE_DO_SPACES_ENDPOINT || FALLBACK_ENDPOINT).trim().replace(/\/$/, '')
  const region = (import.meta.env.VITE_DO_SPACES_REGION || FALLBACK_REGION).trim()
  const bucket = (import.meta.env.VITE_DO_SPACES_BUCKET || FALLBACK_BUCKET).trim()
  const accessKeyId = (import.meta.env.VITE_DO_SPACES_ACCESS_KEY || '').trim()
  const secretAccessKey = (import.meta.env.VITE_DO_SPACES_SECRET_KEY || '').trim()
  const cdnUrl = (import.meta.env.VITE_DO_SPACES_CDN_URL || FALLBACK_CDN).trim().replace(/\/$/, '')
  const basePath = trimSlashes((import.meta.env.VITE_DO_SPACES_BASE_PATH || FALLBACK_BASE_PATH).trim())

  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    cdnUrl,
    basePath,
  }
}

const getCacheKey = ({ endpoint, region, accessKeyId }) => `${endpoint}|${region}|${accessKeyId}`

const ensureClient = (config) => {
  const requiredFields = ['endpoint', 'bucket', 'accessKeyId', 'secretAccessKey']
  const missing = requiredFields.filter((field) => !config[field])
  if (missing.length > 0) {
    throw new Error(`DigitalOcean Spaces is not configured. Missing: ${missing.join(', ')}`)
  }

  const key = getCacheKey(config)
  if (!cachedClient || cachedKey !== key) {
    cachedClient = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
    cachedKey = key
  }
  return cachedClient
}

const buildKey = (file, folder, basePath) => {
  const segments = [basePath, trimSlashes(folder)]
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const sanitizedName = sanitizeFileName(file?.name || 'file')
  segments.push(`${uniqueId}-${sanitizedName}`)
  return segments.filter(Boolean).join('/')
}

const buildPublicUrl = (config, key) => {
  if (config.cdnUrl) {
    return `${config.cdnUrl}/${key}`
  }
  const endpointHost = config.endpoint.replace(/^https?:\/\//i, '')
  return `https://${config.bucket}.${endpointHost}/${key}`
}

const readViaFileReader = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'))
      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(error)
    }
  })

const toArrayBufferBody = async (file) => {
  if (typeof file?.arrayBuffer === 'function') {
    const buffer = await file.arrayBuffer()
    return new Uint8Array(buffer)
  }
  if (typeof FileReader !== 'undefined') {
    const buffer = await readViaFileReader(file)
    return new Uint8Array(buffer)
  }
  return file
}

const buildPlaceholderKey = (folder, basePath) => {
  const normalizedFolder = trimSlashes(folder)
  if (!normalizedFolder) return null
  return [basePath, normalizedFolder, '.keep'].filter(Boolean).join('/')
}

export const uploadFileToSpaces = async (file, { folder = '' } = {}) => {
  if (!file) {
    throw new Error('No file provided for upload.')
  }
  const config = getSpacesConfig()
  const client = ensureClient(config)
  const key = buildKey(file, folder, config.basePath)
  const body = await toArrayBufferBody(file)

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ACL: 'public-read',
    ContentType: file.type || 'application/octet-stream',
  })

  await client.send(command)
  const url = buildPublicUrl(config, key)
  return { key, url }
}

export const ensureSpacesFolders = async (folders = []) => {
  if (!Array.isArray(folders) || folders.length === 0) return
  const config = getSpacesConfig()
  const client = ensureClient(config)
  const uniqueFolders = Array.from(
    new Set(
      folders
        .map((folder) => trimSlashes(folder))
        .filter((folder) => typeof folder === 'string' && folder.length > 0),
    ),
  )
  if (uniqueFolders.length === 0) return
  const placeholderBody = new Uint8Array()
  console.info('[Spaces] Ensuring folders exist', { folders: uniqueFolders })
  const results = await Promise.allSettled(
    uniqueFolders.map(async (folder) => {
      const key = buildPlaceholderKey(folder, config.basePath)
      if (!key) return
      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: placeholderBody,
        ACL: 'public-read',
        ContentType: 'text/plain',
      })
      try {
        await client.send(command)
      } catch (error) {
        console.error('Failed to ensure DigitalOcean Spaces folder', { folder, error })
      }
    }),
  )
  const summary = results.reduce(
    (acc, result, index) => {
      const target = uniqueFolders[index]
      if (result.status === 'fulfilled') {
        acc.success.push(target)
      } else {
        acc.failed.push({ folder: target, reason: result.reason?.message ?? 'Unknown error' })
      }
      return acc
    },
    { success: [], failed: [] },
  )
  console.info('[Spaces] Folder ensure summary', summary)
}

export const getSpacesConfigSummary = () => {
  const config = getSpacesConfig()
  return {
    endpoint: config.endpoint,
    region: config.region,
    bucket: config.bucket,
    hasCredentials: Boolean(config.accessKeyId && config.secretAccessKey),
  }
}
