<template>
  <div>
    <div class="ph">
      <div class="ph-icon">⚖</div>
      <div>
        <div class="ph-title">Risk / Reward</div>
        <div class="ph-sub">Evaluate setup quality. Minimum 1:2 R:R before entering any trade.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">Trade Setup</div>
      <div class="g4 mb">
        <div class="field"><label>Entry (₹)</label><input type="number" v-model.number="entry" placeholder="e.g. 250" step="0.5" /></div>
        <div class="field"><label>Stop Loss (₹)</label><input type="number" v-model.number="sl" placeholder="e.g. 237" step="0.5" /></div>
        <div class="field"><label>Target (₹)</label><input type="number" v-model.number="target" placeholder="e.g. 276" step="0.5" /></div>
        <div class="field"><label>Quantity</label><input type="number" v-model.number="qty" placeholder="e.g. 50" step="1" /></div>
      </div>

      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.7rem;margin-bottom:6px">
        <span style="color:var(--red)">▼ SL ₹{{ sl || 0 }}</span>
        <span style="color:var(--t1);font-weight:600">ENTRY ₹{{ entry || 0 }}</span>
        <span style="color:var(--green)">▲ TGT ₹{{ target || 0 }}</span>
      </div>
      <div class="rr-bar mb">
        <div class="rr-risk" :style="{ flex: riskPct || 1 }">−{{ fmt(riskPct, 1) }}%</div>
        <div style="width:2px;background:var(--t2);flex-shrink:0" />
        <div class="rr-reward" :style="{ flex: rewardPct || 1 }">+{{ fmt(rewardPct, 1) }}%</div>
      </div>
      <div class="rr-ratio-label" :style="{ color: ratio >= 2 ? 'var(--green)' : ratio >= 1 ? 'var(--orange)' : 'var(--red)' }">
        R : R = 1 : {{ fmt(ratio, 2) }}
      </div>

      <div class="g4" style="margin-top:18px">
        <div class="sc red"><div class="sc-label">Risk (₹)</div><div class="sc-val red">{{ fmtINR(risk) }}</div></div>
        <div class="sc green"><div class="sc-label">Reward (₹)</div><div class="sc-val green">{{ fmtINR(reward) }}</div></div>
        <div class="sc" :class="ratio >= 2 ? 'green' : ratio >= 1 ? 'orange' : 'red'">
          <div class="sc-label">R:R Ratio</div>
          <div class="sc-val" :class="ratio >= 2 ? 'green' : ratio >= 1 ? 'orange' : 'red'">1 : {{ fmt(ratio, 2) }}</div>
        </div>
        <div class="sc teal"><div class="sc-label">Min Win Rate</div><div class="sc-val teal">{{ fmt(minWinRate, 1) }}%</div></div>
      </div>
    </div>

    <div class="card card-teal mb">
      <div class="card-label">Net P&L at Different Win Rates · Hover for values</div>
      <VChart :option="chartOption" autoresize style="height:270px" />
    </div>

    <div class="alert" :class="ratio >= 2 ? 'alert-green' : ratio >= 1 ? 'alert-orange' : 'alert-red'">
      <span v-if="ratio >= 2">✓ <strong>Excellent setup.</strong> 1:{{ fmt(ratio, 2) }} R:R — you only need to win {{ fmt(minWinRate, 1) }}% of trades to be profitable.</span>
      <span v-else-if="ratio >= 1">⚡ <strong>Acceptable.</strong> Aim for 1:2+. At this ratio you need {{ fmt(minWinRate, 1) }}% win rate just to break even.</span>
      <span v-else>✗ <strong>Poor setup.</strong> Below 1:1 needs {{ fmt(minWinRate, 1) }}% win rate. Widen your target or tighten your SL.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM } from '@/composables/useChartTheme'

const { fmtINR, fmt, fmtK } = useFormatters()
const entry = ref(''), sl = ref(''), target = ref(''), qty = ref('')

const riskPct    = computed(() => entry.value > 0 ? Math.abs((entry.value - sl.value) / entry.value) * 100 : 0)
const rewardPct  = computed(() => entry.value > 0 ? Math.max(0, (target.value - entry.value) / entry.value * 100) : 0)
const risk       = computed(() => ((entry.value || 0) - (sl.value || 0)) * (qty.value || 0))
const reward     = computed(() => ((target.value || 0) - (entry.value || 0)) * (qty.value || 0))
const ratio      = computed(() => risk.value > 0 ? reward.value / risk.value : 0)
const minWinRate = computed(() => ratio.value > 0 ? (1 / (1 + ratio.value)) * 100 : 0)

const chartOption = computed(() => {
  const pts = Array.from({ length: 11 }, (_, i) => i * 10)
  const pnl = pts.map(wr => (wr / 100) * reward.value - ((100 - wr) / 100) * risk.value)
  return {
    backgroundColor: 'transparent',
    grid: GRID,
    tooltip: {
      ...TOOLTIP, trigger: 'axis',
      formatter: (p) => {
        const v = p[0]?.value
        return `<div style="color:rgba(241,243,248,.4);font-size:.58rem;letter-spacing:1px;margin-bottom:6px">WIN RATE ${p[0]?.name}</div>
          <span style="color:${v >= 0 ? C.green : C.red};font-weight:500">${v >= 0 ? '+' : ''}${fmtK(v)}</span>`
      }
    },
    xAxis: { ...X_AXIS, data: pts.map(p => `${p}%`) },
    yAxis: { ...Y_AXIS },
    dataZoom: DATA_ZOOM,
    visualMap: { show: false, dimension: 1, pieces: [{ lt: 0, color: C.red }, { gte: 0, color: C.green }] },
    series: [{
      name: 'Net P&L', type: 'line', data: pnl,
      lineStyle: { width: 2.5 }, symbolSize: 6, smooth: false,
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: 'rgba(255,255,255,.15)', type: 'dashed' },
        data: [
          { yAxis: 0, label: { formatter: 'Breakeven', color: 'rgba(241,243,248,.3)', fontFamily: 'DM Mono', fontSize: 10 } }
        ]
      },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: pnl.some(v => v >= 0)
            ? [{ offset: 0, color: 'rgba(0,230,118,.2)' }, { offset: 1, color: 'transparent' }]
            : [{ offset: 0, color: 'transparent' }, { offset: 1, color: 'rgba(255,69,96,.15)' }]
        }
      }
    }]
  }
})
</script>
