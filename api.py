"""
Astrology API Server
====================

A Flask-based REST API that provides accurate planetary calculations using Swiss Ephemeris.
This API is meant to be called by the Next.js website to get pre-calculated planetary positions.

Endpoints:
- POST /calculate - Calculate chart for given date, time, and location
- GET /health - Health check

Usage:
    python api.py
    
The server runs on http://localhost:5000 by default.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from astrology_calculator import AstrologyCalculator
from divisional_charts import calculate_divisional_chart, calculate_all_divisional_charts, CHART_NAMES, DIVISIONAL_CHARTS
from datetime import datetime
import traceback
import pytz
from timezonefinder import TimezoneFinder

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js to call this API

# Initialize calculator and timezone finder once
try:
    calculator = AstrologyCalculator()
    timezone_finder = TimezoneFinder()
    print("✓ Swiss Ephemeris initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize Swiss Ephemeris: {e}")
    calculator = None
    timezone_finder = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ephemeris_loaded': calculator is not None
    })


@app.route('/calculate', methods=['POST'])
def calculate_chart():
    """
    Calculate planetary positions for a birth chart.
    
    Request Body:
    {
        "date": "2025-05-11",           # Date in YYYY-MM-DD format
        "time": "14:30:00",              # Time in HH:MM:SS format (optional, defaults to 12:00:00)
        "latitude": 28.6139,             # Geographic latitude
        "longitude": 77.2090,            # Geographic longitude
        "timezone": "Asia/Kolkata"       # Optional timezone (defaults to UTC)
    }
    
    Response:
    {
        "success": true,
        "data": {
            "planets": {
                "Sun": { "longitude": 25.5, "sign": "Aries", "signNumber": 1, "degreeInSign": 25.5 },
                ...
            },
            "ascendant": { ... },
            "calculatedAt": "2025-12-24T10:00:00Z",
            "inputData": { ... }
        }
    }
    """
    if calculator is None:
        return jsonify({
            'success': False,
            'error': 'Ephemeris not initialized. Check server logs.'
        }), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        date_str = data.get('date')
        time_str = data.get('time', '12:00:00')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not date_str:
            return jsonify({
                'success': False,
                'error': 'Date is required (format: YYYY-MM-DD)'
            }), 400
        
        if latitude is None or longitude is None:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        # Validate coordinates
        try:
            latitude = float(latitude)
            longitude = float(longitude)
            if not -90 <= latitude <= 90:
                raise ValueError("Latitude must be between -90 and 90")
            if not -180 <= longitude <= 180:
                raise ValueError("Longitude must be between -180 and 180")
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': f'Invalid coordinates: {str(e)}'
            }), 400
        
        # Convert local time to UTC based on birth location timezone
        # This is CRITICAL for accurate Ascendant calculation
        local_datetime_str = f"{date_str} {time_str}"
        try:
            # Find timezone based on coordinates
            tz_name = timezone_finder.timezone_at(lat=latitude, lng=longitude)
            if tz_name:
                tz = pytz.timezone(tz_name)
                local_dt = datetime.strptime(local_datetime_str, "%Y-%m-%d %H:%M:%S")
                local_dt = tz.localize(local_dt)
                utc_dt = local_dt.astimezone(pytz.UTC)
                datetime_str = utc_dt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                # Fallback: use as-is if timezone cannot be determined
                datetime_str = local_datetime_str
        except Exception as tz_error:
            print(f"Warning: Timezone conversion failed: {tz_error}, using local time as-is")
            datetime_str = local_datetime_str
        
        # Calculate all planetary positions
        chart_data = calculator.get_planetary_chart_data(datetime_str, latitude, longitude)
        
        # Format response for the website
        planets = {}
        ascendant_data = None
        
        for planet, info in chart_data.items():
            planet_info = {
                'longitude': round(info['longitude'], 6),
                'sign': info['sign_name'],
                'signNumber': info['sign_number'],
                'degreeInSign': round(info['degree_in_sign'], 4),
                'formatted': info['formatted']
            }
            
            if planet == 'Ascendant':
                ascendant_data = planet_info
            else:
                planets[planet] = planet_info
        
        # Calculate house cusps (12 houses)
        houses = calculate_houses(datetime_str, latitude, longitude)
        
        # Get requested chart type (default to D1)
        chart_type = data.get('chartType', 'D1')
        
        # Calculate divisional chart if not D1
        divisional_data = None
        if chart_type != 'D1' and chart_type in DIVISIONAL_CHARTS:
            # Prepare positions for divisional calculation
            all_positions = {**planets}
            all_positions['Ascendant'] = ascendant_data
            divisional_data = calculate_divisional_chart(chart_type, 
                {k: {'longitude': v['longitude']} for k, v in all_positions.items()})
        
        return jsonify({
            'success': True,
            'data': {
                'planets': planets,
                'ascendant': ascendant_data,
                'houses': houses,
                'chartType': chart_type,
                'chartName': CHART_NAMES.get(chart_type, 'Birth Chart'),
                'divisionalChart': divisional_data,
                'calculatedAt': datetime.utcnow().isoformat() + 'Z',
                'inputData': {
                    'date': date_str,
                    'time': time_str,
                    'latitude': latitude,
                    'longitude': longitude
                }
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/divisional-charts', methods=['POST'])
def get_all_divisional_charts():
    """
    Calculate all divisional charts (D1-D60) for a birth chart.
    
    Request Body:
    {
        "date": "2025-05-11",
        "time": "14:30:00",
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    
    Response:
    {
        "success": true,
        "data": {
            "D1": { "name": "Rashi", "planets": {...} },
            "D9": { "name": "Navamsa", "planets": {...} },
            ...
        }
    }
    """
    if calculator is None:
        return jsonify({
            'success': False,
            'error': 'Ephemeris not initialized.'
        }), 500
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        date_str = data.get('date')
        time_str = data.get('time', '12:00:00')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not date_str or latitude is None or longitude is None:
            return jsonify({
                'success': False,
                'error': 'date, latitude, and longitude are required'
            }), 400
        
        latitude = float(latitude)
        longitude = float(longitude)
        
        # Convert local time to UTC
        local_datetime_str = f"{date_str} {time_str}"
        try:
            tz_name = timezone_finder.timezone_at(lat=latitude, lng=longitude)
            if tz_name:
                tz = pytz.timezone(tz_name)
                local_dt = datetime.strptime(local_datetime_str, "%Y-%m-%d %H:%M:%S")
                local_dt = tz.localize(local_dt)
                utc_dt = local_dt.astimezone(pytz.UTC)
                datetime_str = utc_dt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                datetime_str = local_datetime_str
        except Exception:
            datetime_str = local_datetime_str
        
        # Get D1 chart positions
        chart_data = calculator.get_planetary_chart_data(datetime_str, latitude, longitude)
        
        # Prepare positions for divisional calculations
        positions = {}
        for planet, info in chart_data.items():
            positions[planet] = {'longitude': info['longitude']}
        
        # Calculate all divisional charts
        all_charts = calculate_all_divisional_charts(positions)
        
        return jsonify({
            'success': True,
            'data': {
                'charts': all_charts,
                'availableCharts': list(CHART_NAMES.keys()),
                'chartNames': CHART_NAMES,
                'calculatedAt': datetime.utcnow().isoformat() + 'Z'
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/chart-types', methods=['GET'])
def get_chart_types():
    """Get list of available divisional chart types."""
    return jsonify({
        'success': True,
        'data': {
            'chartTypes': list(CHART_NAMES.keys()),
            'chartNames': CHART_NAMES
        }
    })


def calculate_houses(datetime_str, latitude, longitude):
    """
    Calculate all 12 house cusps using Swiss Ephemeris.
    """
    import swisseph as swe
    from astropy.time import Time
    
    t = Time(datetime_str)
    jd = t.jd
    
    # Use Whole Sign house system ('W') which is traditional in Vedic astrology
    # Other options: 'P' (Placidus), 'E' (Equal), 'K' (Koch)
    cusps, ascmc = swe.houses_ex(jd, latitude, longitude, b'W', flags=swe.FLG_SIDEREAL)
    
    houses = {}
    for i, cusp in enumerate(cusps[:12], 1):
        sign_index = int(cusp // 30)
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        houses[f'house{i}'] = {
            'cusp': round(cusp, 6),
            'sign': signs[sign_index],
            'signNumber': sign_index + 1,
            'degreeInSign': round(cusp % 30, 4)
        }
    
    return houses


@app.route('/geocode', methods=['GET'])
def geocode_place():
    """
    Get coordinates for a place name.
    
    Query Parameters:
        place: Place name (e.g., "Delhi, India")
    
    Response:
    {
        "success": true,
        "data": {
            "place": "Delhi, India",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "displayName": "Delhi, Delhi, India"
        }
    }
    """
    from geopy.geocoders import Nominatim
    
    place = request.args.get('place')
    if not place:
        return jsonify({
            'success': False,
            'error': 'Place query parameter is required'
        }), 400
    
    try:
        geolocator = Nominatim(user_agent="astrology_calculator_api")
        location = geolocator.geocode(place)
        
        if location:
            return jsonify({
                'success': True,
                'data': {
                    'place': place,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'displayName': location.address
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Could not find coordinates for "{place}"'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("Astrology Calculation API Server")
    print("=" * 50)
    print("\nEndpoints:")
    print("  POST /calculate  - Calculate chart positions")
    print("  GET  /geocode    - Get coordinates for a place")
    print("  GET  /health     - Health check")
    print("\nStarting server on http://localhost:5000")
    print("=" * 50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
