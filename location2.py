
from geopy.geocoders import Nominatim


def place_coordinates():
        # Get geographic coordinates for the place using geopy
    geolocator = Nominatim(user_agent="geoapi")
    place = input("Enter place (city in India, e.g., Delhi): ")
    location_data = geolocator.geocode(place)
        
    if location_data:
        latitude = location_data.latitude
        longitude = location_data.longitude
        print(f"Coordinates for {place}: Latitude: {latitude}, Longitude: {longitude}")
        return latitude, longitude

    else:
        print(f"Error: Unable to find coordinates for '{place}'. Please check the place name.")
        return None, None


