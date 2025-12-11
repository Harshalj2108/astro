/**
 * JPL Horizons Ephemeris Integration
 * 
 * This module provides high-precision planetary positions using NASA JPL Horizons API.
 * Replaces simplified algorithms with JPL-quality ephemerides.
 * 
 * Features:
 * - Vector positions from JPL Horizons REST API
 * - Fortran 'D' exponent parsing
 * - Ecliptic and equatorial coordinate conversions
 * - Rate limiting and exponential backoff
 * - In-memory caching with TTL
 */

// JPL Horizons planet codes
export const JPL_BODY_CODES = {
  SUN: '10',          // Sun
  MOON: '301',        // Moon (geocentric)
  MERCURY: '199',     // Mercury barycenter
  VENUS: '299',       // Venus barycenter
  MARS: '499',        // Mars barycenter
  JUPITER: '599',     // Jupiter barycenter
  SATURN: '699',      // Saturn barycenter
  URANUS: '799',      // Uranus barycenter
  NEPTUNE: '899',     // Neptune barycenter
  PLUTO: '999',       // Pluto barycenter
} as const

// Rahu/Ketu (lunar nodes) need special calculation
export const LUNAR_NODE = '301' // Moon for node calculation

// J2000 obliquity of ecliptic in degrees
export const OBLIQUITY_J2000 = 23.439291111

// Cache configuration
interface CacheEntry {
  data: HorizonsResponse
  timestamp: number
}

const CACHE: Map<string, CacheEntry> = new Map()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Rate limiting
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 1000 // 1 second between requests
let consecutiveErrors = 0
const MAX_RETRIES = 3

/**
 * JPL Horizons API response structure
 */
export interface HorizonsResponse {
  x: number      // X position (km)
  y: number      // Y position (km)
  z: number      // Z position (km)
  vx: number     // X velocity (km/s)
  vy: number     // Y velocity (km/s)
  vz: number     // Z velocity (km/s)
  jd: number     // Julian Day
  bodyCode: string
}

/**
 * Ecliptic coordinates
 */
export interface EclipticCoords {
  lambda: number  // Ecliptic longitude (degrees, 0-360)
  beta: number    // Ecliptic latitude (degrees, -90 to +90)
  radius: number  // Distance from origin (km)
}

/**
 * Equatorial coordinates
 */
export interface EquatorialCoords {
  ra: number      // Right Ascension (degrees, 0-360)
  dec: number     // Declination (degrees, -90 to +90)
  radius: number  // Distance (km)
}

/**
 * Configuration for ephemeris backend
 */
export interface EphemerisConfig {
  backend: 'HORIZONS' | 'SPICE' | 'SWISS_EPHEM'
  vectCorr: 'NONE' | 'LT' | 'LT+S'  // Light-time and stellar aberration corrections
  center: string  // Observer location (e.g., '500@399' for geocentric)
}

/**
 * Get ephemeris backend from environment variable
 */
export function getEphemerisBackend(): EphemerisConfig['backend'] {
  const backend = process.env.EPHEMERIS_BACKEND?.toUpperCase()
  if (backend === 'SPICE' || backend === 'SWISS_EPHEM') {
    return backend
  }
  return 'HORIZONS' // Default
}

/**
 * Parse Fortran 'D' exponent notation to JavaScript number
 * Examples: '1.234D+05' -> 123400, '-2.5D-03' -> -0.0025
 */
export function parseFortranNumber(str: string): number {
  const normalized = str.replace(/D([+-])/gi, 'E$1')
  return parseFloat(normalized)
}

/**
 * Generate cache key for Horizons request
 */
function getCacheKey(bodyCode: string, jd: number, config: EphemerisConfig): string {
  return `${bodyCode}_${jd.toFixed(6)}_${config.center}_${config.vectCorr}`
}

/**
 * Get cached data if available and not expired
 */
function getCached(key: string): HorizonsResponse | null {
  const entry = CACHE.get(key)
  if (!entry) return null
  
  const age = Date.now() - entry.timestamp
  if (age > CACHE_TTL_MS) {
    CACHE.delete(key)
    return null
  }
  
  return entry.data
}

/**
 * Store data in cache
 */
function setCached(key: string, data: HorizonsResponse): void {
  CACHE.set(key, {
    data,
    timestamp: Date.now()
  })
  
  // Limit cache size
  if (CACHE.size > 1000) {
    const oldestKey = CACHE.keys().next().value
    if (oldestKey) CACHE.delete(oldestKey)
  }
}

