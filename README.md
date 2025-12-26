# Astrology Calculator

A comprehensive Python library for calculating planetary positions and astrological charts using Swiss Ephemeris with Lahiri Ayanamsa (sidereal system).

## Features

### 🌟 Core Functionality
- **Planetary Positions**: Calculate sidereal longitudes for all major planets
- **Ascendant Calculation**: Calculate rising sign (Lagna) for any location and time
- **Node Calculations**: Rahu and Ketu positions
- **Location Services**: Geographic coordinate lookup for cities
- **Chart Data**: Complete birth chart data with signs and degrees

### 🪐 Supported Celestial Bodies
- **Classical Planets**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
- **Outer Planets**: Uranus, Neptune
- **Lunar Nodes**: Rahu (North Node), Ketu (South Node)
- **Ascendant**: Rising sign calculation

## Installation

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download Swiss Ephemeris Files**:
   - Create an `ephe` directory in your project folder
   - Download ephemeris files from: ftp://ftp.astro.com/pub/swisseph/ephe/
   - Essential files: `sepl_*.se1`, `semo_*.se1`, `seas_*.se1`

## Usage

### Method 1: Using the AstrologyCalculator Class

```python
from astrology_calculator import AstrologyCalculator

# Initialize calculator
calc = AstrologyCalculator(ephe_path='ephe')

# Calculate all planetary positions for a birth chart
chart_data = calc.get_planetary_chart_data(
    date="1990-05-15 14:30:00",
    latitude=28.6139,  # Delhi
    longitude=77.2090
)

# Display results
for planet, data in chart_data.items():
    print(f"{planet}: {data['formatted']}")
```

### Method 2: Individual Planet Calculations

```python
# Calculate specific planets
sun_pos = calc.calculate_sun_sidereal_longitude("2025-01-15")
moon_pos = calc.calculate_moon_sidereal_longitude("2025-01-15")
ascendant = calc.calculate_ascendant_sidereal_longitude(
    "2025-01-15 12:00:00", 28.6139, 77.2090
)

print(f"Sun: {sun_pos:.2f}°")
print(f"Moon: {moon_pos:.2f}°")
print(f"Ascendant: {ascendant:.2f}°")
```

### Method 3: Standalone Functions (Backward Compatibility)

```python
from astrology_calculator import (
    calculate_sun_sidereal_longitude,
    calculate_moon_sidereal_longitude,
    calculate_ascendant_sidereal_longitude
)

sun_long = calculate_sun_sidereal_longitude("2025-01-15")
moon_long = calculate_moon_sidereal_longitude("2025-01-15")
```

### Location Lookup

```python
# Interactive location lookup
lat, lon = calc.place_coordinates()
# User will be prompted to enter a city name
```

## API Reference

### AstrologyCalculator Class

#### Core Methods
- `calculate_sun_sidereal_longitude(date)` - Sun's position
- `calculate_moon_sidereal_longitude(date)` - Moon's position  
- `calculate_mercury_sidereal_longitude(date)` - Mercury's position
- `calculate_venus_sidereal_longitude(date)` - Venus's position
- `calculate_mars_sidereal_longitude(date)` - Mars's position
- `calculate_jupiter_sidereal_longitude(date)` - Jupiter's position
- `calculate_saturn_sidereal_longitude(date)` - Saturn's position
- `calculate_uranus_sidereal_longitude(date)` - Uranus's position
- `calculate_neptune_sidereal_longitude(date)` - Neptune's position
- `calculate_rahu_sidereal_longitude(date)` - Rahu's position
- `calculate_ketu_sidereal_longitude(date)` - Ketu's position
- `calculate_ascendant_sidereal_longitude(date, lat, lon)` - Ascendant

#### Utility Methods
- `get_all_planetary_positions(date, lat, lon)` - All planets at once
- `get_planetary_chart_data(date, lat, lon)` - Complete chart with signs
- `longitude_to_sign(longitude)` - Convert degrees to sign number (1-12)
- `longitude_to_sign_name(longitude)` - Convert degrees to sign name
- `longitude_to_degree_in_sign(longitude)` - Degrees within sign (0-30)

#### Static Methods
- `place_coordinates()` - Interactive location lookup

### Parameters

#### Date Formats
- String: `"2025-01-15"` or `"2025-01-15 14:30:00"`
- Astropy Time object: `Time("2025-01-15")`

#### Coordinates
- **Latitude**: -90 to +90 degrees (North positive, South negative)
- **longitude**: -180 to +180 degrees (East positive, West negative)

#### House Systems (for Ascendant)
- `'P'`: Placidus (default)
- `'E'`: Equal House
- `'K'`: Koch
- And other standard systems

## Output Format

### Chart Data Structure
```python
{
    'Sun': {
        'longitude': 295.67,
        'sign_number': 10,
        'sign_name': 'Capricorn', 
        'degree_in_sign': 25.67,
        'formatted': 'Capricorn 25.67°'
    },
    # ... other planets
}
```

## Dependencies

- **swisseph**: Swiss Ephemeris calculations
- **astropy**: Astronomical time handling
- **geopy**: Geographic coordinate services  
- **pytz**: Timezone handling
- **timezonefinder**: Automatic timezone detection

## File Structure

```
charts/
├── astrology_calculator.py    # Main combined calculator
├── requirements.txt          # Python dependencies
├── demo.py                  # Usage examples
├── README.md               # This file
└── ephe/                   # Swiss Ephemeris data files
    ├── sepl_18.se1         # Planetary ephemeris
    ├── semo_18.se1         # Moon ephemeris
    └── seas_18.se1         # Asteroid ephemeris
```

## Migration from Individual Files

If you were using the individual planet files (`sun.py`, `moon.py`, etc.), you can:

1. **Replace imports**:
   ```python
   # Old way
   import sun, moon, mars
   
   # New way  
   from astrology_calculator import AstrologyCalculator
   calc = AstrologyCalculator()
   ```

2. **Update function calls**:
   ```python
   # Old way
   sun_pos = sun.calculate_sun_sidereal_longitude(date)
   
   # New way
   sun_pos = calc.calculate_sun_sidereal_longitude(date)
   ```

3. **Or use standalone functions** (no code changes needed):
   ```python
   from astrology_calculator import calculate_sun_sidereal_longitude
   sun_pos = calculate_sun_sidereal_longitude(date)
   ```

## Examples

### Basic Birth Chart
```python
calc = AstrologyCalculator()
chart = calc.get_planetary_chart_data(
    "1990-05-15 14:30:00", 28.6139, 77.2090
)
```

### Current Planetary Positions
```python
from datetime import datetime
now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
positions = calc.get_all_planetary_positions(now)
```

### Check Planet in Sign
```python
sun_long = calc.calculate_sun_sidereal_longitude("2025-01-15")
sign_name = calc.longitude_to_sign_name(sun_long)
degrees = calc.longitude_to_degree_in_sign(sun_long)
print(f"Sun is at {degrees:.1f}° in {sign_name}")
```

## Error Handling

The calculator includes comprehensive error handling for:
- Invalid dates
- Invalid coordinates  
- Missing ephemeris files
- Swiss Ephemeris calculation errors
- Invalid house systems

## License

This project combines and enhances the individual planetary calculation modules into a unified, easy-to-use astrology calculator.