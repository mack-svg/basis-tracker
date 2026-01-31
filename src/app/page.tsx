'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSavedZip, saveZip, getUserId } from '@/lib/user'
import { supabase } from '@/lib/supabase'
import type { Facility } from '@/types/database'

export default function HomePage() {
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [savedZip, setSavedZip] = useState<string | null>(null)
  const [savedFacilities, setSavedFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSavedZip(getSavedZip())
    loadSavedFacilities()
  }, [])

  async function loadSavedFacilities() {
    const userId = getUserId()
    if (!userId) return

    const { data: saved } = await supabase
      .from('saved_facilities')
      .select('facility_id')
      .eq('user_id', userId)

    if (saved && saved.length > 0) {
      const facilityIds = saved.map(s => s.facility_id)
      const { data: facilities } = await supabase
        .from('facilities')
        .select('*')
        .in('id', facilityIds)

      if (facilities) {
        setSavedFacilities(facilities)
      }
    }
  }

  function handleZipChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 5)
    setZip(cleaned)
    setError('')
  }

  async function handleFindLocations() {
    if (zip.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    setLoading(true)
    setError('')

    // Debug: check if Supabase URL is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      setError('Configuration error: Supabase not configured')
      setLoading(false)
      return
    }

    const { data, error: dbError } = await supabase
      .from('zip_centroids')
      .select('*')
      .eq('zip', zip)
      .single()

    if (dbError || !data) {
      setError('ZIP code not found. Try a nearby ZIP code.')
      setLoading(false)
      return
    }

    saveZip(zip)
    router.push(`/locations?zip=${zip}&lat=${data.lat}&lng=${data.lng}`)
  }

  function handleUseSavedZip() {
    if (savedZip) {
      setZip(savedZip)
      handleFindLocationsWithZip(savedZip)
    }
  }

  async function handleFindLocationsWithZip(zipCode: string) {
    setLoading(true)

    const { data } = await supabase
      .from('zip_centroids')
      .select('*')
      .eq('zip', zipCode)
      .single()

    if (data) {
      router.push(`/locations?zip=${zipCode}&lat=${data.lat}&lng=${data.lng}`)
    } else {
      setError('Saved ZIP code not found')
      setLoading(false)
    }
  }

  function handleQuickSelect(facility: Facility) {
    router.push(`/submit?facilityId=${facility.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white p-4">
        <h1 className="text-xl font-bold text-center">Basis Tracker</h1>
        <p className="text-sm text-center text-green-100 mt-1">
          Track grain basis at local elevators
        </p>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Saved Facilities Quick Access */}
        {savedFacilities.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Your Saved Locations
            </h2>
            <div className="space-y-2">
              {savedFacilities.map(facility => (
                <button
                  key={facility.id}
                  onClick={() => handleQuickSelect(facility)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{facility.name}</div>
                  <div className="text-sm text-gray-500">
                    {facility.city}, {facility.state}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ZIP Code Entry */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Find Locations by ZIP
          </h2>

          <div>
            <label htmlFor="zip" className="sr-only">ZIP Code</label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter ZIP code"
              value={zip}
              onChange={(e) => handleZipChange(e.target.value)}
              className="w-full px-4 py-4 text-xl text-center border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              maxLength={5}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            onClick={handleFindLocations}
            disabled={loading || zip.length !== 5}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Find Locations'}
          </button>

          {savedZip && savedZip !== zip && (
            <button
              onClick={handleUseSavedZip}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Use saved ZIP: {savedZip}
            </button>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-400">
        Crowdsourced basis data
        {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <div className="text-red-500 mt-2">⚠️ Database not configured</div>
        )}
      </footer>
    </div>
  )
}
