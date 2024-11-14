<template>
  <!-- Renders different sections based on the currently selected tab: "Main" or "Favorites" -->
  <div class="app">
    <main class="main">
      <div class="container">
        <header class="header">
          <div class="header-content">
            <h1 class="logo">WeatherApp</h1>
            <nav class="nav">
              <button
                class="nav-button"
                :class="{ active: currentTab === 'main' }"
                @click="currentTab = 'main'"
              >
                {{ t('main') }}
              </button>
              <button
                class="nav-button"
                :class="{ active: currentTab === 'favorites' }"
                @click="currentTab = 'favorites'"
              >
                {{ t('favorites') }}
              </button>
              <button
                class="nav-button language-button"
                @click="toggleLanguage"
              >
                {{ currentLanguage.toUpperCase() }}
              </button>
            </nav>
          </div>
        </header>
        <div v-if="isLoading" class="loading">Loading...</div>
        <template v-else>
          <template v-if="currentTab === 'main'">
            <div class="weather-blocks">
              <WeatherBlock
                v-for="(block, index) in weatherBlocks"
                :key="block.id"
                :favorites="favorites"
                :default-city="index === 0 ? defaultCity : null"
                @toggle-favorite="handleFavoriteToggle"
                @remove="() => confirmRemoveBlock(block.id)"
              />
              <button
                v-if="weatherBlocks.length < 5"
                class="add-block-button"
                @click="addWeatherBlock"
                title="Add new weather block"
              >
                +
              </button>
            </div>
          </template>
          <template v-else>
            <FavoritesView
              :favorites="favorites"
              @remove-favorite="removeFavorite"
            />
          </template>
        </template>
      </div>
    </main>

    <ConfirmModal
      v-if="showRemoveModal"
      @close="showRemoveModal = false"
      @confirm="removeBlock"
      :title="t('confirm_removal')"
      :message="t('remove_block_confirmation')"
    />

    <InfoModal
      v-if="showFavoritesLimitModal"
      @close="showFavoritesLimitModal = false"
      :title="t('favorites_limit')"
      :message="t('favorites_limit_message')"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted, watchEffect } from 'vue';
  import { useGeolocation } from './composables/useGeolocation';
  import { useI18n } from './composables/useI18n';
  import WeatherBlock from './components/WeatherBlock.vue';
  import FavoritesView from './components/FavoritesView.vue';
  import ConfirmModal from './components/ConfirmModal.vue';
  import InfoModal from './components/InfoModal.vue';

  const { currentLanguage, toggleLanguage, t } = useI18n();
  const { getUserLocation } = useGeolocation();

  const currentTab = ref('main');
  const weatherBlocks = ref([{ id: 1 }]);
  const favorites = ref([]);
  const showRemoveModal = ref(false);
  const showFavoritesLimitModal = ref(false);
  const blockToRemove = ref(null);
  const defaultCity = ref(null);
  const isLoading = ref(true);

  // Initializes the app by loading saved favorites from localStorage and setting the user's location
  const initializeApp = async () => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        favorites.value = JSON.parse(savedFavorites);
      }

      const location = await getUserLocation();
      if (location) {
        defaultCity.value = location;
        console.log('Location set:', location);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    initializeApp();
  });

  // Automatically updates the default city for the first weather block if it changes
  watchEffect(() => {
    if (defaultCity.value) {
      weatherBlocks.value = weatherBlocks.value.map((block, index) => {
        if (index === 0) {
          return { ...block, defaultCity: defaultCity.value };
        }
        return block;
      });
    }
  });

  const addWeatherBlock = () => {
    if (weatherBlocks.value.length < 5) {
      weatherBlocks.value.push({ id: Date.now() });
    }
  };

  const confirmRemoveBlock = id => {
    blockToRemove.value = id;
    showRemoveModal.value = true;
  };

  const removeBlock = () => {
    if (blockToRemove.value) {
      weatherBlocks.value = weatherBlocks.value.filter(
        block => block.id !== blockToRemove.value
      );
      showRemoveModal.value = false;
      blockToRemove.value = null;
    }
  };

  const handleFavoriteToggle = city => {
    const index = favorites.value.findIndex(
      f => f.name === city.name && f.country === city.country
    );

    if (index === -1) {
      if (favorites.value.length >= 5) {
        showFavoritesLimitModal.value = true;
        return;
      }
      favorites.value.push(city);
    } else {
      favorites.value.splice(index, 1);
    }
  };

  const removeFavorite = city => {
    const index = favorites.value.findIndex(
      f => f.name === city.name && f.country === city.country
    );
    if (index !== -1) {
      favorites.value.splice(index, 1);
    }
  };
</script>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --primary-color: #2196f3;
    --primary-dark: #1976d2;
    --primary-light: #bbdefb;
    --secondary-color: #757575;
    --background-color: #f5f5f5;
    --surface-color: #ffffff;
    --text-primary: #212121;
    --border-radius: 4px;
    --spacing-unit: 8px;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial,
      sans-serif;
    line-height: 1.5;
    color: var(--text-primary);
    background-color: var(--background-color);
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    background-color: var(--surface-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: calc(var(--spacing-unit) * 2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    background: linear-gradient(45deg, #2196f3, #00bcd4);
    background-clip: text;
    color: transparent;
  }

  .main {
    flex: 1;
    padding: var(--spacing-unit) * 3 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-unit) * 2;
  }

  .nav {
    display: flex;
    gap: var(--spacing-unit);
  }

  .nav-button {
    padding: var(--spacing-unit);
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: var(--primary-light);
    color: white;
  }

  .nav-button.active {
    background: var(--primary-color);
    color: white;
  }

  .language-button {
    font-weight: bold;
  }

  .weather-blocks {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-unit) * 3;
    margin-top: var(--spacing-unit) * 3;
  }

  .weather-block {
    width: 100%;
    transition: all 0.3s ease;
  }

  .add-block-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: var(--primary-color);
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--spacing-unit) * 2;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .add-block-button:hover {
    transform: scale(1.1);
    background: var(--primary-dark);
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: var(--spacing-unit) * 2;
    }

    .nav {
      width: 100%;
      justify-content: center;
    }

    .container {
      padding: 0 var(--spacing-unit);
    }
  }

  @media (max-width: 480px) {
    .nav {
      flex-direction: column;
      align-items: stretch;
    }

    .nav-button {
      width: 100%;
    }
  }
</style>
