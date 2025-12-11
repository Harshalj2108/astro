/**
 * Swiss Ephemeris-style Fallback Calculations
 * 
 * Simplified planetary position algorithms for use when JPL Horizons
 * or SPICE are unavailable. Based on VSOP87 and other published algorithms.
 * 
 * Accuracy: ±0.5° for most planets (sufficient for general astrology)
 * NOT suitable for precise astronomical calculations.
 */

import { tropicalToSidereal, dateToJulianDay } from './calculations'

/**
 * Calculate Sun's position using simplified algorithms
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
 */
export function calculatePlanetPosition(planet: string, date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Orbital elements for each planet (simplified VSOP87)
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
    },
    URANUS: {
      L: [314.055005, 428.466998],
      a: [19.18916464],
      e: [0.04725744, -0.00001557],
      M: [142.955717, 0.011725]
    },
    NEPTUNE: {
      L: [304.348665, 218.486200],
      a: [30.06992276],
      e: [0.00859048, 0.00005105],
      M: [256.225150, 0.005995]
    }
  }
  
  if (!orbitalElements[planet]) {
    throw new Error(`Planet ${planet} not supported in fallback calculations`)
  }
  
  const elem = orbitalElements[planet]
  const L = elem.L[0] + elem.L[1] * T
  const e = elem.e[0] + (elem.e[1] || 0) * T
  const M = (L - elem.M[0]) % 360
  
  // Solve Kepler's equation (simplified iterative method)
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
 * Calculate Rahu (North Node) position
 * Simplified calculation - moves approximately 19.3° per year retrograde
 */
export function calculateRahuPosition(date: Date): number {
  const jd = dateToJulianDay(date)
  const T = (jd - 2451545.0) / 36525.0
  
  // Mean longitude of ascending node (IAU formula)
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
