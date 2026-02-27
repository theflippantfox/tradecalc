<template>
  <div>
    <div class="ph">
      <div class="ph-icon">₹</div>
      <div>
        <div class="ph-title">Brokerage Calculator</div>
        <div class="ph-sub">True net P&amp;L after STT, exchange fees, GST, SEBI charges, and stamp duty.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="btn-row">
        <button v-for="b in brokers" :key="b" class="btn" :class="settings.broker === b ? 'on' : ''" @click="settings.broker = b">
          {{ b.charAt(0).toUpperCase() + b.slice(1) }}
        </button>
      </div>
      <div class="btn-row">
        <button v-for="s in segments" :key="s.k" class="btn" :class="segment === s.k ? 'on' : ''" @click="segment = s.k">
          {{ s.l }}
        </button>
      </div>
      <div class="g3">
        <div class="field"><label>Buy Price (₹)</label><input type="number" v-model.number="buyPrice" placeholder="e.g. 250" step="0.5" /></div>
        <div class="field"><label>Sell Price (₹)</label><input type="number" v-model.number="sellPrice" placeholder="e.g. 270" step="0.5" /></div>
        <div class="field"><label>Quantity</label><input type="number" v-model.number="qty" placeholder="e.g. 100" step="1" /></div>
      </div>
    </div>

    <div class="g2 mb">
      <div class="card card-green">
        <div class="big-stat-label" style="font-family:var(--mono);font-size:.6rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Gross P&amp;L</div>
        <div class="big-stat-val" :class="gross >= 0 ? 'green' : 'red'">{{ gross >= 0 ? '+' : '' }}{{ fmtINR(gross) }}</div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="color:var(--t3)">Net P&L</span>
            <span :style="{ color: net >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }">{{ net >= 0 ? '+' : '' }}{{ fmtINR(net) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="color:var(--t3)">Breakeven Price</span>
            <span style="color:var(--orange);font-family:var(--mono)">₹{{ fmt(bep, 2) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="color:var(--t3)">Charges Impact</span>
            <span style="color:var(--red);font-family:var(--mono)">-{{ gross !== 0 ? fmt(totalCharges / Math.abs(gross) * 100, 2) : '0.00' }}% of gross</span>
          </div>
        </div>
      </div>

      <div class="card card-red">
        <div class="big-stat-label" style="font-family:var(--mono);font-size:.6rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Total Charges</div>
        <div class="big-stat-val red">{{ fmtINR(totalCharges) }}</div>
        <div style="margin-top:14px">
          <div class="cr" v-for="c in charges" :key="c.name">
            <span class="cr-lbl" style="font-size:.78rem">{{ c.name }}</span>
            <span class="cr-val" style="font-size:.78rem">₹{{ fmt(c.val, 4) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card card-teal">
      <div class="card-label">Gross vs Net P&amp;L across Sell Prices</div>
      <VChart :option="chartOption" autoresize style="height:270px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM, AREA_GREEN, tooltipFormatter } from '@/composables/useChartTheme'

const settings = useSettingsStore()
const { fmtINR, fmt, fmtK } = useFormatters()

const brokers  = ['zerodha', 'upstox', 'angel', 'groww', 'icici', 'hdfc']
const segments = [
  { k: 'delivery', l: 'Delivery' }, { k: 'intraday', l: 'Intraday' },
  { k: 'futures',  l: 'F&O Futures' }, { k: 'options', l: 'F&O Options' }
]

const segment  = ref('delivery')
const buyPrice = ref('')
const sellPrice= ref('')
const qty      = ref('')

const buyVal  = computed(() => (buyPrice.value || 0) * (qty.value || 0))
const sellVal = computed(() => (sellPrice.value || 0) * (qty.value || 0))
const turnover = computed(() => buyVal.value + sellVal.value)

const charges = computed(() => {
  const s = segment.value
  const r = s === 'delivery' ? 0 : 0.0003
  const brok = Math.min(buyVal.value * r, 20) + Math.min(sellVal.value * r, 20)
  const sttBase = s === 'delivery' ? sellVal.value : turnover.value / 2
  const stt  = sttBase * (s === 'delivery' ? 0.001 : 0.00025)
  const exch = turnover.value * (s === 'futures' || s === 'options' ? 0.0000019 : 0.0000322)
  const sebi = turnover.value * 0.000001
  const gst  = (brok + exch) * 0.18
  const stamp = buyVal.value * (s === 'delivery' ? 0.00015 : 0.00003)
  return [
    { name: 'Brokerage', val: brok }, { name: 'STT / CTT', val: stt },
    { name: 'Exchange Fee', val: exch }, { name: 'SEBI Charges', val: sebi },
    { name: 'GST (18%)', val: gst }, { name: 'Stamp Duty', val: stamp }
  ]
})

const totalCharges = computed(() => charges.value.reduce((s, r) => s + r.val, 0))
const gross = computed(() => ((sellPrice.value || 0) - (buyPrice.value || 0)) * (qty.value || 0))
const net   = computed(() => gross.value - totalCharges.value)
const bep   = computed(() => (buyPrice.value || 0) + ((qty.value || 0) > 0 ? totalCharges.value / qty.value : 0))

const chartOption = computed(() => {
  const buy = buyPrice.value || 0
  const q   = qty.value || 0
  const total = totalCharges.value
  const pts = Array.from({ length: 21 }, (_, i) => +(buy * (0.88 + i * 0.012)).toFixed(2))
  return {
    backgroundColor: 'transparent', grid: GRID,
    tooltip: { ...TOOLTIP, trigger: 'axis', formatter: tooltipFormatter },
    legend: { data: ['Gross P&L', 'Net P&L'], textStyle: { color: 'rgba(241,243,248,.4)', fontFamily: 'DM Mono', fontSize: 11 }, top: 0, right: 8 },
    xAxis: { ...X_AXIS, data: pts.map(p => `₹${p.toFixed(0)}`) },
    yAxis: { ...Y_AXIS },
    dataZoom: DATA_ZOOM,
    series: [
      {
        name: 'Gross P&L', type: 'line',
        data: pts.map(p => +((p - buy) * q).toFixed(2)),
        lineStyle: { color: C.blue, width: 2 }, itemStyle: { color: C.blue },
        showSymbol: false, smooth: true,
        markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(255,255,255,.1)', type: 'dashed' }, data: [{ yAxis: 0 }] }
      },
      {
        name: 'Net P&L', type: 'line',
        data: pts.map(p => +((p - buy) * q - total).toFixed(2)),
        lineStyle: { color: C.green, width: 2.5 }, itemStyle: { color: C.green },
        showSymbol: false, smooth: true, areaStyle: { color: AREA_GREEN }
      }
    ]
  }
})
</script>
