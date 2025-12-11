/**
 * Geocoding utilities to convert place names to coordinates
 */

export interface Coordinates {
  latitude: number
  longitude: number
  placeName: string
  country?: string
  state?: string
}

/**
 * Get coordinates using OpenStreetMap Nominatim API (free, no API key required)
 */
export async function getCoordinatesFromPlace(placeName: string): Promise<Coordinates | null> {
  try {
    const encodedPlace = encodeURIComponent(placeName)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedPlace}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AstrologyWebsite/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding API request failed')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    const result = data[0]
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      placeName: result.display_name,
      country: result.address?.country,
      state: result.address?.state
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    return null
  }
}

/**
 * Get timezone from coordinates using TimeZoneDB or similar API
 * For now, returns a simplified timezone estimation
 */
export function getTimezoneFromCoordinates(latitude: number, longitude: number): string {
  // Simplified timezone estimation based on longitude
  // For production, use a proper timezone API
  const timezoneOffset = Math.round(longitude / 15)
  
  // Common timezones for Indian subcontinent
  if (latitude > 6 && latitude < 37 && longitude > 68 && longitude < 97) {
    return 'Asia/Kolkata' // IST
  }
  
  // Default to UTC with offset
  return `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`
}

/**
 * Convert local time to UTC considering timezone
 */
export function localToUTC(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  try {
    // Create date string in ISO format
    const dateTimeStr = `${dateStr}T${timeStr}:00`
    
    // For IST (most common for Indian astrology)
    if (timezone === 'Asia/Kolkata' || timezone === 'IST') {
      const localDate = new Date(dateTimeStr)
      // IST is UTC+5:30
      localDate.setMinutes(localDate.getMinutes() - 330)
      return localDate
    }
    
    // Default: assume input is already in UTC or local browser time
    return new Date(dateTimeStr)
  } catch (error) {
    console.error('Error converting time:', error)
    return new Date()
  }
}

/**
 * Popular cities with pre-configured coordinates (for quick selection)
 */
export const POPULAR_CITIES: { [key: string]: Coordinates } = {
  'Delhi': {
    latitude: 28.6139,
    longitude: 77.2090,
    placeName: 'New Delhi, India',
    country: 'India'
  },
  'Mumbai': {
    latitude: 19.0760,
    longitude: 72.8777,
    placeName: 'Mumbai, Maharashtra, India',
    country: 'India'
  },
  'Bangalore': {
    latitude: 12.9716,
    longitude: 77.5946,
    placeName: 'Bangalore, Karnataka, India',
    country: 'India'
  },
  'Kolkata': {
    latitude: 22.5726,
    longitude: 88.3639,
    placeName: 'Kolkata, West Bengal, India',
    country: 'India'
  },
  'Chennai': {
    latitude: 13.0827,
    longitude: 80.2707,
    placeName: 'Chennai, Tamil Nadu, India',
    country: 'India'
  },
  'Hyderabad': {
    latitude: 17.3850,
    longitude: 78.4867,
    placeName: 'Hyderabad, Telangana, India',
    country: 'India'
  },
  'Pune': {
    latitude: 18.5204,
    longitude: 73.8567,
    placeName: 'Pune, Maharashtra, India',
    country: 'India'
  },
  'Ahmedabad': {
    latitude: 23.0225,
    longitude: 72.5714,
    placeName: 'Ahmedabad, Gujarat, India',
    country: 'India'
  },
  'Jaipur': {
    latitude: 26.9124,
    longitude: 75.7873,
    placeName: 'Jaipur, Rajasthan, India',
    country: 'India'
  },
  'Lucknow': {
    latitude: 26.8467,
    longitude: 80.9462,
    placeName: 'Lucknow, Uttar Pradesh, India',
    country: 'India'
  }
}

/**
 * Search for a city in popular cities or use geocoding
 */
export async function searchPlace(query: string): Promise<Coordinates | null> {
  // First, check popular cities
  const popularCity = POPULAR_CITIES[query]
  if (popularCity) {
    return popularCity
  }

  // Search in popular cities (case-insensitive partial match)
  const matchingCity = Object.entries(POPULAR_CITIES).find(
    ([key]) => key.toLowerCase().includes(query.toLowerCase())
  )
  
  if (matchingCity) {
    return matchingCity[1]
  }

  // Use geocoding API
  return await getCoordinatesFromPlace(query)
}
