<template>
  <div>
    <div class="ph">
      <div class="ph-icon">✕</div>
      <div>
        <div class="ph-title">Leverage Calculator</div>
        <div class="ph-sub">See amplified gains and losses at every leverage level for any trade move.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">Parameters</div>
      <div class="g3 mb">
        <div class="field"><label>Capital (₹)</label><input type="number" v-model.number="settings.capital" placeholder="e.g. 10000" step="1000" /></div>
        <div class="field"><label>Leverage (1×–5×)</label><input type="number" v-model.number="settings.leverage" placeholder="e.g. 2" step="0.5" min="1" max="5" /></div>
        <div class="field"><label>Stock Move (%)</label><input type="number" v-model.number="move" placeholder="e.g. 5" step="0.5" /></div>
      </div>
      <div class="btn-row">
        <button class="btn" :class="dir === 'up' ? 'on-green' : ''" @click="dir = 'up'">▲ Stock Up</button>
        <button class="btn" :class="dir === 'down' ? 'on-red' : ''" @click="dir = 'down'">▼ Stock Down</button>
      </div>

      <div class="g3 mb">
        <div class="big-stat">
          <div class="big-stat-label">Leveraged Capital</div>
          <div class="big-stat-val teal">{{ fmtINR(settings.capital * settings.leverage) }}</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Trade P&amp;L</div>
          <div class="big-stat-val" :class="pnl >= 0 ? 'green' : 'red'">{{ pnl >= 0 ? '+' : '' }}{{ fmtINR(pnl) }}</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Return on Capital</div>
          <div class="big-stat-val" :class="ret >= 0 ? 'green' : 'red'">{{ pnl >= 0 ? '+' : '' }}{{ fmt(ret, 2) }}%</div>
        </div>
      </div>

      <div class="card-label">All Leverage Levels at {{ move || 0 }}% {{ dir === 'up' ? 'gain' : 'loss' }}</div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr><th>Leverage</th><th>Leveraged Cap</th><th>P&L (₹)</th><th>Return on Capital</th><th>Wipeout Move</th></tr>
          </thead>
          <tbody>
            <tr v-for="lev in [1, 1.5, 2, 2.5, 3, 4, 5]" :key="lev"
                :style="lev === settings.leverage ? 'background:rgba(0,207,186,.06)' : ''">
              <td :class="lev === settings.leverage ? 'teal' : ''">{{ lev }}×</td>
              <td>{{ fmtINR(settings.capital * lev) }}</td>
              <td :class="calcPnl(lev) >= 0 ? 'green' : 'red'">
                {{ calcPnl(lev) >= 0 ? '+' : '' }}{{ fmtINR(calcPnl(lev)) }}
              </td>
              <td :class="calcPnl(lev) >= 0 ? 'green' : 'red'">
                {{ settings.capital > 0 ? fmt(calcPnl(lev) / settings.capital * 100, 2) : '0.00' }}%
              </td>
              <td class="muted">{{ fmt(100 / lev, 1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card card-orange mb">
      <div class="card-label">P&L Curve — All Leverage Levels · Zoom & Pan enabled</div>
      <VChart :option="chartOption" autoresize style="height:300px" />
    </div>

    <div class="alert alert-orange">
      ⚡ At <strong>{{ settings.leverage }}× leverage</strong>, a
      <strong>{{ fmt(100 / settings.leverage, 1) }}% adverse move wipes your entire capital</strong>.
      A {{ move || 0 }}% {{ dir === 'up' ? 'upward' : 'downward' }} move returns
      <strong>{{ pnl >= 0 ? '+' : '' }}{{ fmtINR(pnl) }}</strong>.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM, tooltipFormatter } from '@/composables/useChartTheme'

const settings = useSettingsStore()
const { fmtINR, fmt } = useFormatters()
const move = ref(''), dir = ref('up')

const calcPnl = (lev) => (dir.value === 'up' ? 1 : -1) * (move.value || 0) / 100 * settings.capital * lev
const pnl = computed(() => calcPnl(settings.leverage))
const ret = computed(() => settings.capital > 0 ? pnl.value / settings.capital * 100 : 0)

const chartOption = computed(() => {
  const moves = [-20, -15, -10, -8, -5, -3, -1, 0, 1, 3, 5, 8, 10, 15, 20]
  const levs = [1, 2, 3, 4, 5]
  const colors = [C.grey, C.blue, C.violet, C.orange, C.red]
  const cur = settings.leverage

  return {
    backgroundColor: 'transparent', grid: GRID,
    tooltip: { ...TOOLTIP, trigger: 'axis', formatter: tooltipFormatter },
    legend: {
      data: levs.map(l => `${l}×`),
      textStyle: { color: 'rgba(241,243,248,.4)', fontFamily: 'DM Mono', fontSize: 11 },
      top: 0, right: 8
    },
    xAxis: { ...X_AXIS, data: moves.map(m => `${m > 0 ? '+' : ''}${m}%`) },
    yAxis: { ...Y_AXIS },
    dataZoom: DATA_ZOOM,
    series: levs.map((lev, i) => ({
      name: `${lev}×`, type: 'line',
      data: moves.map(m => +(m / 100 * settings.capital * lev).toFixed(2)),
      lineStyle: { color: colors[i], width: lev === cur ? 3 : 1.5, type: lev === cur ? 'solid' : 'dashed' },
      itemStyle: { color: colors[i] }, showSymbol: false, smooth: false,
      z: lev === cur ? 10 : 1
    }))
  }
})
</script>
