# JPL Ephemeris Integration

## Overview

This astrology website now uses **NASA JPL Horizons** ephemeris data for planetary positions, providing JPL-quality accuracy for birth chart calculations. The system includes automatic fallbacks and caching for reliability.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         calculateBirthChart()                    │
│         (lib/astrology/calculations.ts)          │
└───────────────────┬─────────────────────────────┘
                    │
                    v
┌─────────────────────────────────────────────────┐
│         Ephemeris Adapter                        │
│         (lib/ephemeris/adapter.ts)               │
│  ┌──────────────────────────────────────────┐  │
│  │  Backend Selection (via env var)         │  │
│  │  HORIZONS → SPICE → SWISS_EPHEM          │  │
│  └──────────────────────────────────────────┘  │
└───────┬────────────────┬────────────────────────┘
        │                │
        v                v
┌───────────────┐ ┌──────────────────┐
│ JPL Horizons  │ │  SPICE Service   │
│  REST API     │ │  (Optional)      │
│  (Primary)    │ │  (Offline)       │
└───────────────┘ └──────────────────┘
        │                │
        └────────┬───────┘
                 │
                 v  (on error)
┌──────────────────────────────────────┐
│  Swiss Ephemeris Fallback            │
│  (Simplified algorithms)             │
└──────────────────────────────────────┘
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Ephemeris Backend Selection
# Options: HORIZONS, SPICE, SWISS_EPHEM
# Default: HORIZONS
EPHEMERIS_BACKEND=HORIZONS

# SPICE Service URL (if using SPICE backend)
SPICE_SERVICE_URL=http://localhost:5000

# Optional: Cache configuration
# EPHEMERIS_CACHE_TTL=86400000  # 24 hours in milliseconds
```

### Backend Options

#### 1. JPL Horizons (Default)

**Pros:**
- Highest accuracy (NASA JPL-quality data)
- No local setup required
- Always up-to-date

**Cons:**
- Requires internet connection
- Rate limited (1 request/second with exponential backoff)
- Network latency

**Setup:** No setup required! Just make API calls.

#### 2. SPICE (Optional)

**Pros:**
- Offline operation
- Extremely high accuracy
- No rate limits

**Cons:**
- Requires Python microservice
- ~300MB kernel files
- More complex deployment

**Setup:** See [SPICE Setup](#spice-setup) below.

#### 3. Swiss Ephemeris Fallback

**Pros:**
- Always available
- No dependencies
- Fast

**Cons:**
- Lower accuracy (±0.5°)
- Simplified algorithms

**Automatic:** Used automatically when other backends fail.

## Features

### ✨ Implemented

- ✅ JPL Horizons REST API integration
- ✅ Fortran 'D' exponent parsing
- ✅ Ecliptic ↔ Equatorial coordinate conversions
- ✅ GMST/LST calculations (IAU 1982 formulas)
- ✅ Ascendant and MC calculations
- ✅ Multiple house systems (Whole Sign, Equal, Placidus, Sripati)
- ✅ In-memory caching with TTL (24 hours)
- ✅ Rate limiting with exponential backoff
- ✅ Automatic fallback chain
- ✅ Sidereal zodiac support (Lahiri Ayanamsa)
- ✅ Rahu/Ketu (lunar nodes) calculation
- ✅ Backwards compatible API

### 🔄 Caching System

All JPL Horizons requests are cached for 24 hours:

```typescript
// Cache key: bodyCode_julianDay_center_vectCorr
"10_2451545.0_500@399_LT+S" → { data, timestamp }
```

Cache is automatically cleaned when it exceeds 1000 entries.

### ⚡ Rate Limiting

- Minimum 1 second between requests
- Exponential backoff on errors: 1s, 2s, 4s
- Maximum 3 retry attempts
- Falls back to SPICE or Swiss Ephemeris on persistent failures

## SPICE Setup

### Quick Start

1. **Download SPICE kernels:**

```bash
# Run the provided script
chmod +x lib/ephemeris/download-spice-kernels.sh
./lib/ephemeris/download-spice-kernels.sh
```

Or manually:
- Leap seconds: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls
- DE440 ephemeris: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp

2. **Install Python dependencies:**

```bash
pip install flask spiceypy
```

3. **Save the SPICE service:**

```bash
# The service code is in lib/ephemeris/spice.ts (export as .py)
# Or copy from the documentation
```

4. **Run the service:**

```bash
export SPICE_KERNEL_DIR=./spice_kernels
python spice-service.py
```

5. **Update environment:**

```bash
EPHEMERIS_BACKEND=SPICE
SPICE_SERVICE_URL=http://localhost:5000
```

### Docker Deployment

```bash
docker build -t spice-service -f Dockerfile.spice .
docker run -p 5000:5000 spice-service
```

## API Changes

### Async Birth Chart Calculation

```typescript
// OLD (synchronous)
const chart = calculateBirthChart(date, lat, lon)

// NEW (async with JPL)
const chart = await calculateBirthChart(date, lat, lon)

// Result includes source information:
{
  Sun: { longitude: 280.5, ... },
  Moon: { longitude: 210.3, ... },
  // ...
  ephemerisSource: "JPL Horizons" // or "SPICE" or "Swiss Ephemeris (fallback)"
}
```

### Backwards Compatibility

The synchronous version still works (uses fallback):

```typescript
import { calculateBirthChartSync } from '@/lib/astrology/calculations'

