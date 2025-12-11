/**
 * Vedic Astrology Calculations
 * Based on Swiss Ephemeris methodology with Lahiri Ayanamsa
 * 
 * This module provides comprehensive astrological calculations including:
 * - Planetary positions (sidereal longitudes)
 * - Ascendant (Lagna) calculation
 * - Rashi (zodiac sign) determinations
 * - Nakshatra calculations
 * - House systems
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
 * Calculate Sun's position using simplified algorithms
 * For production, this should use Swiss Ephemeris or similar
 */
export function calculateSunPosition(date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Mean longitude (degrees)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  
  // Mean anomaly (degrees)
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const MRad = M * Math.PI / 180
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(MRad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) +
            0.000289 * Math.sin(3 * MRad)
  
  // True longitude
  let trueLongitude = (L0 + C) % 360
  if (trueLongitude < 0) trueLongitude += 360
  
  // Convert to sidereal
  return tropicalToSidereal(trueLongitude, date)
}

/**
 * Calculate Moon's position using simplified algorithms
 */
export function calculateMoonPosition(date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Moon's mean longitude
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
  
  // Mean elongation of the Moon
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
  const DRad = D * Math.PI / 180
  
  // Sun's mean anomaly
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
  const MRad = M * Math.PI / 180
  
  // Moon's mean anomaly
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
  const MpRad = Mp * Math.PI / 180
  
  // Moon's argument of latitude
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
  const FRad = F * Math.PI / 180
  
  // Periodic terms for longitude (simplified)
  let longitude = L
  longitude += 6.288774 * Math.sin(MpRad)
  longitude += 1.274027 * Math.sin(2 * DRad - MpRad)
  longitude += 0.658314 * Math.sin(2 * DRad)
  longitude += 0.213618 * Math.sin(2 * MpRad)
  longitude -= 0.185116 * Math.sin(MRad)
  longitude -= 0.114332 * Math.sin(2 * FRad)
  
  longitude = longitude % 360
  if (longitude < 0) longitude += 360
  
  return tropicalToSidereal(longitude, date)
}

/**
 * Calculate planetary positions (simplified)
 * In production, use Swiss Ephemeris data or API
 */
export function calculatePlanetPosition(planet: string, date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Orbital elements for each planet (simplified)
  const orbitalElements: { [key: string]: { L: number[], a: number[], e: number[], M: number[] } } = {
    MERCURY: {
      L: [252.250906, 149472.6746358],
      a: [0.38709893],
      e: [0.20563069, 0.00002527],
      M: [174.795884, 4.092339]
    },
    VENUS: {
      L: [181.979801, 58517.8156760],
      a: [0.72333199],
      e: [0.00677323, -0.00004938],
      M: [50.416686, 1.602130]
    },
    MARS: {
      L: [355.433000, 19140.2993039],
      a: [1.52366231],
      e: [0.09341233, 0.00011902],
      M: [19.412136, 0.524039]
    },
    JUPITER: {
      L: [34.351519, 3034.9056606],
      a: [5.20336301],
      e: [0.04839266, -0.00012880],
      M: [18.818097, 0.033912]
    },
    SATURN: {
      L: [50.077444, 1222.1138488],
      a: [9.53707032],
      e: [0.05415060, -0.00036762],
      M: [91.098214, 0.564906]
    }
  }
  
  if (!orbitalElements[planet]) {
    throw new Error(`Planet ${planet} not supported`)
  }
  
  const elem = orbitalElements[planet]
  const L = elem.L[0] + elem.L[1] * T
  const e = elem.e[0] + (elem.e[1] || 0) * T
  const M = (L - elem.M[0]) % 360
  
  // Solve Kepler's equation (simplified)
  const MRad = M * Math.PI / 180
  let E = MRad
  for (let i = 0; i < 5; i++) {
    E = MRad + e * Math.sin(E)
  }
  
  // True anomaly
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  )
  
  let longitude = (elem.M[0] + v * 180 / Math.PI) % 360
  if (longitude < 0) longitude += 360
  
  return tropicalToSidereal(longitude, date)
}

/**
 * Calculate Ascendant (Lagna) using simplified formula
 * For accurate calculation, use proper house system with Swiss Ephemeris
 */
export function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number
): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Greenwich Sidereal Time (simplified)
  const GST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T
  
  // Local Sidereal Time
  const LST = (GST + longitude) % 360
  
  // Obliquity of ecliptic
  const epsilon = 23.439291 - 0.0130042 * T
  const epsilonRad = epsilon * Math.PI / 180
  
  // Calculate ascendant
  const latRad = latitude * Math.PI / 180
  const lstRad = LST * Math.PI / 180
  
  const y = Math.cos(lstRad)
  const x = -Math.sin(lstRad) * Math.cos(epsilonRad) - Math.tan(latRad) * Math.sin(epsilonRad)
  
  let asc = Math.atan2(y, x) * 180 / Math.PI
  if (asc < 0) asc += 360
  
  return tropicalToSidereal(asc, date)
}

/**
 * Calculate Rahu (North Node) position
 * Simplified calculation - moves approximately 19.3° per year retrograde
 */
export function calculateRahuPosition(date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Mean longitude of ascending node (simplified)
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T
  omega = omega % 360
  if (omega < 0) omega += 360
  
  return tropicalToSidereal(omega, date)
}

/**
 * Calculate Ketu (South Node) position
 * Ketu is always 180° opposite to Rahu
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

export function calculateBirthChart(
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
    ayanamsa: calculateAyanamsa(birthDate)
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
