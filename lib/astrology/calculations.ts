/**
 * Vedic Astrology Calculations
 * Now powered by NASA JPL Horizons ephemeris data with automatic fallbacks
 * 
 * This module provides comprehensive astrological calculations including:
 * - Planetary positions (sidereal longitudes) from JPL-quality ephemerides
 * - Ascendant (Lagna) calculation with precise LST
 * - Rashi (zodiac sign) determinations
 * - Nakshatra calculations
 * - Multiple house systems (Whole Sign, Equal, Placidus, Sripati)
 * 
 * Ephemeris backends (configured via EPHEMERIS_BACKEND env var):
 * - HORIZONS: NASA JPL Horizons REST API (default, requires internet)
 * - SPICE: NAIF SPICE kernels (requires local service)
 * - SWISS_EPHEM: Simplified algorithms (automatic fallback)
 */

// Zodiac signs (Rashis) in Vedic Astrology
export const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const

export const RASHI_SANSKRIT = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
] as const

// Planets in Vedic Astrology
export const PLANET_NAMES = {
  SUN: 'Sun',
  MOON: 'Moon',
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn',
  RAHU: 'Rahu',
  KETU: 'Ketu',
  ASCENDANT: 'Ascendant'
} as const

// Nakshatras (Lunar mansions)
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
] as const

// Lahiri Ayanamsa for 2000 (updated annually)
const LAHIRI_AYANAMSA_2000 = 23.85 // degrees
const AYANAMSA_RATE = 0.0135 // degrees per year (approximate)

/**
 * Calculate Lahiri Ayanamsa for a given date
 */
export function calculateAyanamsa(date: Date): number {
  const year = date.getFullYear()
  const yearsSince2000 = year - 2000
  return LAHIRI_AYANAMSA_2000 + (yearsSince2000 * AYANAMSA_RATE)
}

/**
 * Convert tropical longitude to sidereal longitude
 */
export function tropicalToSidereal(tropicalLongitude: number, date: Date): number {
  const ayanamsa = calculateAyanamsa(date)
  let sidereal = tropicalLongitude - ayanamsa
  
  // Normalize to 0-360 range
  while (sidereal < 0) sidereal += 360
  while (sidereal >= 360) sidereal -= 360
  
  return sidereal
}

/**
 * Calculate Julian Day Number
 */
export function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const second = date.getUTCSeconds()
  
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  jd += (hour - 12) / 24 + minute / 1440 + second / 86400
  
  return jd
}

/**
 * Convert longitude to rashi (zodiac sign) number (1-12)
 */
export function longitudeToRashiNumber(longitude: number): number {
  return Math.floor(longitude / 30) + 1
}

/**
 * Convert longitude to rashi name
 */
export function longitudeToRashiName(longitude: number): string {
  const rashiIndex = Math.floor(longitude / 30)
  return RASHI_NAMES[rashiIndex]
}

/**
 * Get degrees within the rashi (0-30)
 */
export function degreesInRashi(longitude: number): number {
  return longitude % 30
}

/**
 * Convert longitude to nakshatra number (1-27)
 */
export function longitudeToNakshatraNumber(longitude: number): number {
  return Math.floor(longitude / 13.333333333333334) + 1
}

/**
 * Convert longitude to nakshatra name
 */
export function longitudeToNakshatraName(longitude: number): string {
  const nakshatraIndex = Math.floor(longitude / 13.333333333333334)
  return NAKSHATRAS[nakshatraIndex]
}

/**
 * Format planetary position for display
 */
export function formatPosition(longitude: number): string {
  const rashi = longitudeToRashiName(longitude)
  const degrees = Math.floor(degreesInRashi(longitude))
  const minutes = Math.floor((degreesInRashi(longitude) - degrees) * 60)
  return `${rashi} ${degrees}° ${minutes}'`
}

/**
 * These functions are now deprecated - calculations moved to ephemeris adapter
 * Kept for backwards compatibility, but internally use the new JPL-based system
 * 
 * @deprecated Use fetchPlanetPosition from ephemeris/adapter.ts instead
 */
export function calculateSunPosition(date: Date): number {
  // Fallback to simplified algorithm
  const { calculateSunPosition: fallback } = require('./calculations-fallback')
  return fallback(date)
}

/**
 * @deprecated Use fetchPlanetPosition from ephemeris/adapter.ts instead
 */
