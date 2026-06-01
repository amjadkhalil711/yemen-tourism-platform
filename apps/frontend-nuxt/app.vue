<template>
  <div>
    <NuxtLoadingIndicator color="#c7882f" :height="3" :throttle="120" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <LazyAppToastStack />
    </ClientOnly>
  </div>
</template>
