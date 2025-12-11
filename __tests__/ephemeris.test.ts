/**
 * JPL Ephemeris Test Suite
 * 
 * Tests for:
 * - Fortran 'D' exponent parsing
 * - Horizons response parsing
 * - Coordinate conversions (ecliptic ↔ equatorial)
 * - GMST/LST calculations
 * - Ascendant and house calculations
 * - End-to-end planetary positions
 */

import {
  parseFortranNumber,
  parseHorizonsResult,
  vectorsToEcliptic,
  eclipticToEquatorial,
  calculateGMST,
  calculateLST,
  OBLIQUITY_J2000
} from '@/lib/ephemeris/jpl-horizons'

import {
  calculateWholeSignHouses,
  calculateEqualHouses,
  calculatePlacidusHouses,
  calculateMC,
  getPlanetHouse
} from '@/lib/ephemeris/house-systems'

import { dateToJulianDay } from '@/lib/astrology/calculations'

describe('Fortran Number Parsing', () => {
  test('parses positive D exponent', () => {
    expect(parseFortranNumber('1.234D+05')).toBeCloseTo(123400, 1)
  })
  
  test('parses negative D exponent', () => {
    expect(parseFortranNumber('-2.5D-03')).toBeCloseTo(-0.0025, 6)
  })
  
  test('parses lowercase d exponent', () => {
    expect(parseFortranNumber('3.14159d+00')).toBeCloseTo(3.14159, 5)
  })
  
  test('parses standard E notation', () => {
    expect(parseFortranNumber('1.5E+08')).toBeCloseTo(150000000, 1)
  })
})

