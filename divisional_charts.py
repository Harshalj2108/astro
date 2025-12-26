"""
Divisional Charts (Varga Charts) Calculator
============================================

This module calculates all divisional charts used in Vedic Astrology.
Each divisional chart divides the 30° of a sign into specific parts.

Supported Charts:
- D1  (Rashi): Birth chart - 1 division per sign (30°)
- D2  (Hora): Wealth - 2 divisions per sign (15° each)
- D3  (Drekkana): Siblings - 3 divisions per sign (10° each)
- D4  (Chaturthamsa): Fortune/Property - 4 divisions per sign (7°30' each)
- D7  (Saptamsa): Children - 7 divisions per sign (4°17'8.57" each)
- D9  (Navamsa): Spouse/Dharma - 9 divisions per sign (3°20' each)
- D10 (Dasamsa): Career - 10 divisions per sign (3° each)
- D12 (Dwadasamsa): Parents - 12 divisions per sign (2°30' each)
- D16 (Shodasamsa): Vehicles/Happiness - 16 divisions per sign (1°52'30" each)
- D20 (Vimsamsa): Spiritual progress - 20 divisions per sign (1°30' each)
- D24 (Chaturvimsamsa): Education - 24 divisions per sign (1°15' each)
- D27 (Bhamsa/Nakshatramsa): Strength - 27 divisions per sign (1°6'40" each)
- D30 (Trimsamsa): Misfortunes - 30 divisions per sign (1° each)
- D40 (Khavedamsa): Maternal legacy - 40 divisions per sign (0°45' each)
- D45 (Akshavedamsa): Paternal legacy - 45 divisions per sign (0°40' each)
- D60 (Shashtiamsa): Past karma - 60 divisions per sign (0°30' each)
"""


