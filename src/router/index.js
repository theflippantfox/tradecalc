import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/position' },
  { path: '/position',  name: 'position',  component: () => import('@/views/PositionSizer.vue'),   meta: { label: 'Position Sizer',   icon: '⊡' } },
  { path: '/rr',        name: 'rr',        component: () => import('@/views/RiskReward.vue'),       meta: { label: 'Risk / Reward',    icon: '⚖' } },
  { path: '/leverage',  name: 'leverage',  component: () => import('@/views/LeverageCalc.vue'),     meta: { label: 'Leverage Calc',    icon: '✕' } },
  { path: '/brokerage', name: 'brokerage', component: () => import('@/views/BrokerageCalc.vue'),    meta: { label: 'Brokerage Calc',   icon: '₹' } },
  { path: '/simulator', name: 'simulator', component: () => import('@/views/TradeSimulator.vue'),   meta: { label: 'Trade Simulator',  icon: '↗' } },
  { path: '/strategy',  name: 'strategy',  component: () => import('@/views/StrategyBuilder.vue'),  meta: { label: 'Strategy Builder', icon: '◎' } },
  { path: '/stoploss',  name: 'stoploss',  component: () => import('@/views/StopLoss.vue'),         meta: { label: 'Stop Loss Calc',   icon: '⊘' } },
]

const router = createRouter({
  // Using hash history so GitHub Pages works without server config
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
