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
import D1

# D2 setup (unchanged)
x = np.linspace(0, 10, 100)
y7 = np.where(x, 10, np.nan)
y8 = np.where(x, 0, np.nan)
y1 = np.where(x, 5, np.nan)
fig = plt.figure(facecolor='lightgray')
ax = fig.add_subplot(111, facecolor='lightblue')

plt.plot(x, y7, 'b-')
plt.plot(x, y8, 'b-')
plt.plot(x, y1, 'b-')
plt.plot([0, 0], [0, 10], 'b-')
plt.plot([10, 10], [0, 10], 'b-')

# House coordinates and labels (unchanged)
coords = [
    (4.3, 8.5), (4, 3)
]

labels = ['4', '5']

sun_long=D1.sun_long
moon_long=D1.moon_long
mercury_long=D1.mercury_long
venus_long=D1.venus_long
mars_long=D1.mars_long
jupiter_long=D1.jupiter_long
saturn_long=D1.saturn_long
rahu_long=D1.rahu_long
ascendent_long=D1.ascendent_long
ketu_long = D1.ketu_long



# Calculate signs (use // for integer division)
sunsign = D1.sunsign
moonsign = D1.moonsign
mercurysign = D1.mercurysign
venussign = D1.venussign
marssign = D1.marssign
jupitersign = D1.jupitersign
saturnsign = D1.saturnsign
rahusign = D1.rahusign
ascendentsign = D1.ascendentsign
ketusign = D1.ketusign

# Calculate degrees and minutes
sundeg = D1.sundeg
moondeg = D1.moondeg
mercurydeg = D1.mercurydeg
venusdeg = D1.venusdeg
marsdeg = D1.marsdeg
jupiterdeg = D1.jupiterdeg
saturndeg = D1.saturndeg
rahudeg = D1.rahudeg
ascendentdeg = D1.ascendentdeg
ketudeg = D1.ketudeg

#ascendent sign
if ascendentsign in (1, 3, 5, 7, 9, 11):
    if ascendentsign <= 15 :
        ascendentsign = 4
    else:
        ascendentsign = 5
else:
    if ascendentsign >= 15 :
        ascendentsign = 4
    else:
        ascendentsign = 5

# House assignments
house1 = ascendentsign  # Initialize house1 with a default value
house2 = (house1 % 12) + 6

# Reorder coordinates based on Ascendant
index = 12 - house1 + 1
reordered_coords = coords[index:] + coords[:index]

# D2 house labels
for (x, y), label in zip(reordered_coords, labels):
        plt.text(x, y, label, fontsize=12, color='black')

# D2 planets
graha = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu']
planetary_signs = [sunsign, moonsign, mercurysign, venussign, marssign, jupitersign, saturnsign, rahusign, ketusign]
planetary_degrees = [sundeg, moondeg, mercurydeg, venusdeg, marsdeg, jupiterdeg, saturndeg, rahudeg, ketudeg]
planetary_longs = [sun_long, moon_long, mercury_long, venus_long, mars_long, jupiter_long, saturn_long, rahu_long, ketu_long]

for i in range(len(planetary_signs)):
    if planetary_signs[i] in (1, 3, 5, 7, 9, 11):
        if planetary_longs[i] % 30 <= 15 :
            planetary_signs[i] = 5
        else:
            planetary_signs[i] = 4

    else:
        if planetary_longs[i] % 30 >= 15 :
            planetary_signs[i] = 5
        else:
            planetary_signs[i] = 4



offsets = {}
for planet, position in zip(graha, planetary_signs):
    if 1 <= position <= 12:
        if position == 5 :
            a = 1
        else:
            a = 0
        x, y = reordered_coords[a]
        offset = offsets.get(position, 0)
        offsets[position] = offset +.5  # Increment offset for next planet in the same house
        plt.text(
            x + 0.5, y - offset,
            f"{planet.capitalize()[:2]}",
            fontsize=9, color='black'
        )
    else:
        print(f"Invalid position for {planet}: {position}. Expected 1–12.")

# Save the D2
output_dir = os.path.join(os.path.expanduser("~"), "Desktop", "draw", 'merger', 'kundlis')
os.makedirs(output_dir, exist_ok=True)
plt.savefig(os.path.join(output_dir, "D2.png"))
plt.close()

# Print Hora Lord
# Hora lord is Sun if planetary longitude in D1 is in first 15° of sign, Moon if in last 15°
for planet, pl_long in zip(graha, planetary_longs):
    hora_lord = "Sun" if (pl_long % 30) < 15 else "Moon"
    print(f"{planet.capitalize()} Hora Lord: {hora_lord}")