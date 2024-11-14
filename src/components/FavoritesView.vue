<template>
  <!-- Displays the title of the "Favorites" section with localization support -->
  <div class="favorites-view">
    <h2 class="favorites-title">{{ t('favorites') }}</h2>

    <!-- Shows a message when there are no favorite cities added -->
    <div v-if="favorites.length === 0" class="empty-favorites">
      <div class="empty-content">
        <div class="empty-icon">★</div>
        <p class="empty-text">{{ t('no_favorites_message') }}</p>
      </div>
    </div>

    <div v-else class="favorites-grid">
      <div
        v-for="city in favorites"
        :key="`${city.name}-${city.country}`"
        class="favorite-card"
      >
        <div class="favorite-header">
          <h3>{{ city.name }}, {{ city.country }}</h3>
          <button
            class="remove-button"
            @click="confirmRemoveFavorite(city)"
            :title="t('remove_from_favorites')"
          >
            ×
          </button>
        </div>

        <div class="controls-container">
          <!-- Toggle between day and night modes for the weather display -->
          <div class="time-toggle">
            <button
              :class="{ active: timeOfDay[city.name] === 'day' }"
              @click="changeTimeOfDay(city, 'day')"
            >
              {{ t('time_of_day.day') }} ☀️
            </button>
            <button
              :class="{ active: timeOfDay[city.name] === 'night' }"
              @click="changeTimeOfDay(city, 'night')"
            >
              {{ t('time_of_day.night') }} 🌙
            </button>
          </div>

          <div class="view-toggle">
            <button
              :class="{ active: viewTypes[city.name] === 'day' }"
              @click="changeViewType(city, 'day')"
            >
              {{ t('day') }}
            </button>
            <button
              :class="{ active: viewTypes[city.name] === 'week' }"
              @click="changeViewType(city, 'week')"
            >
              {{ t('week') }}
            </button>
          </div>
        </div>

        <div v-if="weatherData[city.name]" class="weather-content">
          <div class="weather-main">
            <img
              :src="`https://openweathermap.org/img/wn/${weatherData[city.name].current.weather[0].icon}@2x.png`"
              :alt="weatherData[city.name].current.weather[0].description"
              class="weather-icon"
            />
            <div class="temperature">
              {{ Math.round(weatherData[city.name].current.temp) }}°C
            </div>
            <div class="description">
              {{ weatherData[city.name].current.weather[0].description }}
            </div>
          </div>

          <div class="weather-stats">
            <div class="stat-item">
              <span class="stat-icon">💧</span>
              <span class="stat-value">
                {{ weatherData[city.name].current.humidity }}%
              </span>
              <span class="stat-label">{{ t('humidity') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💨</span>
              <span class="stat-value">
                {{ Math.round(weatherData[city.name].current.wind_speed) }}
                {{ t('wind_speed_unit') }}
              </span>
              <span class="stat-label">{{ t('wind') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🌡️</span>
              <span class="stat-value">
                {{ Math.round(weatherData[city.name].current.feels_like) }}°C
              </span>
              <span class="stat-label">{{ t('feels_like') }}</span>
            </div>
          </div>

          <div class="chart-container">
            <canvas :ref="el => (chartRefs[city.name] = el)"></canvas>
          </div>
        </div>

        <div v-else class="loading-state">
          <div class="loader"></div>
          <p>{{ t('loading_weather') }}</p>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-if="showRemoveModal"
    @close="showRemoveModal = false"
    @confirm="removeFavorite"
    :title="t('confirm_removal')"
    :message="t('remove_block_confirmation')"
  />
</template>

<script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { useWeatherAPI } from '../composables/useWeatherAPI';
  import { useI18n } from '../composables/useI18n';
  import ConfirmModal from './ConfirmModal.vue';
  import Chart from 'chart.js/auto';

  const props = defineProps({
    favorites: {
      type: Array,
      required: true,
    },
  });

  const emit = defineEmits(['remove-favorite', 'switch-to-main']);
  const { t } = useI18n();
  const { getWeatherData } = useWeatherAPI();

  const viewTypes = ref({});
  const timeOfDay = ref({});
  const weatherData = ref({});
  const chartRefs = ref({});
  const charts = ref({});
  const showRemoveModal = ref(false);
  const blockToRemove = ref(null);

  // Fetch weather data for each favorite city when the component mounts
  onMounted(() => {
    props.favorites.forEach(city => {
      viewTypes.value[city.name] = 'day';
      timeOfDay.value[city.name] = 'day';
      fetchWeatherData(city);
    });
  });

  const changeTimeOfDay = async (city, time) => {
    if (timeOfDay.value[city.name] === time) return;
    timeOfDay.value[city.name] = time;
    await fetchWeatherData(city);
  };

  const fetchWeatherData = async city => {
    try {
      const data = await getWeatherData(city, viewTypes.value[city.name]);

      if (viewTypes.value[city.name] === 'day') {
        const filteredData = {
          ...data,
          hourly: data.hourly.filter(item => {
            const hour = new Date(item.dt * 1000).getHours();
            return timeOfDay.value[city.name] === 'day'
              ? hour >= 6 && hour < 18
              : hour < 6 || hour >= 18;
          }),
        };
        weatherData.value[city.name] = filteredData;
      } else {
        weatherData.value[city.name] = data;
      }

      await nextTick();
      updateChart(city);
    } catch (error) {
      console.error(`Error fetching weather for ${city.name}:`, error);
    }
  };

  const changeViewType = async (city, type) => {
    if (viewTypes.value[city.name] !== type) {
      viewTypes.value[city.name] = type;
      await fetchWeatherData(city);
    }
  };

  // Update the weather chart whenever new weather data is fetched
  const updateChart = city => {
    const chartRef = chartRefs.value[city.name];
    if (!chartRef) return;

    if (charts.value[city.name]) {
      charts.value[city.name].destroy();
    }

    const data =
      viewTypes.value[city.name] === 'day'
        ? weatherData.value[city.name].hourly
        : weatherData.value[city.name].daily.slice(0, 7);

    const labels = data.map(item => {
      const date = new Date(item.dt * 1000);
      return viewTypes.value[city.name] === 'day'
        ? `${date.getHours()}:00`
        : date.toLocaleDateString();
    });

    const temperatures = data.map(item =>
      viewTypes.value[city.name] === 'day' ? item.temp : item.temp.day
    );

    charts.value[city.name] = new Chart(chartRef.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t('temperature'),
            data: temperatures,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#2196f3',
            pointBorderColor: '#2196f3',
            pointHoverBackgroundColor: '#1976d2',
            pointHoverBorderColor: '#1976d2',
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
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
              drawBorder: false,
            },
            ticks: {
              callback: value => `${Math.round(value)}°C`,
              color: 'var(--text-color)',
            },
          },
          x: {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
              drawBorder: false,
            },
            ticks: {
              color: 'var(--text-color)',
            },
          },
        },
        elements: {
          line: {
            borderWidth: 2,
          },
          point: {
            radius: 3,
            hoverRadius: 5,
          },
        },
      },
    });
  };

  const confirmRemoveFavorite = city => {
    blockToRemove.value = city;
    showRemoveModal.value = true;
  };

  const removeFavorite = () => {
    const index = props.favorites.findIndex(
      city =>
        city.name === blockToRemove.value.name &&
        city.country === blockToRemove.value.country
    );
    if (index !== -1) {
      props.favorites.splice(index, 1);
    }
    showRemoveModal.value = false;
  };
