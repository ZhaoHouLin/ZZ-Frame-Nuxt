// Pinia setup store 最小範例
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  const increment = () => count.value++

  return { count, double, increment }
})
