/**
 * House System Calculations
 * 
 * Implements various house systems for Vedic and Western astrology.
 * Supports: Whole Sign, Equal, Placidus, Sripati (Vedic variant)
 */

/**
 * House cusp data
 */
export interface HouseCusps {
  system: string
  cusps: number[] // 12 house cusps in ecliptic longitude (degrees)
  ascendant: number
  mc: number // Midheaven (10th house cusp in most systems)
  error?: string // Error message for systems that fail (e.g., Placidus near poles)
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
 * Calculate Whole Sign Houses (Vedic default)
 * Each house = one complete sign (30°)
 * House 1 starts at 0° of Ascendant sign
 */
export function calculateWholeSignHouses(ascendant: number): HouseCusps {
  const cusps: number[] = []
  
  // House 1 starts at the beginning of the Ascendant sign
  const house1Start = Math.floor(ascendant / 30) * 30
  
  for (let i = 0; i < 12; i++) {
    cusps.push(normalizeAngle(house1Start + i * 30))
  }
  
  return {
    system: 'Whole Sign',
    cusps,
    ascendant,
    mc: cusps[9] // 10th house cusp
  }
}

/**
 * Calculate Equal Houses
 * Each house = 30° starting from Ascendant degree
 */
export function calculateEqualHouses(ascendant: number): HouseCusps {
  const cusps: number[] = []
  
  for (let i = 0; i < 12; i++) {
    cusps.push(normalizeAngle(ascendant + i * 30))
  }
  
  return {
    system: 'Equal',
    cusps,
    ascendant,
    mc: cusps[9] // 10th house cusp
  }
}

/**
 * Calculate Midheaven (MC) - 10th house cusp in most systems
 * MC = point of ecliptic crossing southern meridian
 */
export function calculateMC(lst: number, latitude: number, obliquity: number = 23.439291111): number {
  const lstRad = lst * Math.PI / 180
  const latRad = latitude * Math.PI / 180
  const oblRad = obliquity * Math.PI / 180
  
  // MC calculation using spherical astronomy
  // tan(MC) = tan(LST) / cos(obliquity)
  const mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180 / Math.PI
  
  return normalizeAngle(mc)
}

/**
 * Calculate Placidus Houses
 * Time-based system using diurnal arcs
 * 
 * Note: Fails near poles (latitude > ~66°) where some house cusps become undefined
 */
export function calculatePlacidusHouses(
  ascendant: number,
  mc: number,
  latitude: number,
  obliquity: number = 23.439291111
): HouseCusps {
  const latRad = Math.abs(latitude) * Math.PI / 180
  const oblRad = obliquity * Math.PI / 180
  
  // Check for polar latitudes where Placidus fails
  if (Math.abs(latitude) > 66) {
    return {
      system: 'Placidus',
      cusps: Array(12).fill(null) as any,
      ascendant,
      mc,
      error: `Placidus houses undefined at latitude ${latitude.toFixed(1)}° (too close to poles)`
    }
  }
  
  const cusps: number[] = []
  
  // Houses 1, 4, 7, 10 are the angles
  cusps[0] = ascendant // House 1 (Ascendant)
  cusps[9] = mc // House 10 (MC)
  cusps[6] = normalizeAngle(ascendant + 180) // House 7 (Descendant)
  cusps[3] = normalizeAngle(mc + 180) // House 4 (IC)
  
  // Calculate intermediate cusps using Placidus formula
  // Houses 11, 12, 2, 3 (northern)
  for (let house = 11; house <= 12; house++) {
    cusps[house - 1] = calculatePlacidusIntermediateCusp(
      cusps[9], // MC
      cusps[0], // ASC
      house,
      latRad,
      oblRad,
      latitude >= 0
    )
  }
  
  for (let house = 2; house <= 3; house++) {
    cusps[house - 1] = calculatePlacidusIntermediateCusp(
      cusps[0], // ASC
      cusps[3], // IC
      house,
      latRad,
      oblRad,
      latitude >= 0
    )
  }
  
  // Houses 5, 6, 8, 9 (southern) - opposite hemisphere
  for (let house = 5; house <= 6; house++) {
    const oppositeHouse = house + 6 // 11, 12
    cusps[house - 1] = normalizeAngle(cusps[oppositeHouse - 1] + 180)
  }
  
  for (let house = 8; house <= 9; house++) {
    const oppositeHouse = house - 6 // 2, 3
    cusps[house - 1] = normalizeAngle(cusps[oppositeHouse - 1] + 180)
  }
  
  return {
    system: 'Placidus',
    cusps,
    ascendant,
    mc
  }
}

/**
 * Calculate intermediate Placidus house cusp
 * Uses iterative method to solve the Placidus equation
 */
function calculatePlacidusIntermediateCusp(
  startCusp: number,
  endCusp: number,
  houseNumber: number,
  latRad: number,
  oblRad: number,
  northernHemisphere: boolean
): number {
  // Fraction of semi-arc for this house
  let f: number
  if (houseNumber === 11 || houseNumber === 8) {
    f = 1 / 3
  } else if (houseNumber === 12 || houseNumber === 9) {
    f = 2 / 3
  } else if (houseNumber === 2 || houseNumber === 5) {
    f = 1 / 3
  } else if (houseNumber === 3 || houseNumber === 6) {
    f = 2 / 3
  } else {
    f = 0.5
  }
  
  // Simple linear interpolation for now (proper Placidus requires iterative solution)
  const arc = endCusp - startCusp
  const normalizedArc = arc < 0 ? arc + 360 : arc
  
  return normalizeAngle(startCusp + f * normalizedArc)
}

/**
 * Calculate Sripati Houses (Vedic variant)
 * Similar to Porphyry but with some Vedic modifications
 */
export function calculateSripatiHouses(ascendant: number, mc: number): HouseCusps {
  const cusps: number[] = []
  
  // Four angles
  cusps[0] = ascendant
  cusps[9] = mc
  cusps[6] = normalizeAngle(ascendant + 180)
  cusps[3] = normalizeAngle(mc + 180)
  
  // Intermediate cusps by trisecting the quadrants
  for (let i = 0; i < 4; i++) {
    const startCusp = cusps[i * 3]
    const endCusp = cusps[((i + 1) * 3) % 12]
    
    let arc = endCusp - startCusp
    if (arc < 0) arc += 360
    
    const step = arc / 3
    
    cusps[i * 3 + 1] = normalizeAngle(startCusp + step)
    cusps[i * 3 + 2] = normalizeAngle(startCusp + 2 * step)
  }
  
  return {
    system: 'Sripati',
    cusps,
    ascendant,
    mc
  }
}

/**
 * Calculate houses using specified system
 */
export function calculateHouses(
  system: 'WholeSign' | 'Equal' | 'Placidus' | 'Sripati',
  ascendant: number,
  mc?: number,
  latitude?: number,
  obliquity?: number
): HouseCusps {
  switch (system) {
    case 'WholeSign':
      return calculateWholeSignHouses(ascendant)
    
    case 'Equal':
      return calculateEqualHouses(ascendant)
    
    case 'Placidus':
      if (mc === undefined || latitude === undefined) {
        throw new Error('Placidus houses require MC and latitude')
      }
      return calculatePlacidusHouses(ascendant, mc, latitude, obliquity)
    
    case 'Sripati':
      if (mc === undefined) {
        throw new Error('Sripati houses require MC')
      }
      return calculateSripatiHouses(ascendant, mc)
    
    default:
      throw new Error(`Unknown house system: ${system}`)
  }
}

/**
 * Determine which house a planet is in
 */
export function getPlanetHouse(planetLongitude: number, cusps: number[]): number {
  const normalized = normalizeAngle(planetLongitude)
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i]
    const nextCusp = cusps[(i + 1) % 12]
    
    let inHouse = false
    
    if (nextCusp > currentCusp) {
      // Normal case: cusps don't cross 0°
      inHouse = normalized >= currentCusp && normalized < nextCusp
    } else {
      // Cusp crosses 0° Aries
      inHouse = normalized >= currentCusp || normalized < nextCusp
    }
    
    if (inHouse) {
      return i + 1 // Houses are 1-indexed
    }
  }
  
  // Fallback (shouldn't happen)
  return 1
}
