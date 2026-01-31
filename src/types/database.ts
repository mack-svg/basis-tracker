export type Database = {
  public: {
    Tables: {
      zip_centroids: {
        Row: {
          zip: string
          lat: number
          lng: number
        }
        Insert: {
          zip: string
          lat: number
          lng: number
        }
        Update: {
          zip?: string
          lat?: number
          lng?: number
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          company: string | null
          city: string
          state: string
          address: string | null
          lat: number
          lng: number
          created_at: string
          is_verified: boolean
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          city: string
          state: string
          address?: string | null
          lat: number
          lng: number
          created_at?: string
          is_verified?: boolean
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          city?: string
          state?: string
          address?: string | null
          lat?: number
          lng?: number
          created_at?: string
          is_verified?: boolean
        }
      }
      basis_reports: {
        Row: {
          id: string
          facility_id: string
          commodity: 'corn' | 'soybeans'
          futures_month: 'H' | 'K' | 'N' | 'U' | 'Z'
          basis_cents: number
          observed_at: string
          submitted_at: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          commodity: 'corn' | 'soybeans'
          futures_month: 'H' | 'K' | 'N' | 'U' | 'Z'
          basis_cents: number
          observed_at?: string
          submitted_at?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          commodity?: 'corn' | 'soybeans'
          futures_month?: 'H' | 'K' | 'N' | 'U' | 'Z'
          basis_cents?: number
          observed_at?: string
          submitted_at?: string
          user_id?: string
          created_at?: string
        }
      }
      saved_facilities: {
        Row: {
          user_id: string
          facility_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          facility_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          facility_id?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_nearby_facilities: {
        Args: {
          p_lat: number
          p_lng: number
          p_radius_miles?: number
        }
        Returns: {
          id: string
          name: string
          company: string | null
          city: string
          state: string
          address: string | null
          lat: number
          lng: number
          distance_miles: number
        }[]
      }
      get_current_basis: {
        Args: {
          p_facility_id: string
          p_commodity: string
          p_futures_month: string
        }
        Returns: {
          median_basis: number | null
          report_count: number
          is_stale: boolean
          last_updated: string | null
        }[]
      }
      get_basis_trend: {
        Args: {
          p_facility_id: string
          p_commodity: string
          p_futures_month: string
        }
        Returns: {
          day: string
          median_basis: number
          report_count: number
        }[]
      }
      get_facility_stats: {
        Args: {
          p_facility_id: string
          p_commodity: string
          p_futures_month: string
        }
        Returns: {
          reports_7d: number
          last_report_at: string | null
        }[]
      }
    }
  }
}

export type Facility = Database['public']['Tables']['facilities']['Row']
export type BasisReport = Database['public']['Tables']['basis_reports']['Row']
export type SavedFacility = Database['public']['Tables']['saved_facilities']['Row']
export type ZipCentroid = Database['public']['Tables']['zip_centroids']['Row']

export type NearbyFacility = Database['public']['Functions']['get_nearby_facilities']['Returns'][0]
export type CurrentBasis = Database['public']['Functions']['get_current_basis']['Returns'][0]
export type BasisTrend = Database['public']['Functions']['get_basis_trend']['Returns'][0]
export type FacilityStats = Database['public']['Functions']['get_facility_stats']['Returns'][0]

export type Commodity = 'corn' | 'soybeans'
export type FuturesMonth = 'H' | 'K' | 'N' | 'U' | 'Z'

export const FUTURES_MONTHS: { value: FuturesMonth; label: string }[] = [
  { value: 'H', label: 'Mar (H)' },
  { value: 'K', label: 'May (K)' },
  { value: 'N', label: 'Jul (N)' },
  { value: 'U', label: 'Sep (U)' },
  { value: 'Z', label: 'Dec (Z)' },
]
