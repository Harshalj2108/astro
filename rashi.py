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

rashi_swabhav = {
    'char_rashi':  [1, 4, 7, 10],   # Aries, Cancer, Libra, Capricorn (Cardinal/Movable)
    'sthir_rashi': [2, 5, 8, 11],   # Taurus, Leo, Scorpio, Aquarius (Fixed)
    'dwi_sabhav_rashi': [3, 6, 9, 12]  # Gemini, Virgo, Sagittarius, Pisces (Dual/Mutable)
}

rashi_tatva = {
    1: 'Agni' ,     # Aries        - Fire
    2: 'Prithvi',   # Taurus       - Earth
    3: 'Vayu',      # Gemini       - Air
    4: 'Jala',      # Cancer       - Water
    5: 'Agni',      # Leo          - Fire
    6: 'Prithvi',   # Virgo        - Earth
    7: 'Vayu',      # Libra        - Air
    8: 'Jala',      # Scorpio      - Water
    9: 'Agni',      # Sagittarius  - Fire
    10: 'Prithvi',  # Capricorn    - Earth
    11: 'Vayu',     # Aquarius     - Air
    12: 'Jala'      # Pisces       - Water
}

odd = {
    1, 3, 5, 7, 9, 11
}
even = {
    2, 4, 6, 8, 10, 12
}

bal = {
    'diva_bali': [5, 6, 7, 8, 11, 12],       # Strong in daytime: Leo, Virgo, Libra, Scorpio, Aquarius, Pisces
    'ratri_bali': [1, 2, 3, 4, 9, 10],       # Strong at night: Aries, Taurus, Gemini, Cancer, Sagittarius, Capricorn

    'udayana_bali': [7, 8, 9, 10, 11, 12],   # Strong in rising signs (ascending half): Libra to Pisces
    'astangata_bali': [1, 2, 3, 4, 5, 6],    # Weak in setting signs (descending half): Aries to Virgo

    'shukla_bali': [1, 2, 3, 4, 5, 6, 7],    # Strong in Shukla Paksha (waxing phase): Tithi 1 to 7
    'krishna_bali': [9, 10, 11, 12, 13, 14, 15],  # Strong in Krishna Paksha: Tithi 9 to 15
}

prashi_dosha_pravrtti = {
    1: {'rashi': 'Aries',       'dosha': 'pitta',        'pravrtti': 'pravrtti_margi'},
    2: {'rashi': 'Taurus',      'dosha': 'tridosha',     'pravrtti': 'nivritti_margi'},
    3: {'rashi': 'Gemini',      'dosha': 'vata',         'pravrtti': 'pravrtti_margi'},
    4: {'rashi': 'Cancer',      'dosha': 'kapha',     'pravrtti': 'nivritti_margi'},
    5: {'rashi': 'Leo',         'dosha': 'pitta',     'pravrtti': 'pravrtti_margi'},
    6: {'rashi': 'Virgo',       'dosha': 'tridosha',      'pravrtti': 'nivritti_margi'},
    7: {'rashi': 'Libra',       'dosha': 'vata',      'pravrtti': 'pravrtti_margi'},
    8: {'rashi': 'Scorpio',     'dosha': 'kapha',  'pravrtti': 'nivritti_margi'},
    9: {'rashi': 'Sagittarius', 'dosha': 'pitta',     'pravrtti': 'pravrtti_margi'},
    10: {'rashi': 'Capricorn',  'dosha': 'tridosha',      'pravrtti': 'nivritti_margi'},
    11: {'rashi': 'Aquarius',   'dosha': 'vata',      'pravrtti': 'pravrtti_margi'},
    12: {'rashi': 'Pisces',     'dosha': 'kapha',     'pravrtti': 'nivritti_margi'},
}

