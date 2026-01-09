import { useEffect, useState } from 'react'
import { fetchLegalLinks, updateLegalLinks } from '../services/api'
import { uploadFileToSpaces, ensureSpacesFolders } from '../services/spaces'

const TERMS_FOLDER = 'legal/terms'
const PRIVACY_FOLDER = 'legal/privacy'
const LEGAL_FILE_TYPES = '.pdf,.doc,.docx,application/pdf'

const getFileName = (url = '') => {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/')
    return decodeURIComponent(parts[parts.length - 1] || '')
  } catch {
    const parts = url.split('/')
    return decodeURIComponent(parts[parts.length - 1] || '')
  }
}

function PrivacyPolicyView({ token }) {
  const [termsUrl, setTermsUrl] = useState('')
  const [privacyUrl, setPrivacyUrl] = useState('')
  const [termsFile, setTermsFile] = useState(null)
  const [privacyFile, setPrivacyFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const canEdit = Boolean(token)
  const hasUploads = Boolean(termsFile || privacyFile)

  useEffect(() => {
    let isActive = true
    const loadLinks = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchLegalLinks()
        const data = response?.data ?? {}
        if (!isActive) return
        setTermsUrl(data.terms_url ?? '')
        setPrivacyUrl(data.privacy_url ?? '')
      } catch (err) {
        if (!isActive) return
        setError(err?.message ?? 'Unable to load legal links.')
      } finally {
        if (isActive) setLoading(false)
      }
    }
    loadLinks()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!canEdit) return undefined
    let isActive = true
    const ensureFolders = async () => {
      try {
        await ensureSpacesFolders([TERMS_FOLDER, PRIVACY_FOLDER])
      } catch (err) {
        if (!isActive) return
        setError(
          err?.message ??
            'DigitalOcean Spaces is not configured. Uploads are unavailable.',
        )
      }
    }
    ensureFolders()
    return () => {
      isActive = false
    }
  }, [canEdit])

  const handleSave = async () => {
    if (!canEdit) {
      setError('Log in as an admin to update legal documents.')
      return
    }
    if (!hasUploads) {
      setError('Upload at least one document before saving.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      let nextTermsUrl = termsUrl.trim()
      let nextPrivacyUrl = privacyUrl.trim()

      const payload = {}
      if (termsFile) {
        const { url } = await uploadFileToSpaces(termsFile, {
          folder: TERMS_FOLDER,
        })
        nextTermsUrl = url
        payload.terms_url = nextTermsUrl
      }

      if (privacyFile) {
        const { url } = await uploadFileToSpaces(privacyFile, {
          folder: PRIVACY_FOLDER,
        })
        nextPrivacyUrl = url
        payload.privacy_url = nextPrivacyUrl
      }

      const response = await updateLegalLinks(payload, token)
      const data = response?.data ?? {}
      setTermsUrl(data.terms_url ?? nextTermsUrl)
      setPrivacyUrl(data.privacy_url ?? nextPrivacyUrl)
      setTermsFile(null)
      setPrivacyFile(null)
      setNotice('Legal links updated.')
    } catch (err) {
      setError(err?.message ?? 'Unable to update legal links.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel legal-panel">
      <div className="panel-header">
        <div>
          <h2>Legal Documents</h2>
          <p>Upload Terms &amp; Privacy files used in the mobile app.</p>
        </div>
        <span className="pill neutral">DigitalOcean Spaces</span>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {notice ? <p className="success-text">{notice}</p> : null}
      {loading ? (
        <p className="loading-text">Loading legal links...</p>
      ) : (
        <div className="legal-grid">
          <article className="legal-card">
            <div className="legal-card__header">
              <h3>Terms &amp; Conditions</h3>
              {termsUrl ? (
                <a className="legal-link" href={termsUrl} target="_blank" rel="noreferrer">
                  View file
                </a>
              ) : (
                <span className="pill neutral">No file</span>
              )}
            </div>
            <div className="legal-preview">
              <span className="legal-preview__label">Current document</span>
              {termsUrl ? (
                <a className="legal-preview__link" href={termsUrl} target="_blank" rel="noreferrer">
                  {getFileName(termsUrl) || 'View document'}
                </a>
              ) : (
                <span className="legal-preview__empty">No document uploaded yet.</span>
              )}
              {termsFile ? (
                <span className="legal-preview__pending">Selected: {termsFile.name}</span>
              ) : null}
            </div>
            <label className="legal-upload">
              <input
                type="file"
                accept={LEGAL_FILE_TYPES}
                onChange={(event) => {
                  const [file] = event.target.files ?? []
                  if (file) setTermsFile(file)
                  event.target.value = ''
                }}
                disabled={!canEdit || saving}
              />
              {termsFile ? `Selected: ${termsFile.name}` : 'Upload Terms'}
            </label>
          </article>

          <article className="legal-card">
            <div className="legal-card__header">
              <h3>Privacy Policy</h3>
              {privacyUrl ? (
                <a className="legal-link" href={privacyUrl} target="_blank" rel="noreferrer">
                  View file
                </a>
              ) : (
                <span className="pill neutral">No file</span>
              )}
            </div>
            <div className="legal-preview">
              <span className="legal-preview__label">Current document</span>
              {privacyUrl ? (
                <a className="legal-preview__link" href={privacyUrl} target="_blank" rel="noreferrer">
                  {getFileName(privacyUrl) || 'View document'}
                </a>
              ) : (
                <span className="legal-preview__empty">No document uploaded yet.</span>
              )}
              {privacyFile ? (
                <span className="legal-preview__pending">Selected: {privacyFile.name}</span>
              ) : null}
            </div>
            <label className="legal-upload">
              <input
                type="file"
                accept={LEGAL_FILE_TYPES}
                onChange={(event) => {
                  const [file] = event.target.files ?? []
                  if (file) setPrivacyFile(file)
                  event.target.value = ''
                }}
                disabled={!canEdit || saving}
              />
              {privacyFile ? `Selected: ${privacyFile.name}` : 'Upload Privacy'}
            </label>
          </article>
        </div>
      )}

      <div className="legal-actions">
        <button
          type="button"
          className="legal-save-button"
          onClick={handleSave}
          disabled={!canEdit || saving || !hasUploads}
        >
          {saving ? 'Saving...' : 'Save legal links'}
        </button>
        {!canEdit ? (
          <p className="hint">Log in as an admin to update these links.</p>
        ) : (
          <p className="hint">Uploaded files replace the current documents when you save.</p>
        )}
      </div>
    </div>
  )
}

export default PrivacyPolicyView
