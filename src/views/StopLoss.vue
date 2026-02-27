<template>
  <div>
    <div class="ph">
      <div class="ph-icon">⊘</div>
      <div>
        <div class="ph-title">Stop Loss Calculator</div>
        <div class="ph-sub">Set precise stop losses using %, ATR, or support level. Compare fixed vs trailing.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="tg-row">
        <button class="tg-btn" :class="method === 'pct' ? 'on' : ''" @click="method = 'pct'">% Based</button>
        <button class="tg-btn" :class="method === 'atr' ? 'on' : ''" @click="method = 'atr'">ATR Based</button>
        <button class="tg-btn" :class="method === 'support' ? 'on' : ''" @click="method = 'support'">Support Level</button>
      </div>

      <div class="g3 mb">
        <div class="field"><label>Entry Price (₹)</label><input type="number" v-model.number="entry" placeholder="e.g. 250" step="0.5" /></div>
        <div class="field"><label>Capital (₹)</label><input type="number" v-model.number="settings.capital" placeholder="e.g. 10000" step="1000" /></div>
        <div class="field"><label>Risk / Trade (%)</label><input type="number" v-model.number="settings.riskPct" placeholder="e.g. 2" step="0.1" /></div>
        <template v-if="method === 'pct'">
          <div class="field"><label>SL % Below Entry</label><input type="number" v-model.number="slPct" placeholder="e.g. 5" step="0.5" /></div>
        </template>
        <template v-if="method === 'atr'">
          <div class="field"><label>ATR Value (₹)</label><input type="number" v-model.number="atr" placeholder="e.g. 8" step="0.1" /></div>
          <div class="field"><label>ATR Multiplier</label><input type="number" v-model.number="atrMul" placeholder="e.g. 2" step="0.5" min="0.5" max="5" /></div>
        </template>
        <template v-if="method === 'support'">
          <div class="field"><label>Support Level (₹)</label><input type="number" v-model.number="support" placeholder="e.g. 240" step="0.5" /></div>
          <div class="field"><label>Buffer Below (%)</label><input type="number" v-model.number="supportBuf" placeholder="e.g. 0.5" step="0.1" /></div>
        </template>
        <div class="field"><label>Trailing SL (%)</label><input type="number" v-model.number="trailPct" placeholder="e.g. 3" step="0.5" /></div>
      </div>

      <div class="g4">
        <div class="sc red"><div class="sc-label">Stop Loss Price</div><div class="sc-val red">₹{{ fmt(slPrice, 2) }}</div></div>
        <div class="sc orange"><div class="sc-label">SL Distance</div><div class="sc-val orange">{{ fmt(slDist, 2) }}%</div></div>
        <div class="sc teal"><div class="sc-label">Shares to Buy</div><div class="sc-val teal">{{ slShares }}</div></div>
        <div class="sc green"><div class="sc-label">Position Size</div><div class="sc-val green">{{ fmtINR(slShares * (entry || 0)) }}</div></div>
      </div>
    </div>

    <div class="card card-teal mb">
      <div class="card-label">Fixed SL vs Trailing SL — Price Rising +2% per Trade</div>
      <VChart :option="slChart" autoresize style="height:280px" />
    </div>

    <div class="card">
      <div class="card-label">Stop Loss Methods</div>
      <div class="slm">
        <div class="slm-item"><div class="slm-name">% Based</div><div class="slm-desc">Fixed % below entry. Simple, predictable. Best for beginners and high-volatility stocks. Easy to plan position size around.</div></div>
        <div class="slm-item"><div class="slm-name">ATR Based</div><div class="slm-desc">ATR × multiplier adapts to the stock's natural volatility. Reduces premature stop-outs from normal price fluctuations.</div></div>
        <div class="slm-item"><div class="slm-name">Support</div><div class="slm-desc">Place SL below a key support level with a 0.3–0.5% buffer. Most contextual method. Requires chart reading skill.</div></div>
        <div class="slm-item"><div class="slm-name">Trailing</div><div class="slm-desc">SL moves up as price rises, locking in profits. Let winners run while protecting gains. Use only after trade is already profitable.</div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM, AREA_TEAL } from '@/composables/useChartTheme'

const settings = useSettingsStore()
const { fmtINR, fmt } = useFormatters()

const method     = ref('pct')
const entry      = ref('')
const slPct      = ref('')
const atr        = ref('')
const atrMul     = ref(2)
const support    = ref('')
const supportBuf = ref(0.5)
const trailPct   = ref(3)

const slPrice = computed(() => {
  const e = entry.value || 0
  if (method.value === 'pct')     return +(e * (1 - (slPct.value || 0) / 100)).toFixed(2)
  if (method.value === 'atr')     return +(e - (atr.value || 0) * (atrMul.value || 0)).toFixed(2)
  return +((support.value || 0) * (1 - (supportBuf.value || 0) / 100)).toFixed(2)
})
const slDist  = computed(() => (entry.value || 0) > 0 ? (entry.value - slPrice.value) / entry.value * 100 : 0)
const slShares = computed(() => {
  const d = (entry.value || 0) - slPrice.value
  return d > 0 ? Math.floor(settings.capital * settings.riskPct / 100 / d) : 0
})

const slChart = computed(() => {
  const e = entry.value || 100
  const tp = (trailPct.value || 3) / 100
  const days = Array.from({ length: 15 }, (_, i) => i)
  const prices = days.map(d => +(e * Math.pow(1.02, d)).toFixed(2))
  const fixed  = days.map(() => slPrice.value)
  const trail  = prices.map(p => +(p * (1 - tp)).toFixed(2))

  return {
    backgroundColor: 'transparent', grid: GRID,
    tooltip: {
      ...TOOLTIP, trigger: 'axis',
      formatter: (params) => {
        let s = `<div style="color:rgba(241,243,248,.4);font-size:.58rem;margin-bottom:8px">${params[0].name}</div>`
        params.forEach(p => {
          s += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block"></span>
            <span style="color:rgba(241,243,248,.5)">${p.seriesName}:</span>
            <strong style="color:${p.color}">₹${(p.value || 0).toFixed(2)}</strong>
          </div>`
        })
        return s
      }
    },
    legend: { data: ['Stock Price', 'Fixed SL', 'Trailing SL'], textStyle: { color: 'rgba(241,243,248,.4)', fontFamily: 'DM Mono', fontSize: 11 }, top: 0, right: 8 },
    xAxis: { ...X_AXIS, data: days.map(d => `Trade ${d + 1}`) },
    yAxis: { ...Y_AXIS, axisLabel: { ...Y_AXIS.axisLabel, formatter: v => `₹${v.toFixed(0)}` } },
    dataZoom: DATA_ZOOM,
    series: [
      { name: 'Stock Price', type: 'line', data: prices, lineStyle: { color: C.teal, width: 2.5 }, itemStyle: { color: C.teal }, symbolSize: 4, smooth: true, areaStyle: { color: AREA_TEAL } },
      { name: 'Fixed SL',    type: 'line', data: fixed,  lineStyle: { color: C.red, width: 2, type: 'dashed' }, itemStyle: { color: C.red }, showSymbol: false },
      { name: 'Trailing SL', type: 'line', data: trail,  lineStyle: { color: C.green, width: 2 }, itemStyle: { color: C.green }, symbolSize: 4, smooth: true },
    ]
  }
})
</script>