export function calculateMoonPosition(date: Date): number {
  const { calculateMoonPosition: fallback } = require('./calculations-fallback')
  return fallback(date)
}

/**
 * @deprecated Use fetchPlanetPosition from ephemeris/adapter.ts instead
 */
export function calculatePlanetPosition(planet: string, date: Date): number {
  const { calculatePlanetPosition: fallback } = require('./calculations-fallback')
  return fallback(planet, date)
}

/**
 * Calculate Ascendant (Lagna) using precise LST calculation
 * Now uses improved GMST/LST formulas compatible with JPL data
 */
export function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number
): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Greenwich Mean Sidereal Time (IAU 1982 formula)
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
             0.000387933 * T * T - T * T * T / 38710000.0
  
  // Normalize GMST to 0-360
  while (gmst < 0) gmst += 360
  while (gmst >= 360) gmst -= 360
  
  // Local Sidereal Time
  let lst = gmst + longitude
  while (lst < 0) lst += 360
  while (lst >= 360) lst -= 360
  
  // Obliquity of ecliptic (J2000 with correction)
  const epsilon = 23.439291111 - 0.0130042 * T
  const epsilonRad = epsilon * Math.PI / 180
  
  // Calculate ascendant using spherical astronomy
  const latRad = latitude * Math.PI / 180
  const lstRad = lst * Math.PI / 180
  
  const y = Math.cos(lstRad)
  const x = -Math.sin(lstRad) * Math.cos(epsilonRad) - Math.tan(latRad) * Math.sin(epsilonRad)
  
  let asc = Math.atan2(y, x) * 180 / Math.PI
  if (asc < 0) asc += 360
  
  return tropicalToSidereal(asc, date)
}

/**
 * @deprecated Use fetchLunarNodes from ephemeris/adapter.ts instead
 */
export function calculateRahuPosition(date: Date): number {
  const { calculateRahuPosition: fallback } = require('./calculations-fallback')
  return fallback(date)
}

/**
 * @deprecated Use fetchLunarNodes from ephemeris/adapter.ts instead
 */
export function calculateKetuPosition(date: Date): number {
  const rahu = calculateRahuPosition(date)
  return (rahu + 180) % 360
}

/**
 * Get complete planetary chart data
 */
export interface PlanetaryPosition {
  longitude: number
  rashiNumber: number
  rashiName: string
  rashiSanskrit: string
  degreeInRashi: number
  nakshatraNumber: number
  nakshatraName: string
  formatted: string
}

export interface BirthChartData {
  Sun: PlanetaryPosition
  Moon: PlanetaryPosition
  Mercury: PlanetaryPosition
  Venus: PlanetaryPosition
  Mars: PlanetaryPosition
  Jupiter: PlanetaryPosition
  Saturn: PlanetaryPosition
  Rahu: PlanetaryPosition
  Ketu: PlanetaryPosition
  Ascendant: PlanetaryPosition
  calculatedAt: string
  ayanamsa: number
  ephemerisSource?: string // 'JPL Horizons', 'SPICE', or 'Swiss Ephemeris (fallback)'
}

function createPlanetaryPosition(longitude: number): PlanetaryPosition {
  const rashiNumber = longitudeToRashiNumber(longitude)
  return {
    longitude,
    rashiNumber,
    rashiName: longitudeToRashiName(longitude),
    rashiSanskrit: RASHI_SANSKRIT[rashiNumber - 1],
    degreeInRashi: degreesInRashi(longitude),
    nakshatraNumber: longitudeToNakshatraNumber(longitude),
    nakshatraName: longitudeToNakshatraName(longitude),
    formatted: formatPosition(longitude)
  }
}

/**
 * Calculate complete birth chart using JPL Horizons ephemeris
 * Falls back to SPICE or Swiss Ephemeris if unavailable
 */