</script>

<style scoped>
  .controls-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .time-toggle,
  .view-toggle {
    display: flex;
    gap: 8px;
  }

  .time-toggle button,
  .view-toggle button {
    flex: 1;
    padding: 8px 16px;
    border: 1px solid var(--primary-color);
    background-color: var(--surface-color);
    color: var(--primary-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .time-toggle button.active,
  .view-toggle button.active {
    background-color: var(--primary-color);
    color: white;
  }

  .time-toggle button:hover:not(.active),
  .view-toggle button:hover:not(.active) {
    background-color: var(--primary-light);
    color: white;
  }
  .confirm-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .confirm-modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .view-toggle {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .view-toggle button {
    flex: 1;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  .view-toggle button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }

  .view-toggle button:hover {
    background-color: #0056b3;
    color: white;
  }
  .favorites-view {
    padding: 20px 0;
  }

  .favorites-title {
    font-size: 2em;
    text-align: center;
    color: var(--primary-color);
    margin-bottom: 30px;
  }

  .empty-favorites {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
  }

  .empty-content {
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    color: #ddd;
    margin-bottom: 20px;
  }

  .empty-text {
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .favorite-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .favorite-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .remove-button {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--error-color);
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    transition: transform 0.2s;
  }

  .remove-button:hover {
    transform: scale(1.1);
  }

  .view-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .view-controls button {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--primary-color);
    background: white;
    color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-controls button.active {
    background: var(--primary-color);
    color: white;
  }

  .weather-content {
    text-align: center;
  }

  .weather-main {
    margin-bottom: 20px;
  }

  .weather-icon {
    width: 100px;
    height: 100px;
  }

  .temperature {
    font-size: 36px;
    font-weight: bold;
    margin: 10px 0;
  }

  .description {
    color: var(--text-secondary);
    text-transform: capitalize;
  }

  .weather-details {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
    padding: 20px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .detail-item {
    text-align: center;
  }

  .detail-icon {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .detail-value {
    display: block;
    font-weight: bold;
  }

  .detail-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .chart-container {
    height: 200px;
    margin-top: 20px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-secondary);
    gap: 16px;
  }

  .loader {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .favorites-info {
    text-align: center;
    margin-top: 20px;
    padding: 10px;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 4px;
    color: var(--text-secondary);
  }
  .weather-stats {
    display: flex;
    justify-content: space-around;
    align-items: center;
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
    margin-bottom: 5px;
  }

  .stat-value {
    font-weight: bold;
    font-size: 18px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      text-align: center;
      gap: 10px;
      padding: 12px;
      font-size: 14px;
    }
    .container {
      padding: 15px;
      gap: 15px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 10px;
      gap: 10px;
    }
  }
</style>
