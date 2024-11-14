<template>
  <!-- Displays the weather card, highlighting it if it's marked as a favorite -->
  <div class="weather-card" :class="{ 'is-favorite': isFavorite }">
    <div class="weather-header">
      <h3>{{ city }}</h3>
      <div class="weather-controls">
        <button
          class="favorite-button"
          @click="$emit('toggle-favorite')"
          :title="
            isFavorite ? t('remove_from_favorites') : t('add_to_favorites')
          "
        >
          {{ isFavorite ? '★' : '☆' }}
        </button>
        <!-- Removes the weather card if the 'removable' prop is true -->
        <button
          v-if="removable"
          class="remove-button"
          @click="$emit('remove')"
          :title="t('remove_block')"
        >
          ×
        </button>
      </div>
    </div>

    <div class="weather-body" v-if="data">
      <div class="weather-icon">
        <img
          :src="`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`"
          :alt="data.weather[0].description"
        />
      </div>

      <div class="temperature">{{ Math.round(data.temp) }}°C</div>

      <div class="description">
        {{ data.weather[0].description }}
      </div>

      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-icon">💧</span>
          <span>{{ data.humidity }}%</span>
          <span class="detail-label">{{ t('humidity') }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">💨</span>
          <span>
            {{ Math.round(data.wind_speed) }} {{ t('wind_speed_unit') }}
          </span>
          <span class="detail-label">{{ t('wind') }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">🌡️</span>
          <span>{{ Math.round(data.feels_like) }}°C</span>
          <span class="detail-label">{{ t('feels_like') }}</span>
        </div>
      </div>
    </div>

    <div v-else class="loading-placeholder">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
  // Computed property to check if the current city is in the list of favorites
  import { computed } from 'vue';
  import { useI18n } from '../composables/useI18n';

  const props = defineProps({
    city: String,
    data: Object,
    favorites: {
      type: Array,
      default: () => [],
    },
    removable: {
      type: Boolean,
      default: true,
    },
  });

  const { t } = useI18n();

  const isFavorite = computed(() => props.favorites.includes(props.city));
</script>

<style scoped>
  .weather-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .weather-card.is-favorite {
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  .weather-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .weather-header h3 {
    margin: 0;
    font-size: 1.5em;
  }

  .weather-controls {
    display: flex;
    gap: 8px;
  }

  .weather-controls button {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    padding: 4px;
    transition: transform 0.2s;
    line-height: 1;
  }

  .weather-controls button:hover {
    transform: scale(1.1);
  }

  .favorite-button {
    color: #ffd700;
  }

  .remove-button {
    color: #dc3545;
  }

  .weather-body {
    text-align: center;
  }

  .weather-icon {
    margin: 10px 0;
  }

  .weather-icon img {
    width: 100px;
    height: 100px;
  }

  .temperature {
    font-size: 3em;
    font-weight: bold;
    margin: 10px 0;
  }

  .description {
    text-transform: capitalize;
    color: #666;
    margin-bottom: 20px;
  }

  .weather-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .detail-icon {
    font-size: 1.5em;
  }

  .detail-label {
    font-size: 0.8em;
    color: #666;
  }

  .loading-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 480px) {
    .weather-details {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .detail-item {
      flex-direction: row;
      justify-content: center;
      gap: 10px;
    }
  }
</style>
