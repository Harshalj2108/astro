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
import D30

# D4 setup (unchanged)
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

# Calculate planetary positions
sun_long = D30.sun_long
moon_long = D30.moon_long
mars_long = D30.mars_long
mercury_long = D30.mercury_long
jupiter_long = D30.jupiter_long
venus_long = D30.venus_long
saturn_long = D30.saturn_long
rahu_long = D30.rahu_long
ketu_long = D30.ketu_long
ascendent_long = D30.ascendent_long

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

if ascendent_long % 30 <= .5 or 6 < ascendent_long % 30 <= 6.5 or 12 < ascendent_long % 30 <= 12.5 or 18 < ascendent_long % 30 <= 18.5 or 24 < ascendent_long % 30 <= 24.5:
        ascendentsign = ascendentsign
elif .5 < (ascendent_long % 30 ) <= 1 or 6.5 < ascendent_long % 30 <= 7 or 12.5 < ascendent_long % 30 <= 13 or 18.5 < ascendent_long % 30 <= 19 or 24.5 < ascendent_long % 30 <= 25:
        ascendentsign = (ascendentsign + 1)
elif 1 < ascendent_long % 30 <= 1.5 or 7 < ascendent_long % 30 <= 7.5 or 13 < ascendent_long % 30 <= 13.5 or 19 < ascendent_long % 30 <= 19.5 or 25 < ascendent_long % 30 <= 25.5:
        ascendentsign = (ascendentsign + 2)
elif 1.5 < ascendent_long % 30 <= 2 or 7.5 < ascendent_long % 30 <= 8 or 13.5 < ascendent_long % 30 <= 14 or 19.5 < ascendent_long % 30 <= 20 or 25.5 < ascendent_long % 30 <= 26:
        ascendentsign = (ascendentsign + 3)
elif 2 < ascendent_long % 30 <= 2.5 or 8 < ascendent_long % 30 <= 8.5 or 14 < ascendent_long % 30 <= 14.5 or 20 < ascendent_long % 30 <= 20.5 or 26 < ascendent_long % 30 <= 26.5:
        ascendentsign = (ascendentsign + 4)
elif 2.5 < ascendent_long % 30 <= 3 or 8.5 < ascendent_long % 30 <= 9 or 14.5 < ascendent_long % 30 <= 15 or 20.5 < ascendent_long % 30 <= 21 or 26.5 < ascendent_long % 30 <= 27:
        ascendentsign = (ascendentsign + 5)
elif 3 < (ascendent_long % 30 ) <= 3.5 or 9 < ascendent_long % 30 <= 9.5 or 15 < ascendent_long % 30 <= 15.5 or 21 < ascendent_long % 30 <= 21.5 or 27 < ascendent_long % 30 <= 27.5:
        ascendentsign = (ascendentsign + 6)
elif 3.5 < ascendent_long % 30 <= 4 or 9.5 < ascendent_long % 30 <= 10 or 15.5 < ascendent_long % 30 <= 16 or 21.5 < ascendent_long % 30 <= 22 or 27.5 < ascendent_long % 30 <= 28:
        ascendentsign = (ascendentsign + 7)
elif 4 < ascendent_long % 30 <= 4.5 or 10 < ascendent_long % 30 <= 10.5 or 16 < ascendent_long % 30 <= 16.5 or 22 < ascendent_long % 30 <= 22.5 or 28 < ascendent_long % 30 <= 28.5:
        ascendentsign = (ascendentsign + 8)
elif 4.5 < ascendent_long % 30 <= 5 or 10.5 < ascendent_long % 30 <= 11 or 16.5 < ascendent_long % 30 <= 17 or 22.5 < ascendent_long % 30 <= 23 or 28.5 < ascendent_long % 30 <= 29:
        ascendentsign = (ascendentsign + 9)
elif 5 < ascendent_long % 30 <= 5.5 or 11 < ascendent_long % 30 <= 11.5 or 17 < ascendent_long % 30 <= 17.5 or 23 < ascendent_long % 30 <= 23.5 or 29 < ascendent_long % 30 <= 29.5:
            ascendentsign = (ascendentsign + 10)
else:
        if 5.5 < ascendent_long % 30 <= 6 or 11.5 < ascendent_long % 30 <= 12 or 17.5 < ascendent_long % 30 <= 18 or 23.5 < ascendent_long % 30 <= 24 or 29.5 < ascendent_long % 30 <= 30:
            ascendentsign = (ascendentsign + 11)
    
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
planetary_longs = [sun_long, moon_long, mercury_long, venus_long, mars_long, jupiter_long, saturn_long, rahu_long, ketu_long]

