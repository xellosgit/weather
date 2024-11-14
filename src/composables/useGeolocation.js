import axios from 'axios';

export function useGeolocation() {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const GEOCODING_API_URL = import.meta.env.VITE_GEOCODING_API_URL;

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            try {
              const { latitude, longitude } = position.coords;
              const city = await reverseGeocode(latitude, longitude);
              resolve(city);
            } catch (error) {
              try {
                const city = await getLocationByIP();
                resolve(city);
              } catch (ipError) {
                reject(ipError);
              }
            }
          },
          async error => {
            try {
              const city = await getLocationByIP();
              resolve(city);
            } catch (ipError) {
              reject(ipError);
            }
          }
        );
      } else {
        getLocationByIP().then(resolve).catch(reject);
      }
    });
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get(`${GEOCODING_API_URL}/reverse`, {
        params: {
          lat,
          lon,
          limit: 1,
          appid: API_KEY,
        },
      });

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          name: location.name,
          country: location.country,
          state: location.state,
          lat: location.lat,
          lon: location.lon,
        };
      }
      throw new Error('No location found');
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw new Error('Failed to get city name from coordinates');
    }
  };

  const getLocationByIP = async () => {
    try {
      const response = await axios.get('http://ip-api.com/json/', {
        params: {
          fields: 'status,message,country,countryCode,city,lat,lon',
        },
      });

      if (response.data.status === 'success') {
        return {
          name: response.data.city,
          country: response.data.country,
          lat: response.data.lat,
          lon: response.data.lon,
        };
      }
      throw new Error('Failed to get location from IP');
    } catch (error) {
      console.error('Error getting location by IP:', error);
      throw new Error('Failed to determine location');
    }
  };

  const formatAddress = components => {
    const city = components.name;
    const state = components.state;
    const country = components.country;

    if (state) {
      return `${city}, ${state}, ${country}`;
    }
    return `${city}, ${country}`;
  };

  return {
    getUserLocation,
    reverseGeocode,
    getLocationByIP,
    formatAddress,
  };
}