rashi_varna = {
    1: {'rashi': 'Aries',       'varna': 'kshatriya'},
    2: {'rashi': 'Taurus',      'varna': 'vaishya'},
    3: {'rashi': 'Gemini',      'varna': 'shudra'},
    4: {'rashi': 'Cancer',      'varna': 'brahmin'},
    5: {'rashi': 'Leo',         'varna': 'kshatriya'},
    6: {'rashi': 'Virgo',       'varna': 'vaishya'},
    7: {'rashi': 'Libra',       'varna': 'shudra'},
    8: {'rashi': 'Scorpio',     'varna': 'brahmin'},
    9: {'rashi': 'Sagittarius', 'varna': 'kshatriya'},
    10: {'rashi': 'Capricorn',  'varna': 'vaishya'},
    11: {'rashi': 'Aquarius',   'varna': 'shudra'},
    12: {'rashi': 'Pisces',     'varna': 'brahmin'},
}

# List of Krur (Cruel) Rashis
krur_rashi = [1, 3, 5, 7, 9, 11]

# List of Soumya (Gentle) Rashis
soumya_rashi = [2, 4, 6, 8, 10, 12]

disha = {
    'east' : [1, 5, 9],
    'south' : [2, 6, 10],
    'west' : [3, 7, 11],
    'north' : [4, 8, 12]
}

kendra = {
    'char_kendra':  [1, 4, 7, 10],   # Aries, Cancer, Libra, Capricorn (Cardinal/Movable)
    'panafar': [2, 5, 8, 11],   # Taurus, Leo, Scorpio, Aquarius (Fixed)
    'opoklim': [3, 6, 9, 12]  # Gemini, Virgo, Sagittarius, Pisces (Dual/Mutable)
}

trikon = {
    'dharma' : [1, 5, 9],
    'artha' : [2, 6, 10],
    'kama' : [3, 7, 11],
    'moksha' : [4, 8, 12]
}

rashi_body_part = {
    "Mesha": "Head",
    "Vrishabha": "Face, neck, throat",
    "Mithuna": "Shoulders, arms, hands",
    "Karka": "Chest, lungs, breasts",
    "Simha": "Heart, upper back, spine",
    "Kanya": "Stomach, intestines",
    "Tula": "Lower back, kidneys",
    "Vrischika": "Genitals, reproductive organs",
    "Dhanu": "Thighs",
    "Makara": "Knees",
    "Kumbha": "Calves, ankles",
    "Meena": "Feet, toes"
}

bhav_body_part = {
    1: "Head",
    2: "Face, mouth, eyes, teeth",
    3: "Arms, shoulders, hands, collarbone",
    4: "Chest, heart, lungs, breasts",
    5: "Stomach, upper abdomen, liver",
    6: "Lower abdomen, intestines, digestive system",
    7: "Pelvis, reproductive organs, kidneys",
    8: "Genitals, anus, excretory system",
    9: "Thighs",
    10: "Knees",
    11: "Calves, shins",
    12: "Feet, toes"
}

planet_body_part = {
    "Sun": "Heart, eyes (right eye), head, bones",
    "Moon": "Mind, blood, breasts, eyes (left eye), stomach",
    "Mars": "Muscles, bone marrow, head (with Sun), nose, blood",
    "Mercury": "Skin, nervous system, brain, tongue, lungs",
    "Jupiter": "Liver, thighs, fat, ears",
    "Venus": "Reproductive system, face, kidneys, semen, skin",
    "Saturn": "Bones, joints, legs, teeth, nerves, hair",
    "Rahu": "Unknown/diseases of illusion, skin, foreign toxins, chronic ailments",
    "Ketu": "Abdomen, spine, psychic body, hidden pains, wounds"
}

planet_gender = {
    "Sun": "Male",
    "Moon": "Female",
    "Mars": "Male",
    "Mercury": "Neutral (Eunuch/Hermaphrodite)",
    "Jupiter": "Male",
    "Venus": "Female",
    "Saturn": "Neutral (Eunuch/Hermaphrodite)", 
    "Rahu": "Male (sometimes considered Neutral)",
    "Ketu": "Neutral (Spiritual/Mystic nature)"
}