#drashkon

for i in range(len(planetary_longs)):
    pos = planetary_signs[i]
    deg = planetary_longs[i] % 30
    # Assign D27 sub-sign like ascendent_long logic
    # Assign D30 sub-sign like ascendent_long logic
    # Assign D60 sub-sign like ascendent_long logic
    if deg <= 0.5 or 6 < deg <= 6.5 or 12 < deg <= 12.5 or 18 < deg <= 18.5 or 24 < deg <= 24.5:
        planetary_signs[i] = pos
    elif 0.5 < deg <= 1 or 6.5 < deg <= 7 or 12.5 < deg <= 13 or 18.5 < deg <= 19 or 24.5 < deg <= 25:
        planetary_signs[i] = (pos + 1 - 1) % 12 + 1
    elif 1 < deg <= 1.5 or 7 < deg <= 7.5 or 13 < deg <= 13.5 or 19 < deg <= 19.5 or 25 < deg <= 25.5:
        planetary_signs[i] = (pos + 2 - 1) % 12 + 1
    elif 1.5 < deg <= 2 or 7.5 < deg <= 8 or 13.5 < deg <= 14 or 19.5 < deg <= 20 or 25.5 < deg <= 26:
        planetary_signs[i] = (pos + 3 - 1) % 12 + 1
    elif 2 < deg <= 2.5 or 8 < deg <= 8.5 or 14 < deg <= 14.5 or 20 < deg <= 20.5 or 26 < deg <= 26.5:
        planetary_signs[i] = (pos + 4 - 1) % 12 + 1
    elif 2.5 < deg <= 3 or 8.5 < deg <= 9 or 14.5 < deg <= 15 or 20.5 < deg <= 21 or 26.5 < deg <= 27:
        planetary_signs[i] = (pos + 5 - 1) % 12 + 1
    elif 3 < deg <= 3.5 or 9 < deg <= 9.5 or 15 < deg <= 15.5 or 21 < deg <= 21.5 or 27 < deg <= 27.5:
        planetary_signs[i] = (pos + 6 - 1) % 12 + 1
    elif 3.5 < deg <= 4 or 9.5 < deg <= 10 or 15.5 < deg <= 16 or 21.5 < deg <= 22 or 27.5 < deg <= 28:
        planetary_signs[i] = (pos + 7 - 1) % 12 + 1
    elif 4 < deg <= 4.5 or 10 < deg <= 10.5 or 16 < deg <= 16.5 or 22 < deg <= 22.5 or 28 < deg <= 28.5:
        planetary_signs[i] = (pos + 8 - 1) % 12 + 1
    elif 4.5 < deg <= 5 or 10.5 < deg <= 11 or 16.5 < deg <= 17 or 22.5 < deg <= 23 or 28.5 < deg <= 29:
        planetary_signs[i] = (pos + 9 - 1) % 12 + 1
    elif 5 < deg <= 5.5 or 11 < deg <= 11.5 or 17 < deg <= 17.5 or 23 < deg <= 23.5 or 29 < deg <= 29.5:
        planetary_signs[i] = (pos + 10 - 1) % 12 + 1
    else:
        if 5.5 < deg <= 6 or 11.5 < deg <= 12 or 17.5 < deg <= 18 or 23.5 < deg <= 24 or 29.5 < deg <= 30:
            planetary_signs[i] = (pos + 11 - 1) % 12 + 1


offsets = {}
for planet, position in zip(graha, planetary_signs):
    if 1 <= position <= 12:
        x, y = reordered_coords[position - 1]
        offset = offsets.get(position, 0)
        offsets[position] = offset +.5  # Increment offset for next planet in the same house
        plt.text(
            x + 0.5, y - offset,
            f"{planet.capitalize()[:2]} ",
            fontsize=9, color='black'
        )
    else:
        print(f"Invalid position for {planet}: {position}. Expected 1–12.")

# Save the D1
output_dir = os.path.join(os.path.expanduser("~"), "Desktop", "draw", 'merger', 'kundlis')
os.makedirs(output_dir, exist_ok=True)
plt.savefig(os.path.join(output_dir, "D60.png"))
plt.close()