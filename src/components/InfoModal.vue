<template>
  <!-- Modal backdrop closes the modal when clicked-->
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="close-button" @click="$emit('close')" aria-label="Close">
          ×
        </button>
      </div>

      <div class="modal-body">
        <div class="info-icon">
          <span class="icon">ℹ️</span>
        </div>
        <p class="modal-message">{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button class="button ok-button" @click="$emit('close')">
          {{ t('ok') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from '../composables/useI18n';

  defineProps({
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  });

  const { t } = useI18n();
</script>

<style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-container {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .modal-body {
    padding: 30px 20px;
    text-align: center;
  }

  .info-icon {
    margin-bottom: 20px;
  }

  .info-icon .icon {
    font-size: 48px;
    color: var(--primary-color);
  }

  .modal-message {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .modal-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
  }

  .button {
    min-width: 120px;
    padding: 10px 24px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ok-button {
    background-color: var(--primary-color);
    color: white;
  }

  .ok-button:hover {
    background-color: #1976d2;
    transform: translateY(-1px);
  }

  .ok-button:active {
    transform: translateY(0);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    .modal-container {
      width: 95%;
      margin: 10px;
    }

    .button {
      width: 100%;
      padding: 12px;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 15px;
    }

    .info-icon .icon {
      font-size: 36px;
    }

    .modal-message {
      font-size: 14px;
    }
  }
</style>
