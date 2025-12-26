import swisseph as swe
from astropy.time import Time
import os
import pytz
from datetime import datetime
from timezonefinder import TimezoneFinder
import location2 as loc

def calculate_neptune_sidereal_longitude(date, ephe_path='ephe'):
    """
    Calculate the sidereal longitude of the neptune for a given date
    using Swiss Ephemeris with Lahiri Ayanamsa.

    Parameters
    ----------
    date : str or `~astropy.time.Time`
        Date of observation (e.g., '2025-05-11').
    ephe_path : str, optional
        Path to Swiss Ephemeris data files (default: 'ephe').

    Returns
    -------
    float
        neptune's sidereal longitude in degrees.
    """
    # Set ephemeris path
    if not os.path.exists(ephe_path):
        raise FileNotFoundError(f"Ephemeris directory '{ephe_path}' not found. Download files from ftp://ftp.astro.com/pub/swisseph/ephe/")
    swe.set_ephe_path(ephe_path)

    # Convert date to Julian Day
    if isinstance(date, str):
        t = Time(date)
    else:
        t = date
    jd = t.jd  # Julian Day in UTC

    # Set Lahiri Ayanamsa (sidereal mode)
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    # Calculate neptune's position
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_TRUEPOS

    try:
        result = swe.calc_ut(jd, swe.NEPTUNE, flags)
        if isinstance(result, int):
            raise RuntimeError(f"swe.calc_ut failed with error code: {result}")
        pos, _ = result  # pos is the tuple (longitude, latitude, ...)
        neptune_sidereal_long = pos[0]  # Sidereal longitude in degrees
    except Exception as e:
        raise RuntimeError(f"Error calculating neptune's position: {e}")

    return neptune_sidereal_long

