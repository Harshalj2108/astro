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
import D9

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
sun_long = D9.sun_long
moon_long = D9.moon_long
mars_long = D9.mars_long
mercury_long = D9.mercury_long
jupiter_long = D9.jupiter_long
venus_long = D9.venus_long
saturn_long = D9.saturn_long
rahu_long = D9.rahu_long
ketu_long = D9.ketu_long
ascendent_long = D9.ascendent_long



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

if ascendentsign in (1, 3, 5, 7, 9, 11) :
    if ascendent_long % 30 <= (30 /10):
        ascendentsign = ascendentsign
    elif (30/10) < (ascendent_long % 30 ) <= (60/10):
        ascendentsign = (ascendentsign + 1) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (60/10) < ascendent_long % 30 <= (90/10):
        ascendentsign = (ascendentsign + 2) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (90/10) < ascendent_long % 30 <= (120/10):
        ascendentsign = (ascendentsign + 3) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (120/10) < ascendent_long % 30 <= (150/10):
        ascendentsign = (ascendentsign + 4) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (150/10) < ascendent_long % 30 <= (180/10):
        ascendentsign = (ascendentsign + 5) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (180/10) < ascendent_long % 30 <= (210/10):
        ascendentsign = (ascendentsign + 6) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (210/10) < ascendent_long % 30 <= (240/10):
        ascendentsign = (ascendentsign + 7) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (240/10) < ascendent_long % 30 <= (270/10):
        ascendentsign = (ascendentsign + 8) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    else:
        ascendentsign = (ascendentsign + 9) % 12
        if ascendentsign == 0:
            ascendentsign = 12

else :
    if ascendent_long % 30 <= (30 /10):
        ascendentsign = (ascendentsign + 8) % 12
        if ascendentsign == 0 :
            ascendentsign = 12
    elif (30/10) < (ascendent_long % 30 ) <= (60/10):
        ascendentsign = (ascendentsign + 9) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (60/10) < ascendent_long % 30 <= (90/10):
        ascendentsign = (ascendentsign + 10) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (90/10) < ascendent_long % 30 <= (120/10):
        ascendentsign = (ascendentsign + 11) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (120/10) < ascendent_long % 30 <= (150/10):
        ascendentsign = ascendentsign
        if ascendentsign == 0:
            ascendentsign = 12
    elif (150/10) < ascendent_long % 30 <= (180/10):
        ascendentsign = (ascendentsign + 1) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (180/10) < ascendent_long % 30 <= (210/10):
        ascendentsign = (ascendentsign + 2) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (210/10) < ascendent_long % 30 <= (240/10):
        ascendentsign = (ascendentsign + 3) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    elif (240/10) < ascendent_long % 30 <= (270/10):
        ascendentsign = (ascendentsign + 4) % 12
        if ascendentsign == 0:
            ascendentsign = 12
    else:
        ascendentsign = (ascendentsign + 5) % 12
        if ascendentsign == 0:
            ascendentsign = 12

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
    if planetary_signs[i] in (1, 3, 5, 7, 9, 11):
        if (planetary_longs[i] % 30) <= (30/10):
            planetary_signs[i] = planetary_signs[i]
        elif (30/10) < (planetary_longs[i] % 30 ) <= (60/10):
            planetary_signs[i] = (planetary_signs[i] + 1) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (60/10) < (planetary_longs[i] % 30) <= (90/10):
            planetary_signs[i] = (planetary_signs[i] + 2) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (90/10) < (planetary_longs[i] % 30) <= (120/10):
            planetary_signs[i] = (planetary_signs[i] + 3) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (120/10) < (planetary_longs[i] % 30) <= (150/10):
            planetary_signs[i] = (planetary_signs[i] + 4) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (150/10) < (planetary_longs[i] % 30) <= (180/10):
            planetary_signs[i] = (planetary_signs[i] + 5) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (180/10) < (planetary_longs[i] % 30) <= (210/10):
            planetary_signs[i] = (planetary_signs[i] + 6) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (210/10) < (planetary_longs[i] % 30) <= (240/10):
            planetary_signs[i] = (planetary_signs[i] + 7) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (240/10) < (planetary_longs[i] % 30) <= (270/10):
            planetary_signs[i] = (planetary_signs[i] + 8) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        else:
            planetary_signs[i] = (planetary_signs[i] + 9) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12

    else:
        if (planetary_longs[i] % 30) <= (30 /10):
            planetary_signs[i] = (planetary_signs[i] + 8) % 12
        elif (30/10) < (planetary_longs[i] % 30 ) <= (60/10):
            planetary_signs[i] = (planetary_signs[i] + 9) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (60/10) < (planetary_longs[i] % 30) <= (90/10):
            planetary_signs[i] = (planetary_signs[i] + 10) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (90/10) < (planetary_longs[i] % 30) <= (120/10):
            planetary_signs[i] = (planetary_signs[i] + 11) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (120/10) < (planetary_longs[i] % 30) <= (150/10):
            planetary_signs[i] = planetary_signs[i]
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (150/10) < (planetary_longs[i] % 30) <= (180/10):
            planetary_signs[i] = (planetary_signs[i] + 1) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (180/10) < (planetary_longs[i] % 30) <= (210/10):
            planetary_signs[i] = (planetary_signs[i] + 2) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (210/10) < (planetary_longs[i] % 30) <= (240/10):
            planetary_signs[i] = (planetary_signs[i] + 3) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        elif (240/10) < (planetary_longs[i] % 30) <= (270/10):
            planetary_signs[i] = (planetary_signs[i] + 4) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12
        else:
            planetary_signs[i] = (planetary_signs[i] + 5) % 12
            if planetary_signs[i] == 0:
                planetary_signs[i] = 12


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
plt.savefig(os.path.join(output_dir, "D10.png"))
plt.close()