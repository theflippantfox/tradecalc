<template>
  <div id="app-inner">
    <AppSidebar />
    <main class="main-content">
      <AppTopbar />
      <div class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
</script>

<style scoped>
#app-inner { display: flex; min-height: 100vh; }
.page-enter-active, .page-leave-active { transition: opacity .15s ease, transform .15s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
