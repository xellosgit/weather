import axios from 'axios';
import { useI18n } from './useI18n';

export function useWeatherAPI() {
  const { currentLanguage } = useI18n();
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
  const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0';

  const getWeatherInstance = () =>
    axios.create({
      baseURL: WEATHER_API_URL,
      params: {
        appid: API_KEY,
        units: 'metric',
        lang: currentLanguage.value, // Динамічна мова
      },
    });

  const geoInstance = axios.create({
    baseURL: GEOCODING_API_URL,
    params: {
      appid: API_KEY,
      limit: 5,
    },
  });

  const searchCities = async query => {
    try {
      console.log('Searching cities with query:', query);
      const response = await geoInstance.get('/direct', {
        params: {
          q: query,
        },
      });
      console.log('Cities search response:', response.data);

      return response.data.map(city => ({
        name:
          currentLanguage.value === 'uk'
            ? city.local_names?.uk || city.name
            : city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
      }));
    } catch (error) {
      console.error('Cities search error:', error.response || error);
      throw new Error('Failed to search cities');
    }
  };

  const getWeatherData = async (city, type = 'day') => {
    try {
      console.log('Fetching weather for:', city);
      const weatherInstance = getWeatherInstance(); // Отримуємо новий екземпляр з поточною мовою
      let response;

      if (type === 'day') {
        const currentWeather = await weatherInstance.get('/weather', {
          params: {
            lat: city.lat,
            lon: city.lon,
          },
        });

        const hourlyForecast = await weatherInstance.get('/forecast', {
          params: {
            lat: city.lat,
            lon: city.lon,
            cnt: 24,
          },
        });

        console.log('Weather response (day):', {
          current: currentWeather.data,
          hourly: hourlyForecast.data,
        });

        return {
          current: {
            temp: currentWeather.data.main.temp,
            feels_like: currentWeather.data.main.feels_like,
            humidity: currentWeather.data.main.humidity,
            wind_speed: currentWeather.data.wind.speed,
            weather: currentWeather.data.weather,
          },
          hourly: hourlyForecast.data.list.map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            weather: item.weather,
          })),
        };
      } else {
        response = await weatherInstance.get('/forecast', {
          params: {
            lat: city.lat,
            lon: city.lon,
            cnt: 40, // 5 days forecast
          },
        });

        const dailyData = {};
        response.data.list.forEach(item => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!dailyData[date]) {
            dailyData[date] = {
              temps: [],
              humidity: [],
              wind: [],
              dt: item.dt,
              weather: item.weather,
            };
          }
          dailyData[date].temps.push(item.main.temp);
          dailyData[date].humidity.push(item.main.humidity);
          dailyData[date].wind.push(item.wind.speed);
        });

        return {
          current: {
            temp: response.data.list[0].main.temp,
            feels_like: response.data.list[0].main.feels_like,
            humidity: response.data.list[0].main.humidity,
            wind_speed: response.data.list[0].wind.speed,
            weather: response.data.list[0].weather,
          },
          daily: Object.entries(dailyData).map(([date, data]) => ({
            dt: data.dt,
            temp: {
              day:
                data.temps.reduce((sum, temp) => sum + temp, 0) /
                data.temps.length,
            },
            humidity: Math.round(
              data.humidity.reduce((sum, h) => sum + h, 0) /
                data.humidity.length
            ),
            wind_speed:
              data.wind.reduce((sum, w) => sum + w, 0) / data.wind.length,
            weather: data.weather,
          })),
        };
      }
    } catch (error) {
      console.error('Weather fetch error:', error.response || error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch weather data'
      );
    }
  };

  return {
    searchCities,
    getWeatherData,
  };
}
