import VueApexCharts from "vue3-apexcharts";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueApexCharts);
  // Also register the component explicitly if needed
  nuxtApp.vueApp.component('apexchart', VueApexCharts);
});
