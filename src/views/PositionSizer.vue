<template>
  <div>
    <div class="ph">
      <div class="ph-icon">⊡</div>
      <div>
        <div class="ph-title">Position Sizer</div>
        <div class="ph-sub">Calculate exact shares to buy without exceeding your risk limit.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">Trade Parameters</div>
      <div class="g5 mb">
        <div class="field">
          <label>Capital (₹)</label>
          <input type="number" v-model.number="settings.capital" placeholder="e.g. 10000" step="1000" />
        </div>
        <div class="field">
          <label>Risk / Trade (%)</label>
          <input type="number" v-model.number="settings.riskPct" placeholder="e.g. 2" step="0.1" min="0.1" max="20" />
        </div>
        <div class="field">
          <label>Leverage</label>
          <input type="number" v-model.number="settings.leverage" placeholder="e.g. 1" step="0.5" min="1" max="5" />
        </div>
        <div class="field">
          <label>Entry Price (₹)</label>
          <input type="number" v-model.number="entry" placeholder="e.g. 250" step="0.5" />
        </div>
        <div class="field">
          <label>Stop Loss (₹)</label>
          <input type="number" v-model.number="sl" placeholder="e.g. 237" step="0.5" />
        </div>
      </div>

      <div class="g3 mb">
        <div class="big-stat">
          <div class="big-stat-label">Shares to Buy</div>
          <div class="big-stat-val teal">{{ shares }}</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Max Risk Amount</div>
          <div class="big-stat-val red">{{ fmtINR(maxRisk) }}</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Position Value</div>
          <div class="big-stat-val orange">{{ fmtINR(posValue) }}</div>
        </div>
      </div>

      <div class="g4">
        <div class="sc teal">
          <div class="sc-label">SL Distance</div>
          <div class="sc-val teal">{{ fmt(slPct, 2) }}%</div>
        </div>
        <div class="sc grey">
          <div class="sc-label">Leveraged Capital</div>
          <div class="sc-val grey">{{ fmtINR(settings.capital * settings.leverage) }}</div>
        </div>
        <div class="sc" :class="capUsed > 100 ? 'red' : 'green'">
          <div class="sc-label">Capital Used</div>
          <div class="sc-val" :class="capUsed > 100 ? 'red' : 'green'">{{ fmt(capUsed, 1) }}%</div>
        </div>
        <div class="sc grey">
          <div class="sc-label">Margin Required</div>
          <div class="sc-val grey">{{ fmtINR(posValue / settings.leverage) }}</div>
        </div>
      </div>
    </div>

    <div class="card card-teal mb">
      <div class="card-label">Shares & Position Value vs Risk % · Scroll to zoom</div>
      <VChart :option="chartOption" autoresize style="height:250px" />
    </div>

    <div class="alert alert-teal">
      <strong>Rule:</strong> With {{ fmtINR(settings.capital) }} at {{ settings.riskPct }}% risk —
      max loss = <strong>{{ fmtINR(maxRisk) }}</strong>.
      Buy <strong>{{ shares }} shares</strong> at {{ fmtINR(entry || 0) }},
      SL at {{ fmtINR(sl || 0) }} ({{ fmt(slPct, 1) }}% below entry).
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM, AREA_TEAL, tooltipFormatter } from '@/composables/useChartTheme'

const settings = useSettingsStore()
const { fmtINR, fmt, fmtK } = useFormatters()

const entry = ref('')
const sl = ref('')

const slPct = computed(() => entry.value > 0 ? Math.abs((entry.value - sl.value) / entry.value) * 100 : 0)
const maxRisk = computed(() => settings.capital * settings.riskPct / 100)
const shares = computed(() => {
  const d = (entry.value || 0) - (sl.value || 0)
  return d > 0 ? Math.floor(maxRisk.value / d) : 0
})
const posValue = computed(() => shares.value * (entry.value || 0))
const capUsed = computed(() => {
  const lev = settings.capital * settings.leverage
  return lev > 0 ? (posValue.value / lev) * 100 : 0
})

const chartOption = computed(() => {
  const riskRange = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]
  const d = (entry.value || 0) - (sl.value || 0)
  const sharesData = riskRange.map(r => {
    const ra = settings.capital * r / 100
    return d > 0 ? Math.floor(ra / d) : 0
  })
  const valData = riskRange.map((_, i) => sharesData[i] * (entry.value || 0))

  return {
    backgroundColor: 'transparent',
    grid: { ...GRID, right: 72 },
    tooltip: { ...TOOLTIP, trigger: 'axis', formatter: tooltipFormatter },
    legend: {
      data: ['Shares', 'Position ₹'],
      textStyle: { color: 'rgba(241,243,248,.4)', fontFamily: 'DM Mono', fontSize: 11 },
      top: 0, right: 8
    },
    xAxis: { ...X_AXIS, data: riskRange.map(r => `${r}%`) },
    yAxis: [
      { ...Y_AXIS, position: 'left', name: 'Shares', nameTextStyle: { color: 'rgba(241,243,248,.3)', fontFamily: 'DM Mono', fontSize: 10 } },
      { ...Y_AXIS, position: 'right', name: '₹', nameTextStyle: { color: 'rgba(241,243,248,.3)', fontFamily: 'DM Mono', fontSize: 10 }, axisLabel: { ...Y_AXIS.axisLabel }, splitLine: { show: false } }
    ],
    dataZoom: DATA_ZOOM,
    series: [
      {
        name: 'Shares', type: 'line', data: sharesData, yAxisIndex: 0,
        lineStyle: { color: C.teal, width: 2.5 }, itemStyle: { color: C.teal },
        areaStyle: { color: AREA_TEAL }, symbolSize: 6, smooth: true,
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: C.orange, type: 'dashed', width: 1 },
          data: [{ xAxis: `${settings.riskPct}%`, label: { formatter: `Current\n${settings.riskPct}%`, color: C.orange, fontFamily: 'DM Mono', fontSize: 10 } }]
        }
      },
      {
        name: 'Position ₹', type: 'line', data: valData, yAxisIndex: 1,
        lineStyle: { color: C.orange, width: 2 }, itemStyle: { color: C.orange },
        symbolSize: 5, smooth: true
      }
    ]
  }
})
</script>