/**
 * Exponential backoff delay
 */
async function backoffDelay(attempt: number): Promise<void> {
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
  await new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Rate limiting: ensure minimum time between requests
 */
async function rateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastRequestTime = Date.now()
}

/**
 * Parse JPL Horizons vector table result
 * Extracts position and velocity vectors from $$SOE...$$EOE block
 */
export function parseHorizonsResult(resultText: string, bodyCode: string): HorizonsResponse {
  // Find the data block between $$SOE and $$EOE
  const soeIndex = resultText.indexOf('$$SOE')
  const eoeIndex = resultText.indexOf('$$EOE')
  
  if (soeIndex === -1 || eoeIndex === -1) {
    throw new Error('Invalid Horizons response: missing $$SOE or $$EOE markers')
  }
  
  const dataBlock = resultText.substring(soeIndex + 5, eoeIndex).trim()
  const lines = dataBlock.split('\n').filter(line => line.trim().length > 0)
  
  if (lines.length === 0) {
    throw new Error('No data lines found in Horizons response')
  }
  
  // Parse the data line(s)
  // Format: JDTDB, Calendar_Date, X, Y, Z, VX, VY, VZ
  // We need the position (X, Y, Z) and velocity (VX, VY, VZ) vectors
  
  let x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0, jd = 0
  
  // Find lines with numeric data
  for (const line of lines) {
    const tokens = line.trim().split(/\s+/)
    
    // Extract numeric tokens (handle Fortran D notation)
    const numbers: number[] = []
    for (const token of tokens) {
      if (/^[+-]?\d/.test(token) && (token.includes('E') || token.includes('D') || token.includes('.'))) {
        try {
          numbers.push(parseFortranNumber(token))
        } catch (e) {
          // Skip non-numeric tokens
        }
      }
    }
    
    // We expect at least 7 numbers: JD, X, Y, Z, VX, VY, VZ
    if (numbers.length >= 7) {
      jd = numbers[0]
      x = numbers[1]
      y = numbers[2]
      z = numbers[3]
      vx = numbers[4]
      vy = numbers[5]
      vz = numbers[6]
      break
    } else if (numbers.length >= 6) {
      // Sometimes JD is on previous line
      x = numbers[0]
      y = numbers[1]
      z = numbers[2]
      vx = numbers[3]
      vy = numbers[4]
      vz = numbers[5]
    }
  }
  
  if (x === 0 && y === 0 && z === 0) {
    throw new Error(`Failed to parse position vectors from Horizons response`)
  }
  
  return { x, y, z, vx, vy, vz, jd, bodyCode }
}

/**
 * Fetch planetary position from JPL Horizons API
 */
export async function fetchHorizonsPosition(
  bodyCode: string,
  jd: number,
  config: EphemerisConfig = {
    backend: 'HORIZONS',
    vectCorr: 'LT+S', // Apparent position with light-time and stellar aberration
    center: '500@399' // Geocentric (Earth center)
  }
): Promise<HorizonsResponse> {
  // Check cache first
  const cacheKey = getCacheKey(bodyCode, jd, config)
  const cached = getCached(cacheKey)
  if (cached) {
    return cached
  }
  
  // Rate limiting
  await rateLimit()
  
  // Convert JD to date string for Horizons
  const startJD = jd
  const stopJD = jd + 1 // One day range
  
  // Build Horizons API URL
  const baseUrl = 'https://ssd.jpl.nasa.gov/api/horizons.api'
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: bodyCode,
    CENTER: config.center,
    EPHEM_TYPE: 'VECTOR',
    START_TIME: `JD${startJD.toFixed(10)}`,
    STOP_TIME: `JD${stopJD.toFixed(10)}`,
    STEP_SIZE: '1d',
    REF_PLANE: 'ECLIPTIC',
    REF_SYSTEM: 'J2000',
    VECT_CORR: config.vectCorr,
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '3',
    VEC_LABELS: 'YES',
    CSV_FORMAT: 'NO'
  })
  
  const url = `${baseUrl}?${params.toString()}`
  
  let lastError: Error | null = null
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AstrologyWebsite/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Horizons API returned status ${response.status}: ${response.statusText}`)
      }
      
      const json = await response.json()
      
      if (!json.result) {
        throw new Error('Horizons response missing result field')
      }
      
      // Parse the result
      const result = parseHorizonsResult(json.result, bodyCode)
      
      // Cache successful result
      setCached(cacheKey, result)
      
      // Reset error counter on success
      consecutiveErrors = 0
      
      return result
      
    } catch (error) {
      lastError = error as Error
      consecutiveErrors++
      
      console.error(`Horizons API error (attempt ${attempt + 1}/${MAX_RETRIES}):`, error)
      
      if (attempt < MAX_RETRIES - 1) {
        await backoffDelay(attempt)
      }
    }
  }
  
  throw new Error(`Failed to fetch from Horizons after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}

/**
 * Convert Cartesian ecliptic vectors to ecliptic longitude/latitude
 * @param x X coordinate (km)
 * @param y Y coordinate (km)
 * @param z Z coordinate (km)
 * @returns Ecliptic coordinates (lambda, beta, radius)
 */
export function vectorsToEcliptic(x: number, y: number, z: number): EclipticCoords {
  const radius = Math.sqrt(x * x + y * y + z * z)
  
  // Ecliptic longitude (lambda): atan2(y, x)
  let lambda = Math.atan2(y, x) * 180 / Math.PI
  
  // Normalize to 0-360
  while (lambda < 0) lambda += 360
  while (lambda >= 360) lambda -= 360
  
  // Ecliptic latitude (beta): asin(z / r)
  const beta = Math.asin(z / radius) * 180 / Math.PI
  
  return { lambda, beta, radius }
}

/**
 * Convert ecliptic coordinates to equatorial coordinates (RA/Dec)
 * @param lambda Ecliptic longitude (degrees)
 * @param beta Ecliptic latitude (degrees)
 * @param obliquity Obliquity of ecliptic (degrees), defaults to J2000
 * @returns Right Ascension and Declination
 */
export function eclipticToEquatorial(
  lambda: number,
  beta: number,
  radius: number,
  obliquity: number = OBLIQUITY_J2000
): EquatorialCoords {
  const lambdaRad = lambda * Math.PI / 180
  const betaRad = beta * Math.PI / 180
  const oblRad = obliquity * Math.PI / 180
  
  // Convert to equatorial
  const cosLambda = Math.cos(lambdaRad)
  const sinLambda = Math.sin(lambdaRad)
  const cosBeta = Math.cos(betaRad)
  const sinBeta = Math.sin(betaRad)
  const cosObl = Math.cos(oblRad)
  const sinObl = Math.sin(oblRad)
  
  // RA: atan2(sin(lambda) * cos(obliquity) - tan(beta) * sin(obliquity), cos(lambda))
  const ra = Math.atan2(
    sinLambda * cosObl - Math.tan(betaRad) * sinObl,
    cosLambda
  ) * 180 / Math.PI
  
  // Dec: asin(sin(beta) * cos(obliquity) + cos(beta) * sin(obliquity) * sin(lambda))
  const dec = Math.asin(
    sinBeta * cosObl + cosBeta * sinObl * sinLambda
  ) * 180 / Math.PI
  
  // Normalize RA to 0-360
  let raNormalized = ra
  while (raNormalized < 0) raNormalized += 360
  while (raNormalized >= 360) raNormalized -= 360
  
  return { ra: raNormalized, dec, radius }
}

/**
 * Calculate Greenwich Mean Sidereal Time (GMST) in degrees
 * @param jd Julian Day (TDB or UT1)
 * @returns GMST in degrees
 */
export function calculateGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0
  
  // GMST at 0h UT (IAU 1982 formula)
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
             0.000387933 * T * T - T * T * T / 38710000.0
  
  // Normalize to 0-360
  while (gmst < 0) gmst += 360
  while (gmst >= 360) gmst -= 360
  
  return gmst
}

/**
 * Calculate Local Sidereal Time (LST) in degrees
 * @param jd Julian Day
 * @param longitude Observer's longitude (degrees, positive East)
 * @returns LST in degrees
 */
export function calculateLST(jd: number, longitude: number): number {
  const gmst = calculateGMST(jd)
  let lst = gmst + longitude
  
  // Normalize to 0-360
  while (lst < 0) lst += 360
  while (lst >= 360) lst -= 360
  
  return lst
}

/**
 * Clear the ephemeris cache
 */
export function clearCache(): void {
  CACHE.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxAge: number } {
  let maxAge = 0
  const now = Date.now()
  
  for (const entry of CACHE.values()) {
    const age = now - entry.timestamp
    if (age > maxAge) maxAge = age
  }
  
  return {
    size: CACHE.size,
    maxAge: Math.floor(maxAge / 1000) // seconds
  }
}
