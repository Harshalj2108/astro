import D1

# Planetary longitudes
planet_longitudes = {
    'Sun': D1.sun_long,
    'Moon': D1.moon_long,
    'Mars': D1.mars_long,
    'Mercury': D1.mercury_long,
    'Jupiter': D1.jupiter_long,
    'Venus': D1.venus_long,
    'Saturn': D1.saturn_long
}

# Function to normalize angle between 0-360
def normalize(angle):
    return angle % 360

# Function to calculate which signs a planet aspects
def get_graha_drishti(planet, position):
    aspects = []

    # Basic 7th aspect
    aspects.append(normalize(position + 180))

    # Additional aspects
    if planet == 'Mars':
        aspects.append(normalize(position + 90))  # 4th
        aspects.append(normalize(position + 210))  # 8th
    elif planet == 'Jupiter':
        aspects.append(normalize(position + 120))  # 5th
        aspects.append(normalize(position + 240))  # 9th
    elif planet == 'Saturn':
        aspects.append(normalize(position + 60))   # 3rd
        aspects.append(normalize(position + 270))  # 10th

    return aspects

# Mapping planets to their drishti degrees and the signs they aspect
def get_aspect_report():
    report = {}
    for planet, pos in planet_longitudes.items():
        aspect_points = get_graha_drishti(planet, pos)
        aspect_signs = [int(deg // 30) + 1 for deg in aspect_points]
        report[planet] = {
            "aspects_degrees": [round(a, 2) for a in aspect_points],
            "aspects_signs": aspect_signs
        }
    return report

# Displaying the Graha Drishti table
def print_aspect_report(report):
    print("Graha Drishti (Planetary Aspects):\n")
    for planet, data in report.items():
        print(f"{planet} aspects:")
        for deg, sign in zip(data["aspects_degrees"], data["aspects_signs"]):
            print(f"  → {deg:.2f}° (Sign {sign})")
        print()

# Execute
aspect_data = get_aspect_report()
print_aspect_report(aspect_data)

def get_aspected_houses(planet_sign, planet_name):
    """
    Returns list of houses aspected by a planet based on Graha Drishti rules.
    Input:
        planet_sign: (1 to 12) current Rashi (sign) position of planet
        planet_name: (str) lowercase name of the planet
    Output:
        List of house numbers (1–12) that are aspected
    """
    # Standard 7th aspect
    aspects = [(planet_sign + 6 - 1) % 12 + 1]  # 7th from self

    # Special aspects
    if planet_name == 'jupiter':
        aspects += [(planet_sign + 4 - 1) % 12 + 1, (planet_sign + 8 - 1) % 12 + 1]  # 5th, 9th
    elif planet_name == 'mars':
        aspects += [(planet_sign + 3 - 1) % 12 + 1, (planet_sign + 7 - 1) % 12 + 1]  # 4th, 8th
    elif planet_name == 'saturn':
        aspects += [(planet_sign + 2 - 1) % 12 + 1, (planet_sign + 9 - 1) % 12 + 1]  # 3rd, 10th

    return sorted(set(aspects))
