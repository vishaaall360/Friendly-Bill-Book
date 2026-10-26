import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchBusinessSettings } from '../services/api.js'

const BusinessSettingsContext = createContext(null)

export function BusinessSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('friendly_billbook_token')) {
      setLoading(false)
      return
    }
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const data = await fetchBusinessSettings()
      setSettings(data)
      setError(null)
    } catch (err) {
      console.error('Error loading business settings:', err)
      setError(err.message)
      // Set empty default settings to prevent app crash
      setSettings({
        company_name: 'Friendly Bill Book',
        phone: '',
        email: '',
        gstin: '',
        address_line_1: '',
        city: '',
        state: '',
      })
    } finally {
      setLoading(false)
    }
  }

  function updateSettingsCache(newSettings) {
    setSettings(newSettings)
  }

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettingsCache
  }

  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  )
}

export function useBusinessSettings() {
  const context = useContext(BusinessSettingsContext)
  if (!context) {
    throw new Error('useBusinessSettings must be used within BusinessSettingsProvider')
  }
  return context
}