const chart = calculateBirthChartSync(date, lat, lon)
// Always uses Swiss Ephemeris fallback
```

## Migration Guide

### Existing Code

No changes required! The API route `/api/charts` automatically uses the async version:

```typescript
// app/api/charts/route.ts
const chartData = await calculateBirthChart(dateTime, latitude, longitude)
```

### For New Features

```typescript
import { fetchAllPlanets } from '@/lib/ephemeris/adapter'
import { calculateAyanamsa } from '@/lib/astrology/calculations'

const date = new Date('2000-01-01T12:00:00Z')
const ayanamsa = calculateAyanamsa(date)

// Fetch all planets with JPL Horizons
const planets = await fetchAllPlanets(date, ayanamsa)

console.log(planets.Sun.eclipticLongitude) // Sidereal longitude
console.log(planets.Sun.source) // "JPL Horizons"
```

## Testing

### Manual Testing

Test the Horizons parser:

```typescript
import { parseFortranNumber, parseHorizonsResult } from '@/lib/ephemeris/jpl-horizons'

// Test Fortran notation
console.log(parseFortranNumber('1.234D+08')) // 123400000

// Test coordinate conversion
import { vectorsToEcliptic } from '@/lib/ephemeris/jpl-horizons'
const ecliptic = vectorsToEcliptic(100000, 50000, 0)
console.log(ecliptic.lambda) // Ecliptic longitude
```

### Integration Test

```typescript
import { calculateBirthChart } from '@/lib/astrology/calculations'

const date = new Date('2000-01-01T12:00:00Z')
const chart = await calculateBirthChart(date, 28.6139, 77.2090)

console.log('Source:', chart.ephemerisSource)
console.log('Sun:', chart.Sun.formatted)
console.log('Moon:', chart.Moon.formatted)
```

## Performance

### Typical Response Times

- **First request:** 1-2 seconds (Horizons API + parsing)
- **Cached request:** <10ms (in-memory cache)
- **SPICE backend:** ~100ms (local service)
- **Fallback:** <5ms (synchronous calculation)

### Optimization Tips

1. **Use caching:** Cache is automatic, but consider Redis for multi-instance deployments
2. **Batch requests:** Fetch all planets in parallel (already implemented)
3. **Prefer SPICE for high-volume:** No rate limits, offline operation
4. **Monitor fallbacks:** Log when fallback is used

## Troubleshooting

### "Failed to fetch from Horizons"

**Cause:** Network issue, rate limit, or Horizons downtime

**Solution:**
1. Check internet connection
2. System automatically retries with backoff
3. Falls back to SPICE or Swiss Ephemeris
4. Check logs for specific error

### "SPICE service error"

**Cause:** SPICE microservice not running or kernels missing

**Solution:**
1. Ensure service is running: `curl http://localhost:5000/health`
2. Check kernels exist: `ls spice_kernels/`
3. Falls back to Swiss Ephemeris automatically

### Inaccurate Positions

**Check:**
1. Date/time timezone (should be UTC)
2. Ayanamsa calculation (currently Lahiri ~23.85° for 2000)
3. Ephemeris source: `chart.ephemerisSource`
4. Compare with Swiss Ephemeris or Astro.com

## Security

### Data Privacy

- ✅ Horizons API calls are server-side only
- ✅ No user data sent to external services
- ✅ Caching prevents repeated API calls
- ✅ No API keys required (public NASA service)

### Rate Limiting

Respectful rate limiting (1 req/sec) prevents abuse and ensures service availability.

## Accuracy

### Planetary Positions

| Backend | Accuracy | Notes |
|---------|----------|-------|
| JPL Horizons | ±0.001° | NASA-quality, includes perturbations |
| SPICE (DE440) | ±0.0001° | Research-grade, valid 1550-2650 CE |
| Swiss Ephemeris Fallback | ±0.5° | Simplified, general astrology use |

### Ascendant/Houses

| System | Accuracy | Notes |
|--------|----------|-------|
| Whole Sign | Exact | No calculation needed |
| Equal | ±0.01° | Simple geometry |
| Placidus | ±0.1° | Iterative solution, fails near poles |
| Sripati | ±0.1° | Vedic variant of Porphyry |

## Changelog

### v2.0.0 - JPL Horizons Integration

**Added:**
- JPL Horizons REST API integration
- SPICE kernel support (optional)
- Coordinate conversion utilities
- House system calculations (4 systems)
- In-memory caching with TTL
- Rate limiting with exponential backoff
- Automatic fallback chain

**Changed:**
- `calculateBirthChart()` now async (returns Promise)
- Added `ephemerisSource` field to BirthChartData
- Improved GMST/LST calculations (IAU formulas)
- Updated Ascendant calculation for higher precision

**Deprecated:**
- Synchronous `calculateBirthChart()` (use `calculateBirthChartSync()` for fallback-only)
- Individual planet calculation functions (use `fetchPlanetPosition()` from adapter)

**Migration:**
```typescript
// Before
const chart = calculateBirthChart(date, lat, lon)

// After
const chart = await calculateBirthChart(date, lat, lon)
```

## Credits

- **NASA JPL Horizons:** Ephemeris data service
- **NAIF SPICE:** Spacecraft navigation tools
- **Swiss Ephemeris:** Algorithm reference (not directly used)

## License

The JPL Horizons API is a free public service provided by NASA. SPICE kernels are public domain. This implementation is part of the astrology website and follows the project's license.

## Support

For issues related to:
- **Horizons API:** Check https://ssd.jpl.nasa.gov/horizons/
- **SPICE:** Check https://naif.jpl.nasa.gov/naif/toolkit.html
- **This implementation:** Open an issue in the repository
