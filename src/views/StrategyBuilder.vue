<template>
  <div>
    <div class="ph">
      <div class="ph-icon">◎</div>
      <div>
        <div class="ph-title">Strategy Builder</div>
        <div class="ph-sub">Define your trading rules and understand the mathematics behind your edge.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">Your Risk Parameters</div>
      <div class="g4 mb">
        <div class="field"><label>Capital (₹)</label><input type="number" v-model.number="settings.capital" placeholder="e.g. 10000" step="1000" /></div>
        <div class="field"><label>Max Risk / Trade (%)</label><input type="number" v-model.number="settings.riskPct" placeholder="e.g. 2" step="0.1" min="0.1" max="10" /></div>
        <div class="field"><label>Max Leverage</label><input type="number" v-model.number="settings.leverage" placeholder="e.g. 2" step="0.5" min="1" max="5" /></div>
        <div class="field"><label>Min R:R Ratio</label><input type="number" v-model.number="minRR" placeholder="e.g. 2" step="0.5" min="0.5" max="10" /></div>
      </div>

      <div class="g4">
        <div class="sc red">
          <div class="sc-label">Max Risk / Trade</div>
          <div class="sc-val red">{{ fmtINR(settings.capital * settings.riskPct / 100) }}</div>
        </div>
        <div class="sc teal">
          <div class="sc-label">Leveraged Power</div>
          <div class="sc-val teal">{{ fmtINR(settings.capital * settings.leverage) }}</div>
        </div>
        <div class="sc green">
          <div class="sc-label">Min Win Rate Needed</div>
          <div class="sc-val green">{{ fmt(minWinRateNeeded, 1) }}%</div>
        </div>
        <div class="sc orange">
          <div class="sc-label">Safe Trading Capital</div>
          <div class="sc-val orange">{{ fmtINR(settings.capital * 0.5) }}</div>
        </div>
      </div>
    </div>

    <!-- Breakeven win rate chart -->
    <div class="card card-teal mb">
      <div class="card-label">Minimum Win Rate Required at Each R:R Ratio</div>
      <VChart :option="rrChart" autoresize style="height:250px" />
    </div>

    <!-- Expectancy matrix -->
    <div class="card mb">
      <div class="card-label">Expectancy Matrix — Win Rate × R:R</div>
      <div style="overflow-x:auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Win Rate →</th>
              <th v-for="wr in [35,40,45,50,55,60,65,70]" :key="wr">{{ wr }}%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rr in [0.5,1,1.5,2,2.5,3]" :key="rr">
              <td class="teal" style="font-weight:600">R:R 1:{{ rr }}</td>
              <td v-for="wr in [35,40,45,50,55,60,65,70]" :key="wr"
                  :class="calcExpectancy(wr, rr) >= 0 ? 'green' : 'red'">
                {{ calcExpectancy(wr, rr) >= 0 ? '+' : '' }}{{ fmt(calcExpectancy(wr, rr), 2) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="alert alert-teal" style="margin-top:14px;font-size:.78rem">
        <strong>How to read this:</strong> Each cell shows the per-trade expectancy. Green = positive edge (profitable long-term). Red = negative edge (losing long-term). Your setup with {{ settings.riskPct }}% risk per trade at {{ settings.leverage }}× leverage amplifies these outcomes.
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">Pre-Trade Setup Checklist</div>
      <ul class="rules">
        <li v-for="(r, i) in checklist" :key="i" class="rule-item">
          <span class="rule-num">{{ i + 1 }}</span><span>{{ r }}</span>
        </li>
      </ul>
    </div>

    <div class="card">
      <div class="card-label">Personal Trading Rules</div>
      <ul class="rules">
        <li v-for="(r, i) in rules" :key="i" class="rule-item">
          <span class="rule-num">{{ i + 1 }}</span><span>{{ r }}</span>
        </li>
      </ul>
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
const minRR = ref(2)

const minWinRateNeeded = computed(() => minRR.value > 0 ? 1 / (1 + minRR.value) * 100 : 0)

const calcExpectancy = (wr, rr) => (wr / 100) * rr - (1 - wr / 100) * 1

const rrChart = computed(() => {
  const rrRange = Array.from({ length: 19 }, (_, i) => +(0.5 + i * 0.5).toFixed(1))
  const winRates = rrRange.map(r => +(1 / (1 + r) * 100).toFixed(2))
  return {
    backgroundColor: 'transparent', grid: GRID,
    tooltip: {
      ...TOOLTIP, trigger: 'axis',
      formatter: (params) => `<div style="color:rgba(241,243,248,.4);font-size:.58rem;letter-spacing:1px;margin-bottom:6px">R:R = 1 : ${params[0].name}</div>Min Win Rate: <span style="color:${C.teal};font-weight:500">${params[0].value.toFixed(1)}%</span>`
    },
    xAxis: { ...X_AXIS, data: rrRange.map(r => `1:${r}`), name: 'R:R Ratio', nameTextStyle: { color: 'rgba(241,243,248,.25)', fontFamily: 'DM Mono', fontSize: 10 } },
    yAxis: { ...Y_AXIS, axisLabel: { ...Y_AXIS.axisLabel, formatter: v => `${v}%` }, min: 0, max: 70 },
    dataZoom: DATA_ZOOM,
    series: [{
      name: 'Min Win Rate', type: 'line', data: winRates,
      lineStyle: { color: C.teal, width: 2.5 }, itemStyle: { color: C.teal },
      areaStyle: { color: AREA_TEAL }, symbolSize: 5, smooth: true,
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: C.orange, type: 'dashed', width: 1.5 },
        data: [{ yAxis: 50, label: { formatter: '50% baseline', color: C.orange, fontFamily: 'DM Mono', fontSize: 10 } }]
      }
    }]
  }
})

const checklist = computed(() => {
  const rp = settings.riskPct, rr = minRR.value, c = settings.capital
  return [
    `Stock has at least 5 lakh average daily volume (NSE). No illiquid small-caps.`,
    `Clear setup identified: Breakout, Pullback to support, or Range reversal.`,
    `Minimum R:R of 1:${rr} confirmed. Target is at least ${rr}× the SL distance.`,
    `Maximum position risk is ${rp}% of capital = ${c > 0 ? fmtINR(c * rp / 100) : '₹—'} per trade.`,
    `Stop loss is placed at entry. No SL = no trade. Non-negotiable.`,
    `Exit plan defined before entry: both profit target and SL levels are locked in.`,
    `Never move SL against the trade — you can trail it forward, never backward.`,
    `Leverage at ${settings.leverage}× max. Reduce leverage during losing streaks.`,
  ]
})

const rules = computed(() => {
  const c = settings.capital, rp = settings.riskPct, l = settings.leverage
  return [
    `Keep ≥50% in safe assets (FD, Liquid MF). Max trading allocation: ${c > 0 ? fmtINR(c * 0.5) : '₹—'}.`,
    `Start at 1× leverage. Increase only after 10+ consecutive trades with positive expectancy.`,
    `Hard stop: If you hit ${fmt(rp * 3, 1)}% drawdown in a single session, stop trading for the day.`,
    `Never average down on a losing position. Cut losses fast, let winners run.`,
    `Max 3 open positions at once. Focus and concentration beats over-diversification.`,
    `Maintain a trade journal. After every trade: note setup, entry reason, outcome, lesson.`,
    `Review your last 20 trades before adding any new position. Know your current win rate.`,
    `Separate trading capital from personal savings. Never trade money you can't afford to lose.`,
  ]
})
</script>
