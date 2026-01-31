'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Facility, Commodity, FuturesMonth, CurrentBasis, BasisTrend, FacilityStats } from '@/types/database'
import { FUTURES_MONTHS } from '@/types/database'
import Link from 'next/link'
import BasisChart from '@/components/BasisChart'

export default function TrendsPage() {
  const searchParams = useSearchParams()
  const facilityId = searchParams.get('facilityId')
  const initialCommodity = (searchParams.get('commodity') as Commodity) || 'corn'
  const initialMonth = (searchParams.get('month') as FuturesMonth) || 'H'

  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)

  const [commodity, setCommodity] = useState<Commodity>(initialCommodity)
  const [futuresMonth, setFuturesMonth] = useState<FuturesMonth>(initialMonth)

  const [currentBasis, setCurrentBasis] = useState<CurrentBasis | null>(null)
  const [trend, setTrend] = useState<BasisTrend[]>([])
  const [stats, setStats] = useState<FacilityStats | null>(null)

  useEffect(() => {
    if (facilityId) {
      loadFacility()
    }
  }, [facilityId])

  useEffect(() => {
    if (facilityId) {
      loadBasisData()
    }
  }, [facilityId, commodity, futuresMonth])

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

  async function loadBasisData() {
    // Load current basis
    const { data: basisData } = await supabase
      .rpc('get_current_basis', {
        p_facility_id: facilityId!,
        p_commodity: commodity,
        p_futures_month: futuresMonth,
      })

    if (basisData && basisData.length > 0) {
      setCurrentBasis(basisData[0])
    } else {
      setCurrentBasis(null)
    }

    // Load trend
    const { data: trendData } = await supabase
      .rpc('get_basis_trend', {
        p_facility_id: facilityId!,
        p_commodity: commodity,
        p_futures_month: futuresMonth,
      })

    if (trendData) {
      setTrend(trendData)
    }

    // Load stats
    const { data: statsData } = await supabase
      .rpc('get_facility_stats', {
        p_facility_id: facilityId!,
        p_commodity: commodity,
        p_futures_month: futuresMonth,
      })

    if (statsData && statsData.length > 0) {
      setStats(statsData[0])
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function getTimeSince(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
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

  const isStale = currentBasis?.is_stale || !currentBasis?.last_updated

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
            <h1 className="text-lg font-bold">{facility.name}</h1>
            <p className="text-sm text-green-100">
              {facility.city}, {facility.state}
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCommodity('corn')}
            className={`py-3 rounded-lg font-semibold transition-colors ${
              commodity === 'corn'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Corn
          </button>
          <button
            onClick={() => setCommodity('soybeans')}
            className={`py-3 rounded-lg font-semibold transition-colors ${
              commodity === 'soybeans'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Soybeans
          </button>
        </div>

        <select
          value={futuresMonth}
          onChange={(e) => setFuturesMonth(e.target.value as FuturesMonth)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white"
        >
          {FUTURES_MONTHS.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Current Basis Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            {currentBasis?.median_basis !== null && currentBasis?.median_basis !== undefined ? (
              <>
                <div className={`text-5xl font-bold ${
                  currentBasis.median_basis >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentBasis.median_basis > 0 ? '+' : ''}{currentBasis.median_basis}¢
                </div>
                <div className="text-gray-500 mt-2">
                  Latest Basis
                  {isStale && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Stale
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-300">--</div>
                <div className="text-gray-500 mt-2">No recent data</div>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.reports_7d || 0}
            </div>
            <div className="text-sm text-gray-500">Reports (7d)</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-lg font-medium text-gray-900">
              {stats?.last_report_at ? getTimeSince(stats.last_report_at) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Last Updated</div>
          </div>
        </div>

        {/* Chart */}
        {trend.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              30-Day Trend
            </h3>
            <BasisChart data={trend} commodity={commodity} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No trend data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit a report to start tracking
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-white border-t">
        <Link
          href={`/submit?facilityId=${facilityId}`}
          className="block w-full text-center bg-green-600 text-white py-4 rounded-lg font-semibold text-lg"
        >
          Submit New Basis
        </Link>
      </div>
    </div>
  )
}
