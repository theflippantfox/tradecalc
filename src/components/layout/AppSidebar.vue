<template>
  <aside class="sidebar" :class="{ open: settings.sidebarOpen }">
    <div class="sb-brand">
      <div class="sb-logo">Swing<span class="teal">Desk</span><span class="dot" /></div>
      <div class="sb-tagline">Indian Trade Terminal</div>
      <div class="sb-tags">
        <span class="tag tag-teal">NSE · BSE</span>
        <span class="tag tag-orange">Swing</span>
        <span class="tag tag-teal">India</span>
      </div>
    </div>

    <!-- Global capital shortcut -->
    <div class="sb-capital">
      <div class="sb-cap-label">Global Capital</div>
      <div class="sb-cap-input-wrap">
        <span class="sb-cap-prefix">₹</span>
        <input
          type="number"
          v-model.number="settings.capital"
          placeholder="10000"
          class="sb-cap-input"
          step="1000"
        />
      </div>
      <div class="sb-cap-row">
        <div class="sb-cap-chip">Risk: {{ settings.riskPct }}%</div>
        <div class="sb-cap-chip">Lev: {{ settings.leverage }}×</div>
      </div>
    </div>

    <nav class="sb-nav">
      <RouterLink
        v-for="route in navRoutes" :key="route.name"
        :to="{ name: route.name }"
        class="nav-btn"
        active-class="active"
        @click="settings.sidebarOpen = false"
      >
        <span class="nav-icon">{{ route.meta.icon }}</span>
        {{ route.meta.label }}
      </RouterLink>
    </nav>

    <div class="sb-footer">
      EDUCATIONAL USE ONLY<br />
      NOT SEBI INVESTMENT ADVICE
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <Transition name="fade">
    <div v-if="settings.sidebarOpen" class="sidebar-overlay" @click="settings.sidebarOpen = false" />
  </Transition>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
const router = useRouter()
const navRoutes = router.getRoutes().filter(r => r.meta?.label)
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w); background: var(--bg2); border-right: 1px solid var(--border);
  position: fixed; top: 0; left: 0; height: 100vh; z-index: 200;
  display: flex; flex-direction: column; overflow-y: auto;
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}

.sb-brand { padding: 28px 22px 16px; border-bottom: 1px solid var(--border); }
.sb-logo { font-size: 1.3rem; font-weight: 800; letter-spacing: -.5px; line-height: 1; }
.sb-logo .teal { color: var(--teal); }
.sb-logo .dot {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  background: var(--teal); margin-left: 3px; box-shadow: var(--teal-glow);
  vertical-align: middle; margin-bottom: 2px;
  animation: dotpulse 2s ease infinite;
}
@keyframes dotpulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--teal); }
  50% { opacity: .6; box-shadow: 0 0 14px var(--teal); }
}
.sb-tagline { font-size: .7rem; color: var(--t3); margin-top: 6px; font-weight: 500; letter-spacing: .5px; }
.sb-tags { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.tag { font-size: .6rem; font-weight: 600; padding: 4px 10px; border-radius: 99px; letter-spacing: .5px; }
.tag-teal   { background: var(--teal-bg); color: var(--teal); border: 1px solid rgba(0,207,186,.2); }
.tag-orange { background: var(--orange-bg); color: var(--orange); border: 1px solid rgba(255,122,64,.2); }

/* Global capital */
.sb-capital { padding: 14px 18px; border-bottom: 1px solid var(--border); }
.sb-cap-label { font-family: var(--mono); font-size: .58rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--t3); margin-bottom: 8px; }
.sb-cap-input-wrap { display: flex; align-items: center; background: var(--bg); border: 1px solid var(--border2); border-radius: var(--r-xs); overflow: hidden; }
.sb-cap-prefix { padding: 0 10px; color: var(--teal); font-family: var(--mono); font-size: .9rem; }
.sb-cap-input { background: none; border: none; outline: none; color: var(--teal); font-family: var(--mono); font-size: .9rem; font-weight: 600; padding: 9px 8px 9px 0; width: 100%; -moz-appearance: textfield; }
.sb-cap-input::placeholder { color: var(--t3); }
.sb-cap-row { display: flex; gap: 6px; margin-top: 8px; }
.sb-cap-chip { font-family: var(--mono); font-size: .6rem; color: var(--t3); background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; }

/* Nav */
.sb-nav { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.nav-btn {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--r-sm);
  cursor: pointer; font-size: .82rem; font-weight: 500; color: var(--t3);
  text-decoration: none; transition: all .18s; position: relative;
}
.nav-btn:hover { color: var(--t2); background: rgba(255,255,255,.04); }
.nav-btn.active { color: var(--t1); background: rgba(0,207,186,.1); font-weight: 600; }
.nav-btn.active::before {
  content: ''; position: absolute; left: -1px; top: 20%; bottom: 20%;
  width: 3px; background: var(--teal); border-radius: 99px; box-shadow: 0 0 10px var(--teal);
}
.nav-icon {
  width: 28px; height: 28px; border-radius: var(--r-xs);
  display: flex; align-items: center; justify-content: center; font-size: .95rem; flex-shrink: 0;
  background: rgba(255,255,255,.04); transition: all .18s;
}
.nav-btn.active .nav-icon { background: var(--teal-bg); color: var(--teal); }

.sb-footer { padding: 16px 22px; border-top: 1px solid var(--border); font-size: .6rem; color: var(--t3); line-height: 1.8; font-family: var(--mono); }

/* Overlay */
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 199; backdrop-filter: blur(6px); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media(max-width: 960px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
}
</style>
