'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/user'
import type { Facility, Commodity, FuturesMonth } from '@/types/database'
import { FUTURES_MONTHS, COMMODITIES } from '@/types/database'
import Link from 'next/link'

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const facilityId = searchParams.get('facilityId')

  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [commodity, setCommodity] = useState<Commodity>('corn')
  const [futuresMonth, setFuturesMonth] = useState<FuturesMonth>('H')
  const [basisCents, setBasisCents] = useState('')
  const [error, setError] = useState('')

  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [isFacilitySaved, setIsFacilitySaved] = useState(false)

  useEffect(() => {
    if (facilityId) {
      loadFacility()
      checkIfSaved()
    }
  }, [facilityId])

  async function loadFacility() {
    const { data } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', facilityId)
      .single()

    if (data) {
      setFacility(data)
    }
    setLoading(false)
  }

  async function checkIfSaved() {
    const userId = getUserId()
    if (!userId || !facilityId) return

    const { data } = await supabase
      .from('saved_facilities')
      .select('facility_id')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .single()

    setIsFacilitySaved(!!data)
  }

  function handleBasisChange(value: string) {
    // Allow minus sign and digits
    const cleaned = value.replace(/[^\d-]/g, '')
    // Only allow minus at the beginning
    if (cleaned.startsWith('-')) {
      setBasisCents('-' + cleaned.slice(1).replace(/-/g, ''))
    } else {
      setBasisCents(cleaned.replace(/-/g, ''))
    }
    setError('')
  }

  async function handleSubmit() {
    const basis = parseInt(basisCents)

    if (isNaN(basis)) {
      setError('Please enter a valid basis value')
      return
    }

    if (basis < -200 || basis > 200) {
      const confirmed = confirm(
        `Basis of ${basis} cents seems unusual. Are you sure this is correct?`
      )
      if (!confirmed) return
    }

    setSubmitting(true)
    setError('')

    const userId = getUserId()

    const { error: dbError } = await supabase
      .from('basis_reports')
      .insert({
        facility_id: facilityId!,
        commodity,
        futures_month: futuresMonth,
        basis_cents: basis,
        user_id: userId,
      } as any)

    if (dbError) {
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSubmitted(true)

    // Show save prompt if not already saved
    if (!isFacilitySaved) {
      setShowSavePrompt(true)
    }
  }

  async function handleSaveFacility(save: boolean) {
    if (save && facilityId) {
      const userId = getUserId()
      await supabase
        .from('saved_facilities')
        .insert({
          user_id: userId,
          facility_id: facilityId,
        } as any)
      setIsFacilitySaved(true)
    }
    setShowSavePrompt(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">Facility not found</p>
        <Link href="/" className="text-green-600 font-medium">
          Go Home
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-green-700 text-white p-4">
          <h1 className="text-lg font-bold text-center">Submitted!</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          {showSavePrompt ? (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-center mb-4">
                Save this location?
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Quick access next time you visit
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleSaveFacility(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
                >
                  Yes, Save It
                </button>
                <button
                  onClick={() => handleSaveFacility(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
                >
                  No Thanks
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Thank You!</h2>
                <p className="text-gray-500 mt-2">
                  Your basis report has been submitted
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {parseInt(basisCents) > 0 ? '+' : ''}{basisCents}¢
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {commodity === 'corn' ? 'Corn' : 'Soybeans'} • {FUTURES_MONTHS.find(m => m.value === futuresMonth)?.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {facility.name}
                  </div>
                </div>
              </div>

              <div className="space-y-3 w-full max-w-sm">
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setBasisCents('')
                  }}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold"
                >
                  Submit Another
                </button>
                <Link
                  href={`/trends?facilityId=${facilityId}&commodity=${commodity}&month=${futuresMonth}`}
                  className="block w-full text-center bg-gray-100 text-gray-700 py-4 rounded-lg font-semibold"
                >
                  View Trends
                </Link>
                <Link
                  href="/"
                  className="block w-full text-center text-gray-500 py-3"
                >
                  Done
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
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
          <div>
            <h1 className="text-lg font-bold">Submit Basis</h1>
            <p className="text-sm text-green-100">{facility.name}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Commodity Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commodity
          </label>
          <div className="grid grid-cols-2 gap-3">
            {COMMODITIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCommodity(c.value)}
                style={commodity === c.value ? { backgroundColor: c.color } : {}}
                className={`py-4 rounded-lg font-semibold text-lg transition-colors ${
                  commodity === c.value
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Futures Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Futures Month
          </label>
          <select
            value={futuresMonth}
            onChange={(e) => setFuturesMonth(e.target.value as FuturesMonth)}
            className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white"
          >
            {FUTURES_MONTHS.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Basis Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Basis (cents)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="-22"
              value={basisCents}
              onChange={(e) => handleBasisChange(e.target.value)}
              className="w-full px-4 py-6 text-3xl text-center font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
              ¢
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Enter negative for under futures (e.g., -22)
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={handleSubmit}
          disabled={submitting || !basisCents}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Basis'}
        </button>
      </div>
    </div>
  )
}
