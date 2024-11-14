import { ref, watch } from 'vue';

export function useI18n() {
  const translations = {
    uk: {
      // Загальні
      main: 'Головна',
      favorites: 'Обране',
      loading: 'Завантаження...',
      error: 'Помилка',
      retry: 'Спробувати ще раз',
      confirm: 'Підтвердити',
      cancel: 'Скасувати',
      ok: 'OK',

      // Погода
      temperature: 'Температура',
      humidity: 'Вологість',
      wind: 'Вітер',
      wind_speed_unit: 'м/с',
      feels_like: 'Відчувається як',
      pressure: 'Тиск',
      pressure_unit: 'гПа',
      clouds: 'Хмарність',
      visibility: 'Видимість',
      sunrise: 'Схід сонця',
      sunset: 'Захід сонця',
      time_of_day: {
        day: 'День',
        night: 'Ніч',
      },
      // Погодні умови
      weather_conditions: {
        cloudy: 'Хмарно',
        sunny: 'Сонячно',
        rainy: 'Дощ',
        partly_cloudy: 'Мінлива хмарність',
        clear: 'Ясно',
        snow: 'Сніг',
        thunderstorm: 'Гроза',
        mist: 'Туман',
        drizzle: 'Мряка',
        overcast: 'Похмуро',
      },

      // Пошук
      search_city: 'Пошук міста...',
      no_results: 'Міст не знайдено',
      select_city: 'Оберіть місто',
      day: 'День',
      week: 'Тиждень',

      // Обране
      add_to_favorites: 'Додати до обраного',
      remove_from_favorites: 'Видалити з обраного',
      no_favorites: 'У вас поки немає обраних міст',
      no_favorites_message:
        'Додайте міста до обраного, щоб швидко перевіряти погоду в них',
      favorites_limit: 'Ліміт обраного',
      favorites_limit_message:
        'Ви можете додати максимум 5 міст до обраного. Видаліть якесь місто, щоб додати нове.',
      favorites_count: 'Обрано {current} з {max} міст',

      // Модальні вікна
      confirm_removal: 'Підтвердження видалення',
      remove_block_confirmation: 'Ви дійсно хочете видалити цей блок погоди?',
      remove_block: 'Видалити блок',

      // Помилки
      location_error: 'Не вдалося визначити ваше місцезнаходження',
      weather_error: 'Не вдалося отримати дані про погоду',
      search_error: 'Помилка пошуку міст',

      // Періоди доби
      morning: 'Ранок',
      day: 'Сьогодні',
      evening: 'Вечір',
      night: 'Ніч',

      // Додаткові функції
      add_city: 'Додати місто',
      refresh: 'Оновити',
      settings: 'Налаштування',
      about: 'Про додаток',
    },
    en: {
      // General
      main: 'Main',
      favorites: 'Favorites',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      confirm: 'Confirm',
      cancel: 'Cancel',
      ok: 'OK',
      time_of_day: {
        day: 'Day',
        night: 'Night',
      },

      // Weather
      temperature: 'Temperature',
      humidity: 'Humidity',
      wind: 'Wind',
      wind_speed_unit: 'm/s',
      feels_like: 'Feels like',
      pressure: 'Pressure',
      pressure_unit: 'hPa',
      clouds: 'Clouds',
      visibility: 'Visibility',
      sunrise: 'Sunrise',
      sunset: 'Sunset',

      // Weather conditions
      weather_conditions: {
        cloudy: 'Cloudy',
        sunny: 'Sunny',
        rainy: 'Rain',
        partly_cloudy: 'Partly Cloudy',
        clear: 'Clear',
        snow: 'Snow',
        thunderstorm: 'Thunderstorm',
        mist: 'Mist',
        drizzle: 'Drizzle',
        overcast: 'Overcast',
      },

      // Search
      search_city: 'Search city...',
      no_results: 'No cities found',
      select_city: 'Select a city',
      day: 'Day',
      week: 'Week',

      // Favorites
      add_to_favorites: 'Add to favorites',
      remove_from_favorites: 'Remove from favorites',
      no_favorites: 'You have no favorite cities yet',
      no_favorites_message:
        'Add cities to favorites to quickly check their weather',
      favorites_limit: 'Favorites limit',
      favorites_limit_message:
        'You can add maximum 5 cities to favorites. Remove some city to add a new one.',
      favorites_count: '{current} of {max} cities selected',

      // Modals
      confirm_removal: 'Confirm removal',
      remove_block_confirmation:
        'Are you sure you want to remove this weather block?',
      remove_block: 'Remove block',

      // Errors
      location_error: 'Failed to determine your location',
      weather_error: 'Failed to get weather data',
      search_error: 'Error searching cities',

      // Time of day
      morning: 'Morning',
      day: 'Today',
      evening: 'Evening',
      night: 'Night',

      // Additional features
      add_city: 'Add city',
      refresh: 'Refresh',
      settings: 'Settings',
      about: 'About',
    },
  };

  // Weather condition mapping for API responses
  const weatherConditionMap = {
    'broken clouds': {
      uk: 'Хмарно',
      en: 'Broken clouds',
    },
    'scattered clouds': {
      uk: 'Розсіяні хмари',
      en: 'Scattered clouds',
    },
    'clear sky': {
      uk: 'Ясно',
      en: 'Clear sky',
    },
    'few clouds': {
      uk: 'Невелика хмарність',
      en: 'Few clouds',
    },
    'light rain': {
      uk: 'Невеликий дощ',
      en: 'Light rain',
    },
    'moderate rain': {
      uk: 'Помірний дощ',
      en: 'Moderate rain',
    },
    'heavy rain': {
      uk: 'Сильний дощ',
      en: 'Heavy rain',
    },
    'overcast clouds': {
      uk: 'Похмуро',
      en: 'Overcast clouds',
    },
    'light snow': {
      uk: 'Невеликий сніг',
      en: 'Light snow',
    },
    'moderate snow': {
      uk: 'Помірний сніг',
      en: 'Moderate snow',
    },
    'heavy snow': {
      uk: 'Сильний сніг',
      en: 'Heavy snow',
    },
    mist: {
      uk: 'Туман',
      en: 'Mist',
    },
    thunderstorm: {
      uk: 'Гроза',
      en: 'Thunderstorm',
    },
    rain: {
      uk: 'Дощ',
      en: 'Rain',
    },
    snow: {
      uk: 'Сніг',
      en: 'Snow',
    },
    drizzle: {
      uk: 'Мряка',
      en: 'Drizzle',
    },
  };

  const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || 'uk';
  const currentLanguage = ref(
    localStorage.getItem('language') || defaultLanguage
  );

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage.value];

    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
    }

    return (translation || key).replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  };

  const translateWeatherCondition = condition => {
    const normalizedCondition = condition.toLowerCase();

    for (const [key, translations] of Object.entries(weatherConditionMap)) {
      if (key.toLowerCase() === normalizedCondition) {
        return translations[currentLanguage.value];
      }
    }

    return condition;
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage.value === 'uk' ? 'en' : 'uk';
    localStorage.setItem('language', newLang);
    window.location.reload();
  };

  const setLanguage = lang => {
    if (translations[lang]) {
      localStorage.setItem('language', lang);
      window.location.reload();
    }
  };

  const formatDate = date => {
    return new Date(date).toLocaleDateString(
      currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const formatTime = date => {
    return new Date(date).toLocaleTimeString(
      currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  watch(currentLanguage, newLang => {
    document.documentElement.lang = newLang;
  });

  return {
    currentLanguage,
    t,
    toggleLanguage,
    setLanguage,
    formatDate,
    formatTime,
    translateWeatherCondition,
  };
}
