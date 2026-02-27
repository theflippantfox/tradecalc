import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Global capital — shared across all calculators
  const capital = ref(10000)
  const riskPct = ref(2)
  const leverage = ref(1)
  const broker = ref('zerodha')
  const sidebarOpen = ref(false)

  // Derived
  const maxRisk = computed(() => capital.value * riskPct.value / 100)
  const leveragedCapital = computed(() => capital.value * leverage.value)

  function reset() {
    capital.value = 10000
    riskPct.value = 2
    leverage.value = 1
  }

  return { capital, riskPct, leverage, broker, sidebarOpen, maxRisk, leveragedCapital, reset }
}, {
  persist: true   // pinia-plugin-persistedstate: auto-saves to localStorage
})
