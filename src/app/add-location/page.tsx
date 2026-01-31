'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export default function AddLocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zip = searchParams.get('zip') || ''
  const defaultLat = searchParams.get('lat') || ''
  const defaultLng = searchParams.get('lng') || ''

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('IA')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(defaultLat)
  const [lng, setLng] = useState(defaultLng)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  async function handleGeocode() {
    if (!city || !state) {
      setError('Please enter city and state to geocode')
      return
    }

    setGeocoding(true)
    setError('')

    try {
      // Use Nominatim (OpenStreetMap) for free geocoding
      const query = encodeURIComponent(`${address ? address + ', ' : ''}${city}, ${state}, USA`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        {
          headers: {
            'User-Agent': 'BasisTracker/1.0',
          },
        }
      )

      const results = await response.json()

      if (results && results.length > 0) {
        setLat(parseFloat(results[0].lat).toFixed(6))
        setLng(parseFloat(results[0].lon).toFixed(6))
      } else {
        setError('Could not find coordinates. Please enter manually.')
      }
    } catch (e) {
      setError('Geocoding failed. Please enter coordinates manually.')
    }

    setGeocoding(false)
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter a facility name')
      return
    }
    if (!city.trim()) {
      setError('Please enter a city')
      return
    }
    if (!lat || !lng) {
      setError('Please geocode or enter coordinates')
      return
    }

    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Invalid coordinates')
      return
    }

    // Basic sanity check for US coordinates
    if (latNum < 24 || latNum > 50 || lngNum < -125 || lngNum > -66) {
      setError('Coordinates appear to be outside the continental US')
      return
    }

    setSubmitting(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('facilities')
      .insert({
        name: name.trim(),
        company: company.trim() || null,
        city: city.trim(),
        state,
        address: address.trim() || null,
        lat: latNum,
        lng: lngNum,
        is_verified: false,
      })
      .select()
      .single()

    if (dbError) {
      setError('Failed to add location. Please try again.')
      setSubmitting(false)
      return
    }

    // Navigate to submit page for this new facility
    router.push(`/submit?facilityId=${data.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-green-600 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Add Missing Location</h1>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facility Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Heartland Co-op"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., ADM, Cargill"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            >
              {US_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address (optional, helps with geocoding)
          </label>
          <input
            type="text"
            placeholder="123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
        </div>

        {/* Geocode Button */}
        <button
          onClick={handleGeocode}
          disabled={geocoding || !city}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {geocoding ? 'Finding coordinates...' : 'Auto-find Coordinates'}
        </button>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="text"
              placeholder="41.9779"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="text"
              placeholder="-91.6656"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <p className="text-xs text-gray-500">
          New locations will be reviewed by the community. Please ensure accuracy.
        </p>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={handleSubmit}
          disabled={submitting || !name || !city || !lat || !lng}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Location'}
        </button>
      </div>
    </div>
  )
}