planet_varna = {
    "Sun": "Kshatriya (Warrior/Ruler)",
    "Moon": "Vaishya (Merchant/Farmer)",
    "Mars": "Kshatriya (Warrior)",
    "Mercury": "Vaishya (Merchant/Trader)",
    "Jupiter": "Brahmana (Priest/Teacher)",
    "Venus": "Brahmana (Priest/Artist)",
    "Saturn": "Shudra (Servant/Laborer)",
    "Rahu": "Shudra (Outcast/Shadow Worker)",
    "Ketu": "Moksha Margi (Spiritual/Detached; beyond varna)"
}

drishti_chakra = {
    "Sun": [7],                        # 7th house aspect
    "Moon": [7],                       # 7th house aspect
    "Mercury": [7],                    # 7th house aspect
    "Venus": [7],                      # 7th house aspect
    "Jupiter": [5, 7, 9],              # 5th, 7th, 9th house aspects
    "Mars": [4, 7, 8],                 # 4th, 7th, 8th house aspects
    "Saturn": [3, 7, 10],              # 3rd, 7th, 10th house aspects
    "Rahu": [5, 7, 9],                 # Rahu sometimes follows Jupiter's pattern
    "Ketu": [5, 7, 9]                  # Ketu also sometimes follows Jupiter's pattern
}

rashi_drishti = {
    "Mesha": ["Simha", "Vrischika", "Kumbha"],
    "Vrishabha": ["Kanya", "Dhanu", "Meena"],
    "Mithuna": ["Karka", "Tula", "Makara"],
    "Karka": ["Vrischika", "Kumbha", "Simha"],
    "Simha": ["Dhanu", "Meena", "Kanya"],
    "Kanya": ["Tula", "Makara", "Karka"],
    "Tula": ["Kumbha", "Simha", "Vrischika"],
    "Vrischika": ["Meena", "Kanya", "Dhanu"],
    "Dhanu": ["Makara", "Karka", "Tula"],
    "Makara": ["Simha", "Vrischika", "Kumbha"],
    "Kumbha": ["Kanya", "Dhanu", "Meena"],
    "Meena": ["Karka", "Tula", "Makara"]
}

dik_bala = {
    "Jupiter": "1st House (Ascendant)",
    "Mercury": "1st House (Ascendant)",
    "Sun": "10th House",
    "Mars": "10th House",
    "Venus": "4th House",
    "Moon": "4th House",
    "Saturn": "7th House"
}

# Naisargika Bala (in Shastiamsa or virupa units - standard scale)
naisargika_bala = {
    "Sun": 60,
    "Moon": 51,
    "Venus": 43,
    "Jupiter": 34,
    "Mercury": 26,
    "Mars": 17,
    "Saturn": 9
}

planet_exalt_debil = {
    "Sun": {"exalted": "Mesha", "degree": 10, "debilitated": "Tula", "degree_debil": 10},
    "Moon": {"exalted": "Vrishabha", "degree": 3, "debilitated": "Vrischika", "degree_debil": 3},
    "Mars": {"exalted": "Makara", "degree": 28, "debilitated": "Karka", "degree_debil": 28},
    "Mercury": {"exalted": "Kanya", "degree": 15, "debilitated": "Meena", "degree_debil": 15},
    "Jupiter": {"exalted": "Karka", "degree": 5, "debilitated": "Makara", "degree_debil": 5},
    "Venus": {"exalted": "Meena", "degree": 27, "debilitated": "Kanya", "degree_debil": 27},
    "Saturn": {"exalted": "Tula", "degree": 20, "debilitated": "Mesha", "degree_debil": 20},
    "Rahu": {"exalted": "Vrishabha", "debilitated": "Vrischika"},
    "Ketu": {"exalted": "Vrischika", "debilitated": "Vrishabha"}
}

combustion_orb = {
    "Moon": 12,
    "Mars": {"direct": 17, "retrograde": 8},
    "Mercury": {"direct": 14, "retrograde": 12},
    "Jupiter": 11,
    "Venus": {"direct": 10, "retrograde": 8},
    "Saturn": 15
    # Rahu and Ketu are not combust
}
