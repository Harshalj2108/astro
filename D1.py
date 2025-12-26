import matplotlib.pyplot as plt
import numpy as np
import swisseph as swe
from astropy.time import Time
import os
import pytz
from datetime import datetime
from timezonefinder import TimezoneFinder
import location2 as loc
import sun
import moon
import mercury
import venus
import mars
import jupiter
import saturn
import rahu
import ascendent

# D1 setup (unchanged)
x = np.linspace(0, 10, 100)
y1 = x
y2 = -x + 10
y3 = np.where(x <= 5, x + 5, np.nan)
y4 = np.where(x >= 5, x - 5, np.nan)
y5 = np.where(x <= 5, 5 - x, np.nan)
y6 = np.where(x >= 5, 15 - x, np.nan)
y7 = np.where(x, 10, np.nan)
y8 = np.where(x, 0, np.nan)

fig = plt.figure(facecolor='lightgray')
ax = fig.add_subplot(111, facecolor='lightblue')
plt.plot(x, y1, 'b-')
plt.plot(x, y2, 'b-')
plt.plot(x, y3, 'b-')
plt.plot(x, y4, 'b-')
plt.plot(x, y5, 'b-')
plt.plot(x, y6, 'b-')
plt.plot(x, y7, 'b-')
plt.plot(x, y8, 'b-')
plt.plot([0, 0], [0, 10], 'b-')
plt.plot([10, 10], [0, 10], 'b-')

# House coordinates and labels (unchanged)
coords = [
    (4.3, 8.5), (1.5, 9), (.2, 8), (1.5, 5.5), (.2, 2), (2, 1.5),
    (4, 3), (7, 1.5), (8.4, 2.4), (6, 5), (8, 7.4), (6.5, 9)
]
labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

# Input handling (using provided input)
try:
        # Get coordinates (for timezone and Ascendant)
        latitude, longitude = loc.place_coordinates()
        # For testing: Hardcode coordinates (e.g., New Delhi)
        # latitude, longitude = 28.6139, 77.2090
        print(f"Coordinates: Latitude {latitude:.6f}°, Longitude {longitude:.6f}°")

        # Get timezone
        tf = TimezoneFinder()
        timezone_name = tf.timezone_at(lat=latitude, lng=longitude)
        if timezone_name is None:
            raise ValueError("Could not determine timezone for the given coordinates.")
        print(f"Timezone: {timezone_name}")
        # For testing: Hardcode timezone
        # timezone_name = 'Asia/Kolkata'

        # Get user input for date and time
        date_input = input("Enter the date and time (YYYY-MM-DD HH:MM:SS): ")

        # Parse and localize the input date
        from_zone = pytz.timezone(timezone_name)
        try:
            local_time = from_zone.localize(datetime.strptime(date_input, "%Y-%m-%d %H:%M:%S"))
        except ValueError as e:
            raise ValueError(f"Invalid date format: {e}. Use 'YYYY-MM-DD HH:MM:SS'.")
        print(f"Local Time: {local_time}")

        # Convert to UTC
        utc_time = local_time.astimezone(pytz.utc)
        print(f"UTC Time: {utc_time}")


except FileNotFoundError as e:
        print(f"Ephemeris file error: {e}")
except ValueError as e:
        print(f"Input error: {e}")
except Exception as e:
        print(f"Error: {e}")

# Calculate planetary positions
astropy_time = Time(utc_time)
ephe_path = 'ephe'
sun_long = sun.calculate_sun_sidereal_longitude(astropy_time, ephe_path=ephe_path)
moon_long = moon.calculate_moon_sidereal_longitude(astropy_time, ephe_path=ephe_path)
mercury_long = mercury.calculate_mercury_sidereal_longitude(astropy_time, ephe_path=ephe_path)
venus_long = venus.calculate_venus_sidereal_longitude(astropy_time, ephe_path=ephe_path)
mars_long = mars.calculate_mars_sidereal_longitude(astropy_time, ephe_path=ephe_path)
jupiter_long = jupiter.calculate_jupiter_sidereal_longitude(astropy_time, ephe_path=ephe_path)
saturn_long = saturn.calculate_saturn_sidereal_longitude(astropy_time, ephe_path=ephe_path)
rahu_long = rahu.calculate_rahu_sidereal_longitude(astropy_time, ephe_path=ephe_path)
ascendent_long = ascendent.calculate_ascendant_sidereal_longitude(astropy_time, latitude, longitude, ephe_path=ephe_path, house_system='W')
ketu_long = (rahu_long + 180) % 360

