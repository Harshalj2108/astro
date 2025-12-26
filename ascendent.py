import swisseph as swe
from astropy.time import Time
import os
import pytz
from datetime import datetime
from timezonefinder import TimezoneFinder
import location2 as loc

def calculate_ascendant_sidereal_longitude(date, latitude, longitude, ephe_path='ephe', house_system='P'):
    """
    Calculate the sidereal longitude of the Ascendant (Lagna) for a given date and location
    using Swiss Ephemeris with Lahiri Ayanamsa.

    Parameters
    ----------
    date : str or `~astropy.time.Time`
        Date and time of observation (e.g., '2025-05-11 14:30:00').
    latitude : float
        Geographic latitude in degrees (positive for North, negative for South).
    longitude : float
        Geographic longitude in degrees (positive for East, negative for West).
    ephe_path : str, optional
        Path to Swiss Ephemeris data files (default: 'ephe').
    house_system : str, optional
        House system for calculation ('P' for Placidus, 'E' for Equal House, etc.).

    Returns
    -------
    float
        Ascendant's sidereal longitude in degrees.
    """
    # Validate inputs
    if not -90 <= latitude <= 90:
        raise ValueError(f"Latitude {latitude} is invalid. Must be between -90 and 90 degrees.")
    if not -180 <= longitude <= 180:
        raise ValueError(f"Longitude {longitude} is invalid. Must be between -180 and 180 degrees.")
    if house_system not in ['P', 'E', 'K', 'R', 'C', 'U', 'V', 'X', 'H', 'T', 'B', 'G', 'Y', 'M', 'A', 'O', 'F', 'D', 'I', 'N', 'S', 'W']:
        raise ValueError(f"Invalid house system '{house_system}'. Use 'P' for Placidus, 'E' for Equal House, etc.")

    # Set ephemeris path
    if not os.path.exists(ephe_path):
        raise FileNotFoundError(f"Ephemeris directory '{ephe_path}' not found. Download files from ftp://ftp.astro.com/pub/swisseph/ephe/")
    swe.set_ephe_path(ephe_path)

    # Convert date to Julian Day
    if isinstance(date, str):
        try:
            t = Time(date)
        except ValueError as e:
            raise ValueError(f"Invalid date format: {e}. Use 'YYYY-MM-DD HH:MM:SS'.")
    else:
        t = date
    jd = t.jd  # Julian Day in UTC


    # Set Lahiri Ayanamsa (sidereal mode)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)
    

    # Calculate house cusps
    try:
        cusps, ascmc = swe.houses_ex(jd, latitude, longitude, house_system.encode('ascii'), flags=swe.FLG_SIDEREAL)
        ascendant_sidereal_long = ascmc[0]  # Ascendant longitude in degrees
        
        
    except Exception as e:
        raise RuntimeError(f"Error calculating Ascendant's position: {e}")

    return ascendant_sidereal_long
