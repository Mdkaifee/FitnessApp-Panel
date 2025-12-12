import { beforeEach, describe, expect, it } from 'vitest'

import {
  getInitialToken,
  safeGetFromStorage,
  safeRemoveFromStorage,
  safeSetInStorage,
} from './storage'
import { TOKEN_KEY } from '../constants'

const createLocalStorageMock = () => {
  let store = new Map()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
  }
}

describe('storage helpers', () => {
  beforeEach(() => {
    const storageMock = createLocalStorageMock()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      writable: true,
      value: storageMock,
    })
  })

  it('persists values via safeSetInStorage + safeGetFromStorage', () => {
    safeSetInStorage('sample-key', 'value-123')
    expect(safeGetFromStorage('sample-key')).toBe('value-123')
  })

  it('removes values safely when safeRemoveFromStorage is called', () => {
    const key = 'removable-key'
    safeSetInStorage(key, 'temp')
    safeRemoveFromStorage(key)
    expect(safeGetFromStorage(key)).toBeNull()
  })

  it('returns stored tokens when available via getInitialToken', () => {
    expect(getInitialToken()).toBe('')
    window.localStorage.setItem(TOKEN_KEY, 'abc-123')
    expect(getInitialToken()).toBe('abc-123')
  })
})
