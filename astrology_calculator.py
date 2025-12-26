"""
Comprehensive Astrology Calculator
==================================

This module provides a complete set of functions for calculating planetary positions
and astrological charts using Swiss Ephemeris with Lahiri Ayanamsa (sidereal system).

Features:
- Calculate sidereal longitudes for all major planets
- Calculate Ascendant (Lagna)
- Calculate Rahu and Ketu positions
- Location coordinate lookup
- Utility functions for astrological analysis

Dependencies:
- swisseph: Swiss Ephemeris library
- astropy: Astronomical calculations
- geopy: Geographic coordinate lookup
- pytz: Timezone handling
- timezonefinder: Timezone detection

Author: Combined from individual planetary calculation modules
"""

import swisseph as swe
from astropy.time import Time
import os
import pytz
from datetime import datetime
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim


class AstrologyCalculator:
    """
    A comprehensive astrology calculator for sidereal positions using Swiss Ephemeris.
    """
    
    # Planet mapping for Swiss Ephemeris
    PLANETS = {
        'sun': swe.SUN,
        'moon': swe.MOON,
        'mercury': swe.MERCURY,
        'venus': swe.VENUS,
        'mars': swe.MARS,
        'jupiter': swe.JUPITER,
        'saturn': swe.SATURN,
        'uranus': swe.URANUS,
        'neptune': swe.NEPTUNE,
        'rahu': swe.TRUE_NODE,
        'ketu': swe.TRUE_NODE  # Ketu is calculated as Rahu + 180°
    }
    
    def __init__(self, ephe_path='ephe'):
        """
        Initialize the calculator with ephemeris path.
        
        Parameters
        ----------
        ephe_path : str
            Path to Swiss Ephemeris data files (default: 'ephe')
        """
        self.ephe_path = ephe_path
        self._setup_ephemeris()
    
    def _setup_ephemeris(self):
        """Set up Swiss Ephemeris with Lahiri Ayanamsa."""
        if not os.path.exists(self.ephe_path):
            raise FileNotFoundError(
                f"Ephemeris directory '{self.ephe_path}' not found. "
                "Download files from ftp://ftp.astro.com/pub/swisseph/ephe/"
            )
        swe.set_ephe_path(self.ephe_path)
        swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    def _convert_date_to_jd(self, date):
        """
        Convert date to Julian Day.
        
        Parameters
        ----------
        date : str or astropy.time.Time
            Date of observation
        
        Returns
        -------
        float
            Julian Day in UTC
        """
        if isinstance(date, str):
            t = Time(date)
        else:
            t = date
        return t.jd
    
    def calculate_sidereal_longitude(self, date, planet):
        """
        Calculate the sidereal longitude for any planet.
        
        Parameters
        ----------
        date : str or astropy.time.Time
            Date of observation (e.g., '2025-05-11')
        planet : str
            Planet name ('sun', 'moon', 'mercury', 'venus', 'mars', 
            'jupiter', 'saturn', 'uranus', 'neptune', 'rahu', 'ketu')
        
        Returns
        -------
        float
            Planet's sidereal longitude in degrees
        """
        planet = planet.lower()
        
        if planet not in self.PLANETS:
            available = ', '.join(self.PLANETS.keys())
            raise ValueError(f"Unknown planet '{planet}'. Available: {available}")
        
        jd = self._convert_date_to_jd(date)
        flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_TRUEPOS
        
        try:
            result = swe.calc_ut(jd, self.PLANETS[planet], flags)
            if isinstance(result, int):
                raise RuntimeError(f"swe.calc_ut failed with error code: {result}")
            pos, _ = result
            longitude = pos[0]  # Sidereal longitude in degrees
            
            # Special case for Ketu (opposite to Rahu)
            if planet == 'ketu':
                longitude = (longitude + 180) % 360
                
            return longitude
            
        except Exception as e:
            raise RuntimeError(f"Error calculating {planet} position: {e}")
    
    def calculate_ascendant_sidereal_longitude(self, date, latitude, longitude, house_system='P'):
        """
        Calculate the sidereal longitude of the Ascendant (Lagna).
        
        Parameters
        ----------
        date : str or astropy.time.Time
            Date and time of observation (e.g., '2025-05-11 14:30:00')
        latitude : float
            Geographic latitude in degrees (positive for North, negative for South)
        longitude : float
            Geographic longitude in degrees (positive for East, negative for West)
        house_system : str, optional
            House system for calculation ('P' for Placidus, 'E' for Equal House, etc.)
        
        Returns
        -------
        float
            Ascendant's sidereal longitude in degrees
        """
        # Validate inputs
        if not -90 <= latitude <= 90:
            raise ValueError(f"Latitude {latitude} is invalid. Must be between -90 and 90 degrees.")
        if not -180 <= longitude <= 180:
            raise ValueError(f"Longitude {longitude} is invalid. Must be between -180 and 180 degrees.")
        if house_system not in ['P', 'E', 'K', 'R', 'C', 'U', 'V', 'X', 'H', 'T', 'B', 'G', 'Y', 'M', 'A', 'O', 'F', 'D', 'I', 'N', 'S', 'W']:
            raise ValueError(f"Invalid house system '{house_system}'. Use 'P' for Placidus, 'E' for Equal House, etc.")
        
        jd = self._convert_date_to_jd(date)
        
        try:
            cusps, ascmc = swe.houses_ex(jd, latitude, longitude, house_system.encode('ascii'), flags=swe.FLG_SIDEREAL)
            return ascmc[0]  # Ascendant longitude in degrees
        except Exception as e:
            raise RuntimeError(f"Error calculating Ascendant's position: {e}")
    
    def get_all_planetary_positions(self, date, latitude=None, longitude=None):
        """
        Calculate all planetary positions for a given date and location.
        
        Parameters
        ----------
        date : str or astropy.time.Time
            Date and time of observation
        latitude : float, optional
            Geographic latitude (required for Ascendant calculation)
        longitude : float, optional
            Geographic longitude (required for Ascendant calculation)
        
        Returns
        -------
        dict
            Dictionary containing all planetary positions in degrees
        """
        # Calculate all planets using the single function
        planet_names = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                       'jupiter', 'saturn', 'uranus', 'neptune', 'rahu', 'ketu']
        
        positions = {}
        for planet in planet_names:
            positions[planet.capitalize()] = self.calculate_sidereal_longitude(date, planet)
        
        # Add Ascendant if coordinates are provided
        if latitude is not None and longitude is not None:
            positions['Ascendant'] = self.calculate_ascendant_sidereal_longitude(date, latitude, longitude)
        
        return positions
    
    @staticmethod
    def place_coordinates():
        """
        Get geographic coordinates for a place using geopy.
        
        Returns
        -------
        tuple
            (latitude, longitude) or (None, None) if not found
        """
        geolocator = Nominatim(user_agent="astrology_calculator")
        place = input("Enter place (city, e.g., Delhi): ")
        location_data = geolocator.geocode(place)
        
        if location_data:
            latitude = location_data.latitude
            longitude = location_data.longitude
            print(f"Coordinates for {place}: Latitude: {latitude}, Longitude: {longitude}")
            return latitude, longitude
        else:
            print(f"Error: Unable to find coordinates for '{place}'. Please check the place name.")
            return None, None
    
    @staticmethod
    def longitude_to_sign(longitude):
        """
        Convert longitude to zodiac sign number (1-12).
        
        Parameters
        ----------
        longitude : float
            Longitude in degrees
        
        Returns
        -------
        int
            Zodiac sign number (1-12)
        """
        return int(longitude // 30) + 1
    
    @staticmethod
    def longitude_to_sign_name(longitude):
        """
        Convert longitude to zodiac sign name.
        
        Parameters
        ----------
        longitude : float
            Longitude in degrees
        
        Returns
        -------
        str
            Zodiac sign name
        """
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        sign_index = int(longitude // 30)
        return signs[sign_index]
    
    @staticmethod
    def longitude_to_degree_in_sign(longitude):
        """
        Get degrees within the zodiac sign.
        
        Parameters
        ----------
        longitude : float
            Longitude in degrees
        
        Returns
        -------
        float
            Degrees within the sign (0-30)
        """
        return longitude % 30
    
    def get_planetary_chart_data(self, date, latitude=None, longitude=None):
        """
        Get complete chart data with signs and degrees for all planets.
        
        Parameters
        ----------
        date : str or astropy.time.Time
            Date and time of observation
        latitude : float, optional
            Geographic latitude
        longitude : float, optional
            Geographic longitude
        
        Returns
        -------
        dict
            Complete chart data with positions, signs, and degrees
        """
        positions = self.get_all_planetary_positions(date, latitude, longitude)
        
        chart_data = {}
        for planet, long in positions.items():
            chart_data[planet] = {
                'longitude': long,
                'sign_number': self.longitude_to_sign(long),
                'sign_name': self.longitude_to_sign_name(long),
                'degree_in_sign': self.longitude_to_degree_in_sign(long),
                'formatted': f"{self.longitude_to_sign_name(long)} {self.longitude_to_degree_in_sign(long):.2f}°"
            }
        
        return chart_data


# Standalone functions - simplified interface
def calculate_sidereal_longitude(date, planet, ephe_path='ephe'):
    """
    Calculate any planet's sidereal longitude (standalone function).
    
    Parameters
    ----------
    date : str or astropy.time.Time
        Date of observation (e.g., '2025-05-11')
    planet : str
        Planet name ('sun', 'moon', 'mercury', 'venus', 'mars', 
        'jupiter', 'saturn', 'uranus', 'neptune', 'rahu', 'ketu')
    ephe_path : str, optional
        Path to Swiss Ephemeris data files (default: 'ephe')
    
    Returns
    -------
    float
        Planet's sidereal longitude in degrees
    """
    calc = AstrologyCalculator(ephe_path)
    return calc.calculate_sidereal_longitude(date, planet)

def calculate_ascendant_sidereal_longitude(date, latitude, longitude, ephe_path='ephe', house_system='P'):
    """Calculate Ascendant's sidereal longitude (standalone function)."""
    calc = AstrologyCalculator(ephe_path)
    return calc.calculate_ascendant_sidereal_longitude(date, latitude, longitude, house_system)

def place_coordinates():
    """Get geographic coordinates for a place (standalone function)."""
    return AstrologyCalculator.place_coordinates()


if __name__ == "__main__":
    """
    Example usage of the Astrology Calculator
    """
    print("Astrology Calculator - Example Usage")
    print("=" * 40)
    
    try:
        # Initialize calculator
        calc = AstrologyCalculator()
        
        # Get date and time from user
        date_input = input("Enter date and time (YYYY-MM-DD HH:MM:SS): ")
        
        # Get coordinates
        print("Getting location coordinates...")
        latitude, longitude = calc.place_coordinates()
        
        date = date_input
        
        print(f"Calculating planetary positions for: {date}")
        print(f"Location: {latitude}°N, {longitude}°E")
        print("-" * 40)
        
        # Get complete chart data
        chart_data = calc.get_planetary_chart_data(date, latitude, longitude)
        
        # Display results
        for planet, data in chart_data.items():
            print(f"{planet:10}: {data['formatted']}")
        
        print("\n" + "=" * 40)
        print("Calculator ready for use!")
        
    except Exception as e:
        print(f"Error in example: {e}")
        print("Make sure you have the required dependencies and ephemeris files.")
