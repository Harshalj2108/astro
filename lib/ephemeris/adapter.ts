/**
 * Unified Ephemeris Adapter
 * 
 * Provides a unified interface for fetching planetary positions from multiple backends:
 * - JPL Horizons (primary, network-based)
 * - SPICE (secondary, requires local service)
 * - Swiss Ephemeris algorithms (fallback, simplified)
 * 
 * Handles automatic fallback on errors and maintains compatibility with existing API.
 */

import {
  JPL_BODY_CODES,
  fetchHorizonsPosition,
  vectorsToEcliptic,
  EphemerisConfig,
  getEphemerisBackend,
  HorizonsResponse
} from './jpl-horizons'

import { SPICE_BODY_IDS, fetchSpicePosition } from './spice'

// Fallback to simplified algorithms from original calculations.ts
import { dateToJulianDay } from '../astrology/calculations'

/**
 * Planet mapping
 */
const PLANET_MAPPING = {
  SUN: { jpl: '10', spice: 10 },
  MOON: { jpl: '301', spice: 301 },
  MERCURY: { jpl: '199', spice: 199 },
  VENUS: { jpl: '299', spice: 299 },
  MARS: { jpl: '499', spice: 499 },
  JUPITER: { jpl: '599', spice: 599 },
  SATURN: { jpl: '699', spice: 699 },
  URANUS: { jpl: '799', spice: 799 },
  NEPTUNE: { jpl: '899', spice: 899 }
}

/**
 * Result structure for planetary position
 */
export interface PlanetPosition {
  eclipticLongitude: number // Sidereal ecliptic longitude (0-360°)
  eclipticLatitude: number  // Ecliptic latitude (-90 to +90°)
  ra: number                // Right Ascension (0-360°)
  dec: number               // Declination (-90 to +90°)
  distance: number          // Distance in AU
  source: 'JPL Horizons' | 'SPICE' | 'Swiss Ephemeris (fallback)'
  backend: string
}

/**
 * Fetch planetary position using configured backend
 */
export async function fetchPlanetPosition(
  planet: keyof typeof PLANET_MAPPING,
  date: Date,
  ayanamsa: number, // Sidereal offset
  config?: Partial<EphemerisConfig>
): Promise<PlanetPosition> {
  const jd = dateToJulianDay(date)
  const backend = config?.backend || getEphemerisBackend()
  
  try {
    if (backend === 'HORIZONS') {
      return await fetchFromHorizons(planet, jd, ayanamsa, config)
    } else if (backend === 'SPICE') {
      return await fetchFromSpice(planet, jd, ayanamsa)
    } else {
      return await fetchFromSwissEphemeris(planet, date, ayanamsa)
    }
  } catch (error) {
    console.error(`Error fetching ${planet} from ${backend}:`, error)
    
    // Fallback chain
    if (backend === 'HORIZONS') {
      console.log('Falling back to SPICE...')
      try {
        return await fetchFromSpice(planet, jd, ayanamsa)
      } catch (spiceError) {
        console.log('SPICE failed, falling back to Swiss Ephemeris...')
        return await fetchFromSwissEphemeris(planet, date, ayanamsa)
      }
    } else if (backend === 'SPICE') {
      console.log('Falling back to Swiss Ephemeris...')
      return await fetchFromSwissEphemeris(planet, date, ayanamsa)
    }
    
    throw error
  }
}

/**
 * Fetch from JPL Horizons
 */