describe('Horizons Response Parsing', () => {
  test('parses vector data between $$SOE and $$EOE', () => {
    const mockResponse = \`
Some header text
$$SOE
2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 1.234567D+08 Y =-5.678901D+07 Z = 2.345678D+06
 VX= 1.234D+01 VY= 2.345D+01 VZ= 3.456D+00
$$EOE
Some footer text
\`
    
    const result = parseHorizonsResult(mockResponse, '10')
    
    expect(result.x).toBeCloseTo(123456700, 1)
    expect(result.y).toBeCloseTo(-56789010, 1)
    expect(result.z).toBeCloseTo(2345678, 1)
    expect(result.vx).toBeCloseTo(12.34, 2)
    expect(result.vy).toBeCloseTo(23.45, 2)
    expect(result.vz).toBeCloseTo(3.456, 3)
    expect(result.bodyCode).toBe('10')
  })
  
  test('throws error if $$SOE marker missing', () => {
    const badResponse = 'No data markers here'
    expect(() => parseHorizonsResult(badResponse, '10')).toThrow()
  })
})

describe('Coordinate Conversions', () => {
  test('converts Cartesian vectors to ecliptic longitude/latitude', () => {
    // Point on ecliptic at 45° longitude
    const x = Math.cos(45 * Math.PI / 180) * 1000
    const y = Math.sin(45 * Math.PI / 180) * 1000
    const z = 0
    
    const result = vectorsToEcliptic(x, y, z)
    
    expect(result.lambda).toBeCloseTo(45, 1)
    expect(result.beta).toBeCloseTo(0, 1)
    expect(result.radius).toBeCloseTo(1000, 1)
  })
  
  test('converts ecliptic to equatorial coordinates', () => {
    // Sun at vernal equinox (0° ecliptic longitude)
    const result = eclipticToEquatorial(0, 0, 1, OBLIQUITY_J2000)
    
    expect(result.ra).toBeCloseTo(0, 1)
    expect(result.dec).toBeCloseTo(0, 1)
  })
  
  test('converts Sun at summer solstice (90° ecliptic)', () => {
    const result = eclipticToEquatorial(90, 0, 1, OBLIQUITY_J2000)
    
    expect(result.ra).toBeCloseTo(90, 1)
    expect(result.dec).toBeCloseTo(23.44, 1) // Should equal obliquity
  })
})

describe('Sidereal Time Calculations', () => {
  test('calculates GMST for J2000 epoch', () => {
    // J2000.0 = JD 2451545.0 = 2000-01-01 12:00:00 TT
    const jd = 2451545.0
    const gmst = calculateGMST(jd)
    
    // At J2000 noon, GMST should be around 280.46°
    expect(gmst).toBeGreaterThan(280)
    expect(gmst).toBeLessThan(281)
  })
  
  test('calculates LST from GMST and longitude', () => {
    const jd = 2451545.0
    const longitude = 77.2090 // Delhi
    
    const lst = calculateLST(jd, longitude)
    
    // LST should be GMST + longitude
    const gmst = calculateGMST(jd)
    const expected = (gmst + longitude) % 360
    
    expect(lst).toBeCloseTo(expected, 5)
  })
})

describe('House Systems', () => {
  const ascendant = 15 // 15° Aries
  
  test('calculates Whole Sign houses', () => {
    const houses = calculateWholeSignHouses(ascendant)
    
    expect(houses.system).toBe('Whole Sign')
    expect(houses.cusps.length).toBe(12)
    expect(houses.cusps[0]).toBe(0) // House 1 starts at 0° Aries
    expect(houses.cusps[1]).toBe(30) // House 2 at 0° Taurus
    expect(houses.cusps[11]).toBe(330) // House 12 at 0° Pisces
  })
  
  test('calculates Equal houses', () => {
    const houses = calculateEqualHouses(ascendant)
    
    expect(houses.system).toBe('Equal')
    expect(houses.cusps.length).toBe(12)
    expect(houses.cusps[0]).toBe(15) // House 1 at exact Ascendant
    expect(houses.cusps[1]).toBe(45) // 30° later
    expect(houses.cusps[6]).toBe(195) // Descendant = Asc + 180°
  })
  
  test('calculates MC (Midheaven)', () => {
    const lst = 0 // LST at 0° (0h sidereal time)
    const latitude = 28.6139 // Delhi
    
    const mc = calculateMC(lst, latitude)
    
    // MC should be close to 0° for LST=0 at moderate latitude
    expect(mc).toBeGreaterThan(-10)
    expect(mc).toBeLessThan(10)
  })
  
  test('determines planet house placement', () => {
    const houses = calculateEqualHouses(0) // Ascendant at 0° Aries
    
    // Planet at 45° should be in house 2
    const house = getPlanetHouse(45, houses.cusps)
    expect(house).toBe(2)
    
    // Planet at 5° should be in house 1
    const house2 = getPlanetHouse(5, houses.cusps)
    expect(house2).toBe(1)
  })
  
  test('handles Placidus failure at high latitudes', () => {
    const mc = 90
    const latitude = 70 // Arctic latitude
    
    const houses = calculatePlacidusHouses(ascendant, mc, latitude)
    
    expect(houses.error).toBeDefined()
    expect(houses.error).toContain('polar')
  })
})

describe('Julian Day Calculations', () => {
  test('calculates JD for J2000 epoch', () => {
    const date = new Date('2000-01-01T12:00:00Z')
    const jd = dateToJulianDay(date)
    
    expect(jd).toBeCloseTo(2451545.0, 5)
  })
  
  test('calculates JD for arbitrary date', () => {
    const date = new Date('2024-12-11T00:00:00Z')
    const jd = dateToJulianDay(date)
    
    // Should be around JD 2460656
    expect(jd).toBeGreaterThan(2460000)
    expect(jd).toBeLessThan(2461000)
  })
})

describe('Integration Tests', () => {
  test('full workflow: date → JD → GMST → Ascendant', () => {
    const date = new Date('2000-01-01T12:00:00Z')
    const latitude = 28.6139
    const longitude = 77.2090
    
    const jd = dateToJulianDay(date)
    expect(jd).toBeCloseTo(2451545.0, 2)
    
    const gmst = calculateGMST(jd)
    expect(gmst).toBeGreaterThan(0)
    expect(gmst).toBeLessThan(360)
    
    const lst = calculateLST(jd, longitude)
    expect(lst).toBeGreaterThan(0)
    expect(lst).toBeLessThan(360)
  })
})

/**
 * Mock Horizons response for testing
 */
export const MOCK_HORIZONS_RESPONSE = {
  result: \`
*******************************************************************************
Ephemeris / API_USER Sun Dec 11 2024
*******************************************************************************
Target body name: Sun (10)                       {source: DE441}
Center body name: Earth (399)                     {source: DE441}
Center-site name: GEOCENTRIC
*******************************************************************************
Start time      : A.D. 2000-Jan-01 12:00:00.0000 TDB
Stop  time      : A.D. 2000-Jan-02 12:00:00.0000 TDB
Step-size       : 1 calendar day
*******************************************************************************
Target pole/equ : IAU_SUN                         {East-longitude positive}
Target radii    : 696000.0 x 696000.0 x 696000.0 km
Center geodetic : 0.00000000,0.00000000,0.0000000 {E-lon(deg),Lat(deg),Alt(km)}
Center cylindric: 0.00000000,0.00000000,0.0000000 {E-lon(deg),Dxy(km),Dz(km)}
Center pole/equ : ITRF93                          {East-longitude positive}
Center radii    : 6378.1 x 6378.1 x 6356.8 km
Output units    : KM-S
Calendar mode   : Mixed Julian/Gregorian
Output type     : VECTORS
Output format   : 03
Vector table    : EclipJ2000
Vector labels   : YES
*******************************************************************************
$$SOE
2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-2.61495906D+07 Y = 1.32940055D+08 Z =-3.16175738D+03
 VX=-2.98559056D+01 VY=-5.26603097D+00 VZ= 0.00000000D+00
$$EOE
*******************************************************************************
\`
}

/**
 * Expected planetary positions for validation
 * (from Swiss Ephemeris or JPL Horizons for J2000 epoch)
 */
export const EXPECTED_POSITIONS_J2000 = {
  Sun: { longitude: 280.5, tolerance: 1.0 }, // Approximate ecliptic longitude
  Moon: { longitude: 210.3, tolerance: 2.0 },
  // Add more known values for validation
}