def get_sign_number(longitude):
    """Get the sign number (1-12) from longitude."""
    return int(longitude // 30) + 1


def get_degree_in_sign(longitude):
    """Get the degree within the sign (0-30)."""
    return longitude % 30


def calculate_d1(longitude):
    """D1 - Rashi Chart (Birth Chart). No transformation needed."""
    sign = get_sign_number(longitude)
    degree = get_degree_in_sign(longitude)
    return {'sign': sign, 'degree': degree, 'longitude': longitude}


def calculate_d2(longitude):
    """
    D2 - Hora Chart (Wealth)
    Each sign is divided into 2 parts of 15° each.
    Odd signs: 0-15° -> Leo, 15-30° -> Cancer
    Even signs: 0-15° -> Cancer, 15-30° -> Leo
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    part = int(degree_in_sign // 15)  # 0 or 1
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        d2_sign = 5 if part == 0 else 4  # Leo or Cancer
    else:
        d2_sign = 4 if part == 0 else 5  # Cancer or Leo
    
    # Calculate degree in D2
    d2_degree = (degree_in_sign % 15) * 2
    d2_longitude = (d2_sign - 1) * 30 + d2_degree
    
    return {'sign': d2_sign, 'degree': d2_degree, 'longitude': d2_longitude}


def calculate_d3(longitude):
    """
    D3 - Drekkana Chart (Siblings)
    Each sign is divided into 3 parts of 10° each.
    1st decanate (0-10°): Same sign
    2nd decanate (10-20°): 5th from sign
    3rd decanate (20-30°): 9th from sign
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    part = int(degree_in_sign // 10)  # 0, 1, or 2
    
    if part == 0:
        d3_sign = sign
    elif part == 1:
        d3_sign = ((sign - 1 + 4) % 12) + 1  # 5th from sign
    else:
        d3_sign = ((sign - 1 + 8) % 12) + 1  # 9th from sign
    
    d3_degree = (degree_in_sign % 10) * 3
    d3_longitude = (d3_sign - 1) * 30 + d3_degree
    
    return {'sign': d3_sign, 'degree': d3_degree, 'longitude': d3_longitude}


def calculate_d4(longitude):
    """
    D4 - Chaturthamsa Chart (Fortune/Property)
    Each sign is divided into 4 parts of 7°30' each.
    Starts from the sign itself, then 4th, 7th, 10th from it.
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    part = int(degree_in_sign // 7.5)  # 0, 1, 2, or 3
    
    d4_sign = ((sign - 1 + part * 3) % 12) + 1
    d4_degree = (degree_in_sign % 7.5) * 4
    d4_longitude = (d4_sign - 1) * 30 + d4_degree
    
    return {'sign': d4_sign, 'degree': d4_degree, 'longitude': d4_longitude}


def calculate_d7(longitude):
    """
    D7 - Saptamsa Chart (Children)
    Each sign is divided into 7 parts of 4°17'8.57" (30/7°) each.
    Odd signs: Start from same sign
    Even signs: Start from 7th sign
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 30 / 7
    part = int(degree_in_sign // division_size)  # 0 to 6
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        d7_sign = ((sign - 1 + part) % 12) + 1
    else:
        d7_sign = ((sign - 1 + 6 + part) % 12) + 1  # Start from 7th
    
    d7_degree = (degree_in_sign % division_size) * 7
    d7_longitude = (d7_sign - 1) * 30 + d7_degree
    
    return {'sign': d7_sign, 'degree': d7_degree, 'longitude': d7_longitude}


def calculate_d9(longitude):
    """
    D9 - Navamsa Chart (Spouse/Dharma) - Most important divisional chart
    Each sign is divided into 9 parts of 3°20' each.
    
    Fire signs (1,5,9): Start from Aries
    Earth signs (2,6,10): Start from Capricorn
    Air signs (3,7,11): Start from Libra
    Water signs (4,8,12): Start from Cancer
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 30 / 9
    part = int(degree_in_sign // division_size)  # 0 to 8
    
    # Determine starting sign based on element
    if sign in [1, 5, 9]:  # Fire signs
        start_sign = 1  # Aries
    elif sign in [2, 6, 10]:  # Earth signs
        start_sign = 10  # Capricorn
    elif sign in [3, 7, 11]:  # Air signs
        start_sign = 7  # Libra
    else:  # Water signs (4, 8, 12)
        start_sign = 4  # Cancer
    
    d9_sign = ((start_sign - 1 + part) % 12) + 1
    d9_degree = (degree_in_sign % division_size) * 9
    d9_longitude = (d9_sign - 1) * 30 + d9_degree
    
    return {'sign': d9_sign, 'degree': d9_degree, 'longitude': d9_longitude}


def calculate_d10(longitude):
    """
    D10 - Dasamsa Chart (Career)
    Each sign is divided into 10 parts of 3° each.
    Odd signs: Start from same sign
    Even signs: Start from 9th sign
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 3  # 30/10
    part = int(degree_in_sign // division_size)  # 0 to 9
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        d10_sign = ((sign - 1 + part) % 12) + 1
    else:
        d10_sign = ((sign - 1 + 8 + part) % 12) + 1  # Start from 9th
    
    d10_degree = (degree_in_sign % division_size) * 10
    d10_longitude = (d10_sign - 1) * 30 + d10_degree
    
    return {'sign': d10_sign, 'degree': d10_degree, 'longitude': d10_longitude}


def calculate_d12(longitude):
    """
    D12 - Dwadasamsa Chart (Parents)
    Each sign is divided into 12 parts of 2°30' each.
    Starts from the same sign and progresses through all 12 signs.
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 2.5  # 30/12
    part = int(degree_in_sign // division_size)  # 0 to 11
    
    d12_sign = ((sign - 1 + part) % 12) + 1
    d12_degree = (degree_in_sign % division_size) * 12
    d12_longitude = (d12_sign - 1) * 30 + d12_degree
    
    return {'sign': d12_sign, 'degree': d12_degree, 'longitude': d12_longitude}


def calculate_d16(longitude):
    """
    D16 - Shodasamsa Chart (Vehicles/Happiness)
    Each sign is divided into 16 parts of 1°52'30" each.
    Cardinal signs (1,4,7,10): Start from Aries
    Fixed signs (2,5,8,11): Start from Leo
    Mutable signs (3,6,9,12): Start from Sagittarius
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 30 / 16
    part = int(degree_in_sign // division_size)  # 0 to 15
    
    # Determine starting sign based on modality
    if sign in [1, 4, 7, 10]:  # Cardinal
        start_sign = 1  # Aries
    elif sign in [2, 5, 8, 11]:  # Fixed
        start_sign = 5  # Leo
    else:  # Mutable (3, 6, 9, 12)
        start_sign = 9  # Sagittarius
    
    d16_sign = ((start_sign - 1 + part) % 12) + 1
    d16_degree = (degree_in_sign % division_size) * 16
    d16_longitude = (d16_sign - 1) * 30 + d16_degree
    
    return {'sign': d16_sign, 'degree': d16_degree, 'longitude': d16_longitude}


def calculate_d20(longitude):
    """
    D20 - Vimsamsa Chart (Spiritual Progress)
    Each sign is divided into 20 parts of 1°30' each.
    Cardinal signs: Start from Aries
    Fixed signs: Start from Sagittarius
    Mutable signs: Start from Leo
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 1.5  # 30/20
    part = int(degree_in_sign // division_size)  # 0 to 19
    
    if sign in [1, 4, 7, 10]:  # Cardinal
        start_sign = 1  # Aries
    elif sign in [2, 5, 8, 11]:  # Fixed
        start_sign = 9  # Sagittarius
    else:  # Mutable
        start_sign = 5  # Leo
    
    d20_sign = ((start_sign - 1 + part) % 12) + 1
    d20_degree = (degree_in_sign % division_size) * 20
    d20_longitude = (d20_sign - 1) * 30 + d20_degree
    
    return {'sign': d20_sign, 'degree': d20_degree, 'longitude': d20_longitude}


def calculate_d24(longitude):
    """
    D24 - Chaturvimsamsa Chart (Education/Learning)
    Each sign is divided into 24 parts of 1°15' each.
    Odd signs: Start from Leo
    Even signs: Start from Cancer
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 1.25  # 30/24
    part = int(degree_in_sign // division_size)  # 0 to 23
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        start_sign = 5  # Leo
    else:
        start_sign = 4  # Cancer
    
    d24_sign = ((start_sign - 1 + part) % 12) + 1
    d24_degree = (degree_in_sign % division_size) * 24
    d24_longitude = (d24_sign - 1) * 30 + d24_degree
    
    return {'sign': d24_sign, 'degree': d24_degree, 'longitude': d24_longitude}


def calculate_d27(longitude):
    """
    D27 - Bhamsa/Nakshatramsa Chart (Strength/Stamina)
    Each sign is divided into 27 parts of 1°6'40" each.
    Fire signs: Start from Aries
    Earth signs: Start from Cancer
    Air signs: Start from Libra
    Water signs: Start from Capricorn
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 30 / 27
    part = int(degree_in_sign // division_size)  # 0 to 26
    
    if sign in [1, 5, 9]:  # Fire
        start_sign = 1  # Aries
    elif sign in [2, 6, 10]:  # Earth
        start_sign = 4  # Cancer
    elif sign in [3, 7, 11]:  # Air
        start_sign = 7  # Libra
    else:  # Water
        start_sign = 10  # Capricorn
    
    d27_sign = ((start_sign - 1 + part) % 12) + 1
    d27_degree = (degree_in_sign % division_size) * 27
    d27_longitude = (d27_sign - 1) * 30 + d27_degree
    
    return {'sign': d27_sign, 'degree': d27_degree, 'longitude': d27_longitude}


def calculate_d30(longitude):
    """
    D30 - Trimsamsa Chart (Misfortunes/Evil)
    Uses unequal divisions based on sign (odd/even).
    Odd signs: Mars(5°), Saturn(5°), Jupiter(8°), Mercury(7°), Venus(5°)
    Even signs: Venus(5°), Mercury(7°), Jupiter(8°), Saturn(5°), Mars(5°)
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        # Mars(5°) -> Saturn(5°) -> Jupiter(8°) -> Mercury(7°) -> Venus(5°)
        # Signs: Aries, Aquarius, Sagittarius, Gemini, Libra
        if degree_in_sign < 5:
            d30_sign = 1  # Aries (Mars)
            d30_degree = degree_in_sign * 6
        elif degree_in_sign < 10:
            d30_sign = 11  # Aquarius (Saturn)
            d30_degree = (degree_in_sign - 5) * 6
        elif degree_in_sign < 18:
            d30_sign = 9  # Sagittarius (Jupiter)
            d30_degree = (degree_in_sign - 10) * 3.75
        elif degree_in_sign < 25:
            d30_sign = 3  # Gemini (Mercury)
            d30_degree = (degree_in_sign - 18) * (30/7)
        else:
            d30_sign = 7  # Libra (Venus)
            d30_degree = (degree_in_sign - 25) * 6
    else:
        # Venus(5°) -> Mercury(7°) -> Jupiter(8°) -> Saturn(5°) -> Mars(5°)
        # Signs: Taurus, Virgo, Pisces, Capricorn, Scorpio
        if degree_in_sign < 5:
            d30_sign = 2  # Taurus (Venus)
            d30_degree = degree_in_sign * 6
        elif degree_in_sign < 12:
            d30_sign = 6  # Virgo (Mercury)
            d30_degree = (degree_in_sign - 5) * (30/7)
        elif degree_in_sign < 20:
            d30_sign = 12  # Pisces (Jupiter)
            d30_degree = (degree_in_sign - 12) * 3.75
        elif degree_in_sign < 25:
            d30_sign = 10  # Capricorn (Saturn)
            d30_degree = (degree_in_sign - 20) * 6
        else:
            d30_sign = 8  # Scorpio (Mars)
            d30_degree = (degree_in_sign - 25) * 6
    
    d30_longitude = (d30_sign - 1) * 30 + d30_degree
    
    return {'sign': d30_sign, 'degree': d30_degree, 'longitude': d30_longitude}


def calculate_d40(longitude):
    """
    D40 - Khavedamsa Chart (Maternal Legacy)
    Each sign is divided into 40 parts of 0°45' each.
    Odd signs: Start from Aries
    Even signs: Start from Libra
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 0.75  # 30/40
    part = int(degree_in_sign // division_size)  # 0 to 39
    
    is_odd_sign = sign % 2 == 1
    
    if is_odd_sign:
        start_sign = 1  # Aries
    else:
        start_sign = 7  # Libra
    
    d40_sign = ((start_sign - 1 + part) % 12) + 1
    d40_degree = (degree_in_sign % division_size) * 40
    d40_longitude = (d40_sign - 1) * 30 + d40_degree
    
    return {'sign': d40_sign, 'degree': d40_degree, 'longitude': d40_longitude}


def calculate_d45(longitude):
    """
    D45 - Akshavedamsa Chart (Paternal Legacy)
    Each sign is divided into 45 parts of 0°40' each.
    Cardinal signs: Start from Aries
    Fixed signs: Start from Leo
    Mutable signs: Start from Sagittarius
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 30 / 45
    part = int(degree_in_sign // division_size)  # 0 to 44
    
    if sign in [1, 4, 7, 10]:  # Cardinal
        start_sign = 1  # Aries
    elif sign in [2, 5, 8, 11]:  # Fixed
        start_sign = 5  # Leo
    else:  # Mutable
        start_sign = 9  # Sagittarius
    
    d45_sign = ((start_sign - 1 + part) % 12) + 1
    d45_degree = (degree_in_sign % division_size) * 45
    d45_longitude = (d45_sign - 1) * 30 + d45_degree
    
    return {'sign': d45_sign, 'degree': d45_degree, 'longitude': d45_longitude}


def calculate_d60(longitude):
    """
    D60 - Shashtiamsa Chart (Past Karma/General Wellbeing)
    Each sign is divided into 60 parts of 0°30' each.
    Counts from the same sign, cycling through all 12 signs 5 times.
    """
    sign = get_sign_number(longitude)
    degree_in_sign = get_degree_in_sign(longitude)
    division_size = 0.5  # 30/60
    part = int(degree_in_sign // division_size)  # 0 to 59
    
    d60_sign = ((sign - 1 + part) % 12) + 1
    d60_degree = (degree_in_sign % division_size) * 60
    d60_longitude = (d60_sign - 1) * 30 + d60_degree
    
    return {'sign': d60_sign, 'degree': d60_degree, 'longitude': d60_longitude}


# Mapping of chart types to calculation functions
DIVISIONAL_CHARTS = {
    'D1': calculate_d1,
    'D2': calculate_d2,
    'D3': calculate_d3,
    'D4': calculate_d4,
    'D7': calculate_d7,
    'D9': calculate_d9,
    'D10': calculate_d10,
    'D12': calculate_d12,
    'D16': calculate_d16,
    'D20': calculate_d20,
    'D24': calculate_d24,
    'D27': calculate_d27,
    'D30': calculate_d30,
    'D40': calculate_d40,
    'D45': calculate_d45,
    'D60': calculate_d60,
}

CHART_NAMES = {
    'D1': 'Rashi (Birth Chart)',
    'D2': 'Hora (Wealth)',
    'D3': 'Drekkana (Siblings)',
    'D4': 'Chaturthamsa (Fortune)',
    'D7': 'Saptamsa (Children)',
    'D9': 'Navamsa (Spouse/Dharma)',
    'D10': 'Dasamsa (Career)',
    'D12': 'Dwadasamsa (Parents)',
    'D16': 'Shodasamsa (Vehicles)',
    'D20': 'Vimsamsa (Spiritual)',
    'D24': 'Chaturvimsamsa (Education)',
    'D27': 'Bhamsa (Strength)',
    'D30': 'Trimsamsa (Misfortunes)',
    'D40': 'Khavedamsa (Maternal)',
    'D45': 'Akshavedamsa (Paternal)',
    'D60': 'Shashtiamsa (Past Karma)',
}

SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]


def calculate_divisional_chart(chart_type, planetary_positions):
    """
    Calculate a specific divisional chart for all planets.
    
    Parameters
    ----------
    chart_type : str
        The divisional chart type (e.g., 'D9', 'D10')
    planetary_positions : dict
        Dictionary of planetary positions with longitude values
        
    Returns
    -------
    dict
        Divisional chart data for all planets
    """
    if chart_type not in DIVISIONAL_CHARTS:
        raise ValueError(f"Unknown chart type: {chart_type}. Available: {list(DIVISIONAL_CHARTS.keys())}")
    
    calc_func = DIVISIONAL_CHARTS[chart_type]
    result = {}
    
    for planet, data in planetary_positions.items():
        longitude = data['longitude'] if isinstance(data, dict) else data
        div_result = calc_func(longitude)
        
        sign_name = SIGN_NAMES[div_result['sign'] - 1]
        result[planet] = {
            'longitude': round(div_result['longitude'], 6),
            'sign': sign_name,
            'signNumber': div_result['sign'],
            'degreeInSign': round(div_result['degree'], 4),
            'formatted': f"{sign_name} {div_result['degree']:.2f}°"
        }
    
    return result


def calculate_all_divisional_charts(planetary_positions):
    """
    Calculate all divisional charts for the given planetary positions.
    
    Parameters
    ----------
    planetary_positions : dict
        Dictionary of planetary positions with longitude values
        
    Returns
    -------
    dict
        All divisional charts data
    """
    all_charts = {}
    
    for chart_type in DIVISIONAL_CHARTS.keys():
        all_charts[chart_type] = {
            'name': CHART_NAMES[chart_type],
            'planets': calculate_divisional_chart(chart_type, planetary_positions)
        }
    
    return all_charts


if __name__ == "__main__":
    # Test with sample positions
    test_positions = {
        'Sun': {'longitude': 30.78},
        'Moon': {'longitude': 274.72},
        'Mercury': {'longitude': 14.27},
        'Venus': {'longitude': 349.22},
        'Mars': {'longitude': 324.69},
        'Jupiter': {'longitude': 75.84},
        'Saturn': {'longitude': 271.52},
        'Rahu': {'longitude': 286.52},
        'Ketu': {'longitude': 106.52},
        'Ascendant': {'longitude': 151.90}
    }
    
    print("Testing Divisional Charts")
    print("=" * 50)
    
    for chart_type in ['D1', 'D9', 'D10']:
        print(f"\n{chart_type} - {CHART_NAMES[chart_type]}")
        print("-" * 40)
        chart = calculate_divisional_chart(chart_type, test_positions)
        for planet, data in chart.items():
            print(f"  {planet}: {data['formatted']}")