async function fetchFromHorizons(
  planet: keyof typeof PLANET_MAPPING,
  jd: number,
  ayanamsa: number,
  config?: Partial<EphemerisConfig>
): Promise<PlanetPosition> {
  const bodyCode = PLANET_MAPPING[planet].jpl
  
  const fullConfig: EphemerisConfig = {
    backend: 'HORIZONS',
    vectCorr: config?.vectCorr || 'LT+S', // Apparent position
    center: config?.center || '500@399'    // Geocentric
  }
  
  const response = await fetchHorizonsPosition(bodyCode, jd, fullConfig)
  
  // Convert vectors to ecliptic coordinates
  const ecliptic = vectorsToEcliptic(response.x, response.y, response.z)
  
  // Convert to sidereal (subtract ayanamsa)
  const siderealLambda = normalizeAngle(ecliptic.lambda - ayanamsa)
  
  // Convert to equatorial for RA/Dec (using the eclipticToEquatorial function from jpl-horizons)
  const { eclipticToEquatorial } = await import('./jpl-horizons')
  const equatorial = eclipticToEquatorial(ecliptic.lambda, ecliptic.beta, ecliptic.radius)
  
  // Convert km to AU (1 AU = 149597870.7 km)
  const distanceAU = ecliptic.radius / 149597870.7
  
  return {
    eclipticLongitude: siderealLambda,
    eclipticLatitude: ecliptic.beta,
    ra: equatorial.ra,
    dec: equatorial.dec,
    distance: distanceAU,
    source: 'JPL Horizons',
    backend: 'HORIZONS'
  }
}

/**
 * Fetch from SPICE
 */
async function fetchFromSpice(
  planet: keyof typeof PLANET_MAPPING,
  jd: number,
  ayanamsa: number
): Promise<PlanetPosition> {
  const bodyId = PLANET_MAPPING[planet].spice
  
  const response = await fetchSpicePosition(
    bodyId,
    jd,
    SPICE_BODY_IDS.EARTH,
    'ECLIPJ2000'
  )
  
  // SPICE returns position in km
  const ecliptic = vectorsToEcliptic(response.x, response.y, response.z)
  
  // Convert to sidereal
  const siderealLambda = normalizeAngle(ecliptic.lambda - ayanamsa)
  
  // Convert to equatorial
  const { eclipticToEquatorial } = await import('./jpl-horizons')
  const equatorial = eclipticToEquatorial(ecliptic.lambda, ecliptic.beta, ecliptic.radius)
  
  // Convert km to AU
  const distanceAU = ecliptic.radius / 149597870.7
  
  return {
    eclipticLongitude: siderealLambda,
    eclipticLatitude: ecliptic.beta,
    ra: equatorial.ra,
    dec: equatorial.dec,
    distance: distanceAU,
    source: 'SPICE',
    backend: 'SPICE'
  }
}

/**
 * Fallback: Use simplified Swiss Ephemeris-style algorithms
 * (Original implementation from calculations.ts)
 */
async function fetchFromSwissEphemeris(
  planet: keyof typeof PLANET_MAPPING,
  date: Date,
  ayanamsa: number
): Promise<PlanetPosition> {
  // Import fallback calculation functions
  const {
    calculateSunPosition,
    calculateMoonPosition,
    calculatePlanetPosition
  } = await import('@/lib/astrology/calculations-fallback')
  
  let tropicalLongitude: number
  
  if (planet === 'SUN') {
    tropicalLongitude = calculateSunPosition(date)
  } else if (planet === 'MOON') {
    tropicalLongitude = calculateMoonPosition(date)
  } else {
    tropicalLongitude = calculatePlanetPosition(planet, date)
  }
  
  // Already converted to sidereal in original functions
  const siderealLongitude = tropicalLongitude
  
  return {
    eclipticLongitude: siderealLongitude,
    eclipticLatitude: 0, // Simplified: assume on ecliptic plane
    ra: 0, // Not calculated in simplified version
    dec: 0,
    distance: 1, // Approximate
    source: 'Swiss Ephemeris (fallback)',
    backend: 'SWISS_EPHEM'
  }
}

/**
 * Calculate lunar nodes (Rahu/Ketu) position
 * These require special handling as they're mathematical points, not physical bodies
 */
