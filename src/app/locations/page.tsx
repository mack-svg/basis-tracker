'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { NearbyFacility } from '@/types/database'
import Link from 'next/link'

export default function LocationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const zip = searchParams.get('zip') || ''
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')

  const [facilities, setFacilities] = useState<NearbyFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState(30)

  useEffect(() => {
    if (lat && lng) {
      loadFacilities()
    }
  }, [lat, lng, radius])

  async function loadFacilities() {
    setLoading(true)

    const { data, error } = await supabase
      .rpc('get_nearby_facilities', {
        p_lat: lat,
        p_lng: lng,
        p_radius_miles: radius,
      })

    if (data) {
      setFacilities(data)
    }

    setLoading(false)
  }

  const filteredFacilities = useMemo(() => {
    if (!search.trim()) return facilities

    const searchLower = search.toLowerCase()
    return facilities.filter(f =>
      f.name.toLowerCase().includes(searchLower) ||
      f.city.toLowerCase().includes(searchLower) ||
      (f.company && f.company.toLowerCase().includes(searchLower))
    )
  }, [facilities, search])

  function handleSelectFacility(facility: NearbyFacility) {
    router.push(`/submit?facilityId=${facility.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-green-600 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Locations near {zip}</h1>
            <p className="text-sm text-green-100">Within {radius} miles</p>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="p-4 bg-white border-b space-y-3">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        />

        <div className="flex gap-2">
          {[30, 50, 100].map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                radius === r
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r} mi
            </button>
          ))}
        </div>
      </div>

      {/* Facilities List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-3" />
            Loading locations...
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {search ? 'No locations match your search' : 'No locations found nearby'}
            </p>
            <Link
              href={`/add-location?zip=${zip}&lat=${lat}&lng=${lng}`}
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg font-medium"
            >
              Add Missing Location
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {filteredFacilities.map(facility => (
              <button
                key={facility.id}
                onClick={() => handleSelectFacility(facility)}
                className="w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {facility.name}
                    </div>
                    {facility.company && (
                      <div className="text-sm text-gray-500">{facility.company}</div>
                    )}
                    <div className="text-sm text-gray-500">
                      {facility.city}, {facility.state}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {facility.distance_miles.toFixed(1)} mi
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Location Button */}
      {!loading && facilities.length > 0 && (
        <div className="p-4 border-t bg-white">
          <Link
            href={`/add-location?zip=${zip}&lat=${lat}&lng=${lng}`}
            className="block w-full text-center py-3 text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors"
          >
            + Add Missing Location
          </Link>
        </div>
      )}
    </div>
  )
}
