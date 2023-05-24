import { onUnmounted, computed } from 'vue';
import { useStore } from 'vuex';

export const useToast = () => {
  const store = useStore();

  const toastMessage = computed(() => store.state.toastMessage);
  const toastAlertType = computed(() => store.state.toastAlertType);
  const showToast = computed(() => store.state.showToast);
  const timeout = computed(() => store.state.timeout);

  const triggerToast = (message, type = 'success') => {
    toastMessage.value = message;
    toastAlertType.value = type;
    showToast.value = true;
    timeout.value = setTimeout(() => {
      toastMessage.value = '';
      toastAlertType.value = '';
      showToast.value = false;
    }, 3000);
  }
  onUnmounted(() => {
      clearTimeout(timeout.value);
    })
  return {
      showToast,
      toastMessage,
      toastAlertType,
      triggerToast
  }
}