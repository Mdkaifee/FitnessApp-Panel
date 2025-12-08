const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

const isBrowser = typeof window !== 'undefined'
const currentHost = isBrowser ? window.location.hostname : 'localhost'
const isLocalBrowser = LOCAL_HOSTNAMES.has(currentHost)

const normalizeUrl = (value) => value.replace(/\/$/, '')

const envBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
const normalizedEnv = envBase ? normalizeUrl(envBase) : ''

const envPointsToLocal =
  normalizedEnv && /^https?:\/\/(localhost|127\.0\.0\.1|::1)(:\d+)?(\/.*)?$/i.test(normalizedEnv)

// const FALLBACK_LOCAL_API = 'http://localhost:8000'
const FALLBACK_LOCAL_API = 'https://dev-api.glowante.com'

export const getApiBaseUrl = () => {
  if (normalizedEnv) {
    if (envPointsToLocal && !isLocalBrowser) {
      return ''
    }
    return normalizedEnv
  }
  return isLocalBrowser ? FALLBACK_LOCAL_API : ''
}