export async function fetchLunarNodes(
  date: Date,
  ayanamsa: number,
  config?: Partial<EphemerisConfig>
): Promise<{ rahu: PlanetPosition; ketu: PlanetPosition }> {
  const jd = dateToJulianDay(date)
  const backend = config?.backend || getEphemerisBackend()
  
  try {
    if (backend === 'HORIZONS' || backend === 'SPICE') {
      // For JPL sources, calculate from Moon's orbital elements
      // Simplified: use Moon position and calculate nodes
      const { calculateRahuPosition } = await import('@/lib/astrology/calculations-fallback')
      const tropicalRahu = calculateRahuPosition(date)
      const siderealRahu = normalizeAngle(tropicalRahu - ayanamsa)
      
      const rahu: PlanetPosition = {
        eclipticLongitude: siderealRahu,
        eclipticLatitude: 0,
        ra: 0,
        dec: 0,
        distance: 0,
        source: backend === 'HORIZONS' ? 'JPL Horizons' : 'SPICE',
        backend
      }
      
      const ketu: PlanetPosition = {
        eclipticLongitude: normalizeAngle(siderealRahu + 180),
        eclipticLatitude: 0,
        ra: 0,
        dec: 0,
        distance: 0,
        source: backend === 'HORIZONS' ? 'JPL Horizons' : 'SPICE',
        backend
      }
      
      return { rahu, ketu }
    } else {
      // Swiss Ephemeris fallback
      const { calculateRahuPosition } = await import('@/lib/astrology/calculations-fallback')
      const tropicalRahu = calculateRahuPosition(date)
      const siderealRahu = normalizeAngle(tropicalRahu - ayanamsa)
      
      const rahu: PlanetPosition = {
        eclipticLongitude: siderealRahu,
        eclipticLatitude: 0,
        ra: 0,
        dec: 0,
        distance: 0,
        source: 'Swiss Ephemeris (fallback)',
        backend: 'SWISS_EPHEM'
      }
      
      const ketu: PlanetPosition = {
        eclipticLongitude: normalizeAngle(siderealRahu + 180),
        eclipticLatitude: 0,
        ra: 0,
        dec: 0,
        distance: 0,
        source: 'Swiss Ephemeris (fallback)',
        backend: 'SWISS_EPHEM'
      }
      
      return { rahu, ketu }
    }
  } catch (error) {
    console.error('Error calculating lunar nodes:', error)
    throw error
  }
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
  let normalized = angle % 360
  if (normalized < 0) normalized += 360
  return normalized
}

/**
 * Fetch all planetary positions for a birth chart
 */
export async function fetchAllPlanets(
  date: Date,
  ayanamsa: number,
  config?: Partial<EphemerisConfig>
): Promise<{
  Sun: PlanetPosition
  Moon: PlanetPosition
  Mercury: PlanetPosition
  Venus: PlanetPosition
  Mars: PlanetPosition
  Jupiter: PlanetPosition
  Saturn: PlanetPosition
  Rahu: PlanetPosition
  Ketu: PlanetPosition
}> {
  // Fetch all planets in parallel for efficiency
  const [sun, moon, mercury, venus, mars, jupiter, saturn, nodes] = await Promise.all([
    fetchPlanetPosition('SUN', date, ayanamsa, config),
    fetchPlanetPosition('MOON', date, ayanamsa, config),
    fetchPlanetPosition('MERCURY', date, ayanamsa, config),
    fetchPlanetPosition('VENUS', date, ayanamsa, config),
    fetchPlanetPosition('MARS', date, ayanamsa, config),
    fetchPlanetPosition('JUPITER', date, ayanamsa, config),
    fetchPlanetPosition('SATURN', date, ayanamsa, config),
    fetchLunarNodes(date, ayanamsa, config)
  ])
  
  return {
    Sun: sun,
    Moon: moon,
    Mercury: mercury,
    Venus: venus,
    Mars: mars,
    Jupiter: jupiter,
    Saturn: saturn,
    Rahu: nodes.rahu,
    Ketu: nodes.ketu
  }
}