# Calculate signs (use // for integer division)
sunsign = int(sun_long // 30) + 1
moonsign = int(moon_long // 30) + 1
mercurysign = int(mercury_long // 30) + 1
venussign = int(venus_long // 30) + 1
marssign = int(mars_long // 30) + 1
jupitersign = int(jupiter_long // 30) + 1
saturnsign = int(saturn_long // 30) + 1
rahusign = int(rahu_long // 30) + 1
ascendentsign = int(ascendent_long // 30) + 1
ketusign = int(ketu_long // 30) + 1

# Calculate degrees and minutes (optional, for display)
sundeg = sun_long % 30
moondeg = moon_long % 30
mercurydeg = mercury_long % 30
venusdeg = venus_long % 30
marsdeg = mars_long % 30
jupiterdeg = jupiter_long % 30
saturndeg = saturn_long % 30
rahudeg = rahu_long % 30
ascendentdeg = ascendent_long % 30
ketudeg = ketu_long % 30

sunmin = (sundeg - int(sundeg)) * 60
moonmin = (moondeg - int(moondeg)) * 60
mercurymin = (mercurydeg - int(mercurydeg)) * 60
venusmin = (venusdeg - int(venusdeg)) * 60
marsmin = (marsdeg - int(marsdeg)) * 60
jupitermin = (jupiterdeg - int(jupiterdeg)) * 60
saturnmin = (saturndeg - int(saturndeg)) * 60
rahumin = (rahudeg - int(rahudeg)) * 60
ascendentmin = (ascendentdeg - int(ascendentdeg)) * 60
ketumin = (ketudeg - int(ketudeg)) * 60

# House assignments
house1 = ascendentsign
house2 = (house1 % 12) + 1
house3 = (house2 % 12) + 1
house4 = (house3 % 12) + 1
house5 = (house4 % 12) + 1
house6 = (house5 % 12) + 1
house7 = (house6 % 12) + 1
house8 = (house7 % 12) + 1
house9 = (house8 % 12) + 1
house10 = (house9 % 12) + 1
house11 = (house10 % 12) + 1
house12 = (house11 % 12) + 1

# Reorder coordinates based on Ascendant
index = 12 - house1 + 1
reordered_coords = coords[index:] + coords[:index]

# D1 house labels
for (x, y), label in zip(reordered_coords, labels):
    plt.text(x, y, label, fontsize=12, color='black')

# D1 planets
graha = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu']
planetary_signs = [sunsign, moonsign, mercurysign, venussign, marssign, jupitersign, saturnsign, rahusign, ketusign]
planetary_degrees = [sundeg, moondeg, mercurydeg, venusdeg, marsdeg, jupiterdeg, saturndeg, rahudeg, ketudeg]
planetary_minutes = [sunmin, moonmin, mercurymin, venusmin, marsmin, jupitermin, saturnmin, rahumin, ketumin]

offsets = {}
for planet, position, deg, min_ in zip(graha, planetary_signs, planetary_degrees, planetary_minutes):
    if 1 <= position <= 12:
        x, y = reordered_coords[position - 1]
        offset = offsets.get(position, 0)
        offsets[position] = offset +.5  # Increment offset for next planet in the same house
        plt.text(
            x + 0.5, y - offset,
            f"{planet.capitalize()[:2]} {int(deg)}°{int(min_)}'",
            fontsize=9, color='black'
        )
    else:
        print(f"Invalid position for {planet}: {position}. Expected 1–12.")

# Save the D1
output_dir = os.path.join(os.path.expanduser("~"), "Desktop", "draw", 'merger', 'kundlis')
os.makedirs(output_dir, exist_ok=True)
plt.savefig(os.path.join(output_dir, "D1.png"))
plt.close()

