<template>
  <!-- The search input allows users to search for cities, showing a loading indicator while fetching results -->
  <div class="weather-block">
    <div class="search-section">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showAutocomplete = true"
          @mousedown.stop
          :placeholder="t('search_city')"
          class="search-input"
          :disabled="loading"
        />
        <div v-if="loading" class="search-loader">
          <div class="loader"></div>
        </div>
        <div v-if="showAutocomplete && cities.length" class="autocomplete">
          <div
            v-for="city in cities"
            :key="city.lat + city.lon"
            class="autocomplete-item"
            @mousedown="selectCity(city)"
          >
            {{ city.name }}, {{ city.country }}
          </div>
        </div>
      </div>

      <!-- Toggles between day and night modes to adjust the weather display -->
      <div class="time-toggle">
        <button
          :class="{ active: timeOfDay === 'day' }"
          @click="changeTimeOfDay('day')"
          :disabled="loading"
        >
          {{ t('time_of_day.day') }} ☀️
        </button>
        <button
          :class="{ active: timeOfDay === 'night' }"
          @click="changeTimeOfDay('night')"
          :disabled="loading"
        >
          {{ t('time_of_day.night') }} 🌙
        </button>
      </div>
      <div class="view-toggle">
        <button
          :class="{ active: viewType === 'day' }"
          @click="changeViewType('day')"
          :disabled="loading"
        >
          {{ t('day') }}
        </button>
        <button
          :class="{ active: viewType === 'week' }"
          @click="changeViewType('week')"
          :disabled="loading"
        >
          {{ t('week') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="retryFetch">
        {{ t('retry') }}
      </button>
    </div>

    <!-- Displays weather details and actions when a city is selected and weather data is loaded -->
    <div v-else-if="selectedCity && weatherData" class="weather-content">
      <div class="weather-info">
        <div class="weather-header">
          <h2>{{ selectedCity.name }}, {{ selectedCity.country }}</h2>
          <div class="weather-actions">
            <button
              class="icon-button favorite-button"
              :class="{ active: isFavorite }"
              @click="$emit('toggle-favorite', selectedCity)"
              :title="
                isFavorite ? t('remove_from_favorites') : t('add_to_favorites')
              "
            >
              ★
            </button>
            <button
              class="icon-button remove-button"
              @click="$emit('remove')"
              :title="t('remove_block')"
            >
              ×
            </button>
          </div>
        </div>

        <div class="weather-details">
          <img
            :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
            :alt="
              translateWeatherCondition(currentWeather.weather[0].description)
            "
            class="weather-icon"
          />
          <div class="temperature">{{ Math.round(currentWeather.temp) }}°C</div>
          <div class="description">
            {{
              translateWeatherCondition(currentWeather.weather[0].description)
            }}
          </div>

          <div class="weather-stats">
            <div class="stat-item">
              <span class="stat-icon">💧</span>
              <span class="stat-value">{{ currentWeather.humidity }}%</span>
              <span class="stat-label">{{ t('humidity') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💨</span>
              <span class="stat-value">
                {{ Math.round(currentWeather.wind_speed) }}
                {{ t('wind_speed_unit') }}
              </span>
              <span class="stat-label">{{ t('wind') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🌡️</span>
              <span class="stat-value">
                {{ Math.round(currentWeather.feels_like) }}°C
              </span>
              <span class="stat-label">{{ t('feels_like') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>{{ t('loading_weather') }}</p>
    </div>

    <div v-else class="empty-state">
      <p>{{ t('select_city') }}</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useWeatherAPI } from '../composables/useWeatherAPI';
  import { useI18n } from '../composables/useI18n';
  import Chart from 'chart.js/auto';
  import debounce from 'lodash/debounce';
  const timeOfDay = ref('day');
  const props = defineProps({
    favorites: {
      type: Array,
      required: true,
    },
    defaultCity: {
      type: Object,
      default: null,
    },
  });
  const changeTimeOfDay = async time => {
    if (time === timeOfDay.value) return;
    timeOfDay.value = time;
    if (selectedCity.value) {
      await fetchWeatherData();
    }
  };
  const emit = defineEmits(['toggle-favorite', 'remove']);
  const { t, translateWeatherCondition } = useI18n();
  const { searchCities, getWeatherData } = useWeatherAPI();

  const searchQuery = ref('');
  const cities = ref([]);
  const showAutocomplete = ref(false);
  const selectedCity = ref(null);
  const weatherData = ref(null);
  const viewType = ref('day');
  const chartRef = ref(null);
  const chart = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const currentWeather = computed(() => {
    if (!weatherData.value) return null;
    return weatherData.value.current;
  });

  const isFavorite = computed(() => {
    if (!selectedCity.value) return false;
    return props.favorites.some(
      city =>
        city.lat === selectedCity.value.lat &&
        city.lon === selectedCity.value.lon
    );
  });

  // Watch for changes in weather data and update the chart if new data is available
  watch(
    weatherData,
    async newData => {
      if (newData) {
        await nextTick();
        if (chartRef.value) {
          await updateChart();
        }
      }
    },
    { deep: true }
  );

  watch(viewType, async (newType, oldType) => {
    if (newType !== oldType && selectedCity.value) {
      loading.value = true;
      try {
        const data = await getWeatherData(selectedCity.value, newType);
        weatherData.value = data;
      } finally {
        loading.value = false;
      }
    }
  });

  // Handles the search input for cities with a debounce to minimize API calls
  const handleSearch = debounce(async () => {
    if (searchQuery.value.length < 3) {
      cities.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    showAutocomplete.value = true;

    try {
      cities.value = await searchCities(searchQuery.value);
    } catch (err) {
      console.error('Search error:', err);
      error.value = t('search_error');
      cities.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);

  const selectCity = async city => {
    selectedCity.value = city;
    searchQuery.value = `${city.name}, ${city.country}`;
    showAutocomplete.value = false;
    await fetchWeatherData();
  };

  const changeViewType = type => {
    if (type === viewType.value) return;
    viewType.value = type;
  };

  // Fetches weather data for the selected city and handles errors gracefully
  const fetchWeatherData = async () => {
    if (!selectedCity.value) return;

    loading.value = true;
    error.value = null;

    try {
      const data = await getWeatherData(selectedCity.value, viewType.value);

      if (viewType.value === 'day') {
        weatherData.value = {
          ...data,
          hourly: data.hourly.filter(item => {
            const hour = new Date(item.dt * 1000).getHours();
            return timeOfDay.value === 'day'
              ? hour >= 6 && hour < 18
              : hour < 6 || hour >= 18;
          }),
        };
      } else {
        weatherData.value = data;
      }
    } catch (err) {
      console.error('Weather data error:', err);
      error.value = t('weather_error');
      weatherData.value = null;
    } finally {
      loading.value = false;
    }
  };

  const retryFetch = () => {
    if (selectedCity.value) {
      fetchWeatherData();
    } else {
      error.value = null;
    }
  };

  // Updates the weather chart based on the current data and view type (hourly or daily)
  const updateChart = async () => {
    if (!weatherData.value || !chartRef.value) {
      return;
    }

    try {
      const ctx = chartRef.value.getContext('2d');

      if (chart.value) {
        chart.value.destroy();
      }

      const data =
        viewType.value === 'day'
          ? weatherData.value.hourly
          : weatherData.value.daily;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return;
      }

      const labels = data.map(item => {
        const date = new Date(item.dt * 1000);
        return viewType.value === 'day'
          ? `${date.getHours()}:00`
          : date.toLocaleDateString();
      });

      const temperatures = data.map(item =>
        viewType.value === 'day' ? item.temp : item.temp.day
      );

      chart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: t('temperature'),
              data: temperatures,
              borderColor: '#2196f3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              ticks: {
                callback: value => `${Math.round(value)}°C`,
              },
            },
          },
          animation: {
            duration: 200,
          },
        },
      });
    } catch (err) {
      console.error('Error creating chart:', err);
      error.value = t('chart_error');
    }
  };

  // Automatically resizes the chart when the window is resized
  const handleResize = debounce(() => {
    if (chart.value) {
      chart.value.resize();
    }
  }, 250);

  onMounted(async () => {
    if (props.defaultCity) {
      await selectCity(props.defaultCity);
    }

    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (chart.value) {
      chart.value.destroy();
    }
  });
</script>

<style scoped>
  .time-toggle,
  .view-toggle {
    display: flex;
    gap: 8px;
  }

  .time-toggle button,
  .view-toggle button {
    padding: 8px 16px;
    border: 1px solid var(--primary-color);
    background: var(--surface-color);
    color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .time-toggle button.active,
  .view-toggle button.active {
    background: var(--primary-color);
    color: white;
  }

  .time-toggle button:hover:not(.active),
  .view-toggle button:hover:not(.active) {
    background-color: var(--primary-light);
    color: white;
  }

  .weather-block {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .search-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .search-container {
    position: relative;
    flex: 1;
  }

  .search-input {
    width: 100%;
    padding: 10px 35px 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-light);
  }

  .search-loader {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  .loader {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .autocomplete {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .autocomplete-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .autocomplete-item:hover {
    background-color: #f5f5f5;
  }

  .weather-content {
    margin-top: 20px;
  }

  .weather-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .weather-actions {
    display: flex;
    gap: 8px;
  }

  .icon-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    transition: transform 0.2s;
    line-height: 1;
  }

  .icon-button:hover {
    transform: scale(1.1);
  }

  .favorite-button {
    color: #ffd700;
  }

  .favorite-button.active {
    color: #ffc107;
  }

  .remove-button {
    color: var(--error-color);
  }

  .weather-details {
    text-align: center;
    margin-bottom: 20px;
  }

  .weather-icon {
    width: 100px;
    height: 100px;
  }

  .temperature {
    font-size: 48px;
    font-weight: bold;
    margin: 10px 0;
  }

  .description {
    color: var(--text-secondary);
    text-transform: capitalize;
    margin-bottom: 20px;
  }

  .weather-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .stat-icon {
    font-size: 24px;
  }

  .stat-value {
    font-weight: bold;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .chart-container {
    height: 300px;
    margin-top: 20px;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-secondary);
    gap: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .search-section {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .search-section {
      grid-template-columns: 1fr;
    }

    .time-toggle,
    .view-toggle {
      justify-content: center;
    }

    .time-toggle button,
    .view-toggle button {
      flex: 1;
    }
  }
</style>
