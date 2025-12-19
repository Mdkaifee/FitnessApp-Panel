import {
  ACTIVE_VIEW_KEY,
  PUBLIC_VIEWS,
  ROUTE_TO_WORKSPACE_VIEW,
  TOKEN_KEY,
  WORKSPACE_VIEWS,
} from '../constants'

export const safeGetFromStorage = (key) => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export const safeSetInStorage = (key, value) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore storage write failures
  }
}

export const safeRemoveFromStorage = (key) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore storage removal failures
  }
}

export const getInitialToken = () => safeGetFromStorage(TOKEN_KEY) ?? ''

export const getInitialActiveView = () => {
  const normalizeView = (view) => {
    if (view === 'subscription') return 'programs'
    return view
  }
  const storedToken = safeGetFromStorage(TOKEN_KEY)
  const hasToken = Boolean(storedToken)
  if (typeof window !== 'undefined') {
    const pathView = normalizeView(ROUTE_TO_WORKSPACE_VIEW[window.location.pathname])
    if (pathView) {
      if (hasToken && WORKSPACE_VIEWS.has(pathView)) {
        return pathView
      }
      if (!hasToken && PUBLIC_VIEWS.has(pathView)) {
        return pathView
      }
    }
  }
  if (!hasToken) return 'login'
  const storedView = normalizeView(safeGetFromStorage(ACTIVE_VIEW_KEY))
  return storedView && WORKSPACE_VIEWS.has(storedView) ? storedView : 'dashboard'
}
