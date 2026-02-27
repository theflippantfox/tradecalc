<template>
  <header class="topbar">
    <div class="tb-left">
      <button class="menu-btn" @click="settings.sidebarOpen = !settings.sidebarOpen">
        <span>☰</span>
      </button>
      <div class="tb-path">
        SWINGDESK /
        <span>{{ currentRoute?.meta?.label }}</span>
      </div>
    </div>
    <div class="tb-right">
      <div class="tb-stat">
        <div class="tb-stat-label">CAPITAL</div>
        <div class="tb-stat-val teal">{{ fmtINR(settings.capital) }}</div>
      </div>
      <div class="tb-stat">
        <div class="tb-stat-label">RISK / TRADE</div>
        <div class="tb-stat-val orange">{{ settings.riskPct }}%</div>
      </div>
      <div class="live-badge">
        <span class="live-dot" />
        LIVE CALC
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'

const settings = useSettingsStore()
const route = useRoute()
const currentRoute = computed(() => route)
const { fmtINR } = useFormatters()
</script>

<style scoped>
.topbar {
  height: var(--topbar-h); padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(7,9,14,.85); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100;
}
.tb-left { display: flex; align-items: center; gap: 12px; }
.menu-btn {
  display: none; background: none; border: none; cursor: pointer;
  color: var(--t2); font-size: 1.3rem; padding: 4px; line-height: 1;
  width: 36px; height: 36px; border-radius: var(--r-xs);
  align-items: center; justify-content: center;
  transition: background .18s;
}
.menu-btn:hover { background: rgba(255,255,255,.06); }
.tb-path { font-size: .72rem; color: var(--t3); font-family: var(--mono); letter-spacing: .5px; }
.tb-path span { color: var(--teal); }
.tb-right { display: flex; align-items: center; gap: 20px; }
.tb-stat { text-align: right; }
.tb-stat-label { font-size: .58rem; color: var(--t3); margin-bottom: 1px; letter-spacing: 1px; font-family: var(--mono); }
.tb-stat-val { font-size: .8rem; font-weight: 700; font-family: var(--mono); }
.tb-stat-val.teal   { color: var(--teal); }
.tb-stat-val.orange { color: var(--orange); }
.live-badge {
  display: flex; align-items: center; gap: 6px;
  background: var(--green-bg); border: 1px solid rgba(0,230,118,.2);
  padding: 5px 12px; border-radius: 99px; font-size: .65rem; font-weight: 600; color: var(--green);
  font-family: var(--mono);
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  animation: livepulse 1.6s infinite;
}
@keyframes livepulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,230,118,.4); }
  70%       { box-shadow: 0 0 0 5px transparent; }
}
@media(max-width: 960px) {
  .menu-btn { display: flex; }
  .topbar { padding: 0 16px; }
}
@media(max-width: 560px) { .tb-right { display: none; } }
</style>
