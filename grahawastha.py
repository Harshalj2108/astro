import D1
from PIL import Image, ImageDraw, ImageFont

# Planet names and longitudes
planet_longs = {
    'Sun': D1.sun_long,
    'Moon': D1.moon_long,
    'Mars': D1.mars_long,
    'Mercury': D1.mercury_long,
    'Jupiter': D1.jupiter_long,
    'Venus': D1.venus_long,
    'Saturn': D1.saturn_long
}

planet_names = list(planet_longs.keys())

# Extract zodiac sign (1–12) for each planet
planet_signs = {name: int(long // 30) + 1 for name, long in planet_longs.items()}

# Zodiac signs (0 to 11)
signs = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
]

# Rashi dignity for Deeptaadi (exalted, own, enemy, etc.)
planet_dignity = {
    "Sun": {"exalt": "Mesha", "debil": "Tula", "own": ["Simha"]},
    "Moon": {"exalt": "Vrishabha", "debil": "Vrischika", "own": ["Karka"]},
    "Mars": {"exalt": "Makara", "debil": "Karka", "own": ["Mesha", "Vrischika"]},
    "Mercury": {"exalt": "Kanya", "debil": "Meena", "own": ["Mithuna", "Kanya"]},
    "Jupiter": {"exalt": "Karka", "debil": "Makara", "own": ["Dhanu", "Meena"]},
    "Venus": {"exalt": "Meena", "debil": "Kanya", "own": ["Vrishabha", "Tula"]},
    "Saturn": {"exalt": "Tula", "debil": "Mesha", "own": ["Makara", "Kumbha"]},
}

# Combustion orbs (simplified)
combust_orb = {
    "Moon": 12, "Mars": 17, "Mercury": 14, "Jupiter": 11, "Venus": 10, "Saturn": 15
}

# Avastha results will be stored here
graha_avasthas = {}

def get_sign(degree):
    return signs[int(degree // 30)]

def get_deeptaadi(planet, sign):
    info = planet_dignity.get(planet, {})
    if sign == info.get("exalt"):
        return "Deepta"
    elif sign in info.get("own", []):
        return "Swastha"
    elif sign == info.get("debil"):
        return "Dukhita"
    else:
        return "Shanta"  # can later expand to Pramudita, Deena etc.

def get_jagradadi(deeptaadi):
    return {
        "Deepta": "Jagrat",
        "Swastha": "Swapna",
        "Dukhita": "Sushupti"
    }.get(deeptaadi, "Swapna")

def get_balaadi(planet_signs, degree_in_sign):
    if planet_signs in (1, 3, 5, 7, 9, 11): #odd sign
    
        if degree_in_sign <= 6:
            return "Bala"
        elif degree_in_sign <= 12:
            return "Kumara"
        elif degree_in_sign <= 18:
            return "Yuva"
        elif degree_in_sign <= 24:
            return "Vriddha"
        else:
            return "Mrita"
    else: #even sign
        if degree_in_sign <= 6:
            return "Mrita"
        elif degree_in_sign <= 12:
            return "Vriddha"
        elif degree_in_sign <= 18:
            return "Yuva"
        elif degree_in_sign <= 24:
            return "Kumara"
        else:
            return "Bala"
        
def is_combust(planet, planet_deg, sun_deg):
    if planet == "Sun" or planet not in combust_orb:
        return False
    diff = abs((planet_deg - sun_deg + 180) % 360 - 180)
    return diff < combust_orb[planet]

for planet, deg in planet_longs.items():
    sign = get_sign(deg)
    deg_in_sign = deg % 30
    deeptaadi = get_deeptaadi(planet, sign)
    jagradadi = get_jagradadi(deeptaadi)
    balaadi = get_balaadi(planet_signs[planet], deg_in_sign)
    sun_deg = planet_longs.get("Sun", 0)
    combust = is_combust(planet, deg, sun_deg)

    if combust and deeptaadi in ["Dukhita", "Shanta"]:
        lajjitaadi = "Lajjita"
    elif deeptaadi == "Deepta":
        lajjitaadi = "Garvita"
    else:
        lajjitaadi = "Mudita"

    graha_avasthas[planet] = {
        "Sign": sign,
        "Deeptaadi": deeptaadi,
        "Jagradadi": jagradadi,
        "Balaadi": balaadi,
        "Lajjitaadi": lajjitaadi,
        "Combust": combust
    }
    # Write avasthas to a PNG file in tabular format

    # Prepare table data
    fieldnames = ["Planet", "Sign", "Deeptaadi", "Jagradadi", "Balaadi", "Lajjitaadi", "Combust"]
    rows = []
    for planet, avasthas in graha_avasthas.items():
        row = [planet] + [str(avasthas[field]) for field in fieldnames[1:]]
        rows.append(row)

    # Font settings
    try:
        font = ImageFont.truetype("arial.ttf", 18)
    except:
        font = ImageFont.load_default()

    cell_widths = [max(len(str(cell)) for cell in col) * 12 + 20 for col in zip(*([fieldnames] + rows))]
    row_height = 30
    table_width = sum(cell_widths)
    table_height = row_height * (len(rows) + 1)

    img = Image.new("RGB", (table_width, table_height), "white")
    draw = ImageDraw.Draw(img)

    # Draw header
    x = 0
    for i, header in enumerate(fieldnames):
        draw.rectangle([x, 0, x + cell_widths[i], row_height], outline="black", fill="#e0e0e0")
        draw.text((x + 10, 5), header, fill="black", font=font)
        x += cell_widths[i]

    # Draw rows
    for row_idx, row in enumerate(rows):
        x = 0
        y = row_height * (row_idx + 1)
        for col_idx, cell in enumerate(row):
            draw.rectangle([x, y, x + cell_widths[col_idx], y + row_height], outline="black", fill="white")
            draw.text((x + 10, y + 5), str(cell), fill="black", font=font)
            x += cell_widths[col_idx]

    img.save("graha_avasthas.png")
  