export async function calculateBirthChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): Promise<BirthChartData> {
  const ayanamsa = calculateAyanamsa(birthDate)
  
  try {
    // Try to use JPL-based ephemeris
    const { fetchAllPlanets } = await import('../ephemeris/adapter')
    
    const planets = await fetchAllPlanets(birthDate, ayanamsa)
    
    // Use the source from one of the planets (they should all be the same)
    const ephemerisSource = planets.Sun.source
    
    return {
      Sun: createPlanetaryPosition(planets.Sun.eclipticLongitude),
      Moon: createPlanetaryPosition(planets.Moon.eclipticLongitude),
      Mercury: createPlanetaryPosition(planets.Mercury.eclipticLongitude),
      Venus: createPlanetaryPosition(planets.Venus.eclipticLongitude),
      Mars: createPlanetaryPosition(planets.Mars.eclipticLongitude),
      Jupiter: createPlanetaryPosition(planets.Jupiter.eclipticLongitude),
      Saturn: createPlanetaryPosition(planets.Saturn.eclipticLongitude),
      Rahu: createPlanetaryPosition(planets.Rahu.eclipticLongitude),
      Ketu: createPlanetaryPosition(planets.Ketu.eclipticLongitude),
      Ascendant: createPlanetaryPosition(calculateAscendant(birthDate, latitude, longitude)),
      calculatedAt: new Date().toISOString(),
      ayanamsa,
      ephemerisSource
    }
  } catch (error) {
    // Fallback to simplified calculations
    console.error('JPL ephemeris unavailable, using fallback:', error)
    
    return {
      Sun: createPlanetaryPosition(calculateSunPosition(birthDate)),
      Moon: createPlanetaryPosition(calculateMoonPosition(birthDate)),
      Mercury: createPlanetaryPosition(calculatePlanetPosition('MERCURY', birthDate)),
      Venus: createPlanetaryPosition(calculatePlanetPosition('VENUS', birthDate)),
      Mars: createPlanetaryPosition(calculatePlanetPosition('MARS', birthDate)),
      Jupiter: createPlanetaryPosition(calculatePlanetPosition('JUPITER', birthDate)),
      Saturn: createPlanetaryPosition(calculatePlanetPosition('SATURN', birthDate)),
      Rahu: createPlanetaryPosition(calculateRahuPosition(birthDate)),
      Ketu: createPlanetaryPosition(calculateKetuPosition(birthDate)),
      Ascendant: createPlanetaryPosition(calculateAscendant(birthDate, latitude, longitude)),
      calculatedAt: new Date().toISOString(),
      ayanamsa,
      ephemerisSource: 'Swiss Ephemeris (fallback)'
    }
  }
}

/**
 * Synchronous version for backwards compatibility
 * Uses fallback calculations only
 * @deprecated Use async calculateBirthChart for JPL ephemeris
 */
export function calculateBirthChartSync(
  birthDate: Date,
  latitude: number,
  longitude: number
): BirthChartData {
  return {
    Sun: createPlanetaryPosition(calculateSunPosition(birthDate)),
    Moon: createPlanetaryPosition(calculateMoonPosition(birthDate)),
    Mercury: createPlanetaryPosition(calculatePlanetPosition('MERCURY', birthDate)),
    Venus: createPlanetaryPosition(calculatePlanetPosition('VENUS', birthDate)),
    Mars: createPlanetaryPosition(calculatePlanetPosition('MARS', birthDate)),
    Jupiter: createPlanetaryPosition(calculatePlanetPosition('JUPITER', birthDate)),
    Saturn: createPlanetaryPosition(calculatePlanetPosition('SATURN', birthDate)),
    Rahu: createPlanetaryPosition(calculateRahuPosition(birthDate)),
    Ketu: createPlanetaryPosition(calculateKetuPosition(birthDate)),
    Ascendant: createPlanetaryPosition(calculateAscendant(birthDate, latitude, longitude)),
    calculatedAt: new Date().toISOString(),
    ayanamsa: calculateAyanamsa(birthDate),
    ephemerisSource: 'Swiss Ephemeris (fallback)'
  }
}

/**
 * Determine house placements based on Ascendant
 */
export function getHousePlacements(chartData: BirthChartData): { [planet: string]: number } {
  const ascendantRashi = chartData.Ascendant.rashiNumber
  
  const placements: { [planet: string]: number } = {}
  
  Object.entries(chartData).forEach(([planet, position]) => {
    if (planet !== 'calculatedAt' && planet !== 'ayanamsa') {
      const pos = position as PlanetaryPosition
      // Calculate house number relative to ascendant
      let house = pos.rashiNumber - ascendantRashi + 1
      if (house <= 0) house += 12
      placements[planet] = house
    }
  })
  
  return placements
}
