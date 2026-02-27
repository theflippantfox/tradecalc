<template>
  <div>
    <div class="ph">
      <div class="ph-icon">↗</div>
      <div>
        <div class="ph-title">Trade Simulator</div>
        <div class="ph-sub">Simulate N individual trades resolved by your win rate and R:R. Re-run for different sequences.</div>
      </div>
    </div>

    <div class="card mb">
      <div class="card-label">System Parameters</div>
      <div class="g4 mb">
        <div class="field"><label>Starting Capital (₹)</label><input type="number" v-model.number="settings.capital" placeholder="e.g. 10000" step="1000" /></div>
        <div class="field"><label>Win Rate (%)</label><input type="number" v-model.number="winRate" placeholder="e.g. 55" step="1" min="1" max="99" /></div>
        <div class="field"><label>Avg Win (%)</label><input type="number" v-model.number="avgWin" placeholder="e.g. 6" step="0.5" /></div>
        <div class="field"><label>Avg Loss (%)</label><input type="number" v-model.number="avgLoss" placeholder="e.g. 3" step="0.5" /></div>
        <div class="field"><label>Risk / Trade (%)</label><input type="number" v-model.number="settings.riskPct" placeholder="e.g. 2" step="0.1" /></div>
        <div class="field"><label>Leverage</label><input type="number" v-model.number="settings.leverage" placeholder="e.g. 1" step="0.5" min="1" max="5" /></div>
        <div class="field"><label>Total Trades</label><input type="number" v-model.number="tradeCount" placeholder="e.g. 50" step="10" min="5" max="500" /></div>
        <div class="field">
          <label>Result Variance (%)</label>
          <input type="number" v-model.number="variance" placeholder="e.g. 30" step="10" min="0" max="100" title="% variance around avg win/loss" />
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <button class="btn-action" @click="run">▶ Run Simulation</button>
        <button class="btn-action secondary" @click="run">↺ Re-Roll Trades</button>
        <span style="font-size:.75rem;color:var(--t3);font-family:var(--mono)">Each run produces a unique trade sequence from the same parameters</span>
      </div>
    </div>

    <template v-if="trades.length">
      <!-- Summary stats -->
      <div class="g4 mb">
        <div class="big-stat">
          <div class="big-stat-label">Final Capital</div>
          <div class="big-stat-val" :class="finalBal >= settings.capital ? 'green' : 'red'">{{ fmtINR(finalBal) }}</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Total Return</div>
          <div class="big-stat-val" :class="totalRet >= 0 ? 'green' : 'red'">{{ totalRet >= 0 ? '+' : '' }}{{ fmt(totalRet, 2) }}%</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Expectancy / Trade</div>
          <div class="big-stat-val" :class="expectancy >= 0 ? 'teal' : 'red'">{{ expectancy >= 0 ? '+' : '' }}{{ fmt(expectancy, 3) }}%</div>
        </div>
        <div class="big-stat">
          <div class="big-stat-label">Max Drawdown</div>
          <div class="big-stat-val red">−{{ fmt(maxDD, 2) }}%</div>
        </div>
      </div>

      <div class="g4 mb">
        <div class="sc green">
          <div class="sc-label">Wins</div>
          <div class="sc-val green">{{ wins }}</div>
          <div class="sc-delta">{{ fmt(wins / trades.length * 100, 1) }}% actual win rate</div>
        </div>
        <div class="sc red">
          <div class="sc-label">Losses</div>
          <div class="sc-val red">{{ losses }}</div>
          <div class="sc-delta">{{ fmt(losses / trades.length * 100, 1) }}% actual loss rate</div>
        </div>
        <div class="sc teal">
          <div class="sc-label">Best Trade</div>
          <div class="sc-val teal">+{{ fmt(bestPct, 2) }}%</div>
          <div class="sc-delta">{{ fmtINR(bestPnl) }}</div>
        </div>
        <div class="sc orange">
          <div class="sc-label">Worst Trade</div>
          <div class="sc-val orange">{{ fmt(worstPct, 2) }}%</div>
          <div class="sc-delta">{{ fmtINR(worstPnl) }}</div>
        </div>
        <div class="sc grey">
          <div class="sc-label">Avg Win</div>
          <div class="sc-val grey">+{{ fmt(avgWinAmt, 2) }}</div>
        </div>
        <div class="sc grey">
          <div class="sc-label">Avg Loss</div>
          <div class="sc-val grey">{{ fmt(avgLossAmt, 2) }}</div>
        </div>
        <div class="sc" :class="maxWinStreak >= 3 ? 'green' : 'grey'">
          <div class="sc-label">Max Win Streak</div>
          <div class="sc-val" :class="maxWinStreak >= 3 ? 'green' : 'grey'">{{ maxWinStreak }}</div>
        </div>
        <div class="sc" :class="maxLossStreak >= 3 ? 'red' : 'grey'">
          <div class="sc-label">Max Loss Streak</div>
          <div class="sc-val" :class="maxLossStreak >= 3 ? 'red' : 'grey'">{{ maxLossStreak }}</div>
        </div>
      </div>

      <!-- Equity curve chart -->
      <div class="card card-teal mb">
        <div class="card-label">Equity Curve — Trade by Trade · Hover for details</div>
        <VChart :option="equityChart" autoresize style="height:300px" />
      </div>

      <!-- P&L distribution bar chart -->
      <div class="card card-orange mb">
        <div class="card-label">Trade P&amp;L Distribution</div>
        <VChart :option="distChart" autoresize style="height:220px" />
      </div>

      <!-- Trade log table -->
      <div class="card">
        <div class="card-label">Trade Log — All {{ trades.length }} Trades</div>
        <div class="tbl-wrap scrollable">
          <table class="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Result</th>
                <th>Return (%)</th>
                <th>Trade P&L (₹)</th>
                <th>Running Balance (₹)</th>
                <th>Drawdown (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in trades" :key="t.n">
                <td class="muted">{{ t.n }}</td>
                <td><span :class="t.win ? 'badge badge-win' : 'badge badge-loss'">{{ t.win ? 'WIN' : 'LOSS' }}</span></td>
                <td :class="t.win ? 'green' : 'red'">{{ t.win ? '+' : '' }}{{ fmt(t.returnPct, 2) }}%</td>
                <td :class="t.win ? 'green' : 'red'">{{ t.win ? '+' : '' }}{{ fmt(t.pnl, 2) }}</td>
                <td class="teal">{{ fmt(t.balance, 2) }}</td>
                <td :class="t.dd > 1 ? 'red' : 'muted'">{{ t.dd > 0 ? '−' : '' }}{{ fmt(t.dd, 2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-teal">
      Fill in your system parameters above and click <strong>Run Simulation</strong> to see a trade-by-trade breakdown of your strategy's performance.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFormatters } from '@/composables/useFormatters'
import { C, TOOLTIP, X_AXIS, Y_AXIS, GRID, DATA_ZOOM, AREA_TEAL } from '@/composables/useChartTheme'

const settings = useSettingsStore()
const { fmtINR, fmt, fmtK } = useFormatters()

const winRate    = ref('')
const avgWin     = ref('')
const avgLoss    = ref('')
const tradeCount = ref('')
const variance   = ref(30)
const trades     = ref([])

function run() {
  const cap   = settings.capital || 0
  const wr    = (winRate.value || 50) / 100
  const win   = (avgWin.value || 0) / 100
  const loss  = (avgLoss.value || 0) / 100
  const rPct  = (settings.riskPct || 2) / 100
  const lev   = settings.leverage || 1
  const n     = Math.min(tradeCount.value || 20, 500)
  const vary  = (variance.value || 30) / 100
  if (!cap || !win || !loss || !n) return

  const log = []
  let bal = cap, peak = cap

  for (let i = 1; i <= n; i++) {
    const isWin = Math.random() < wr
    const mult  = 1 + (Math.random() * 2 - 1) * vary
    const retPct = (isWin ? win : loss) * mult
    const pnl   = (isWin ? 1 : -1) * bal * rPct * lev * (retPct / Math.max(win, loss))
    bal = Math.max(0, bal + pnl)
    peak = Math.max(peak, bal)
    const dd = peak > 0 ? (peak - bal) / peak * 100 : 0
    log.push({ n: i, win: isWin, returnPct: (isWin ? 1 : -1) * Math.abs(retPct) * 100, pnl, balance: bal, dd })
  }
  trades.value = log
}

const finalBal   = computed(() => trades.value[trades.value.length - 1]?.balance || 0)
const totalRet   = computed(() => settings.capital > 0 ? (finalBal.value - settings.capital) / settings.capital * 100 : 0)
const expectancy = computed(() => (winRate.value || 0) / 100 * (avgWin.value || 0) - (1 - (winRate.value || 0) / 100) * (avgLoss.value || 0))
const wins       = computed(() => trades.value.filter(t => t.win).length)
const losses     = computed(() => trades.value.filter(t => !t.win).length)
const maxDD      = computed(() => Math.max(0, ...trades.value.map(t => t.dd)))
const bestPct    = computed(() => Math.max(0, ...trades.value.filter(t => t.win).map(t => t.returnPct)))
const worstPct   = computed(() => Math.min(0, ...trades.value.filter(t => !t.win).map(t => t.returnPct)))
const bestPnl    = computed(() => Math.max(0, ...trades.value.filter(t => t.win).map(t => t.pnl)))
const worstPnl   = computed(() => Math.min(0, ...trades.value.filter(t => !t.win).map(t => t.pnl)))
const avgWinAmt  = computed(() => { const w = trades.value.filter(t => t.win); return w.length ? w.reduce((s, t) => s + t.pnl, 0) / w.length : 0 })
const avgLossAmt = computed(() => { const l = trades.value.filter(t => !t.win); return l.length ? l.reduce((s, t) => s + t.pnl, 0) / l.length : 0 })
const maxWinStreak  = computed(() => { let max = 0, cur = 0; trades.value.forEach(t => { cur = t.win ? cur + 1 : 0; max = Math.max(max, cur) }); return max })
const maxLossStreak = computed(() => { let max = 0, cur = 0; trades.value.forEach(t => { cur = !t.win ? cur + 1 : 0; max = Math.max(max, cur) }); return max })

const equityChart = computed(() => {
  if (!trades.value.length) return {}
  const labels = trades.value.map(t => `T${t.n}`)
  const balances = trades.value.map(t => +t.balance.toFixed(2))
  const startCap = settings.capital

  return {
    backgroundColor: 'transparent',
    grid: GRID,
    tooltip: {
      ...TOOLTIP, trigger: 'axis',
      formatter: (params) => {
        const t = trades.value[params[0]?.dataIndex]
        if (!t) return ''
        return `<div style="color:rgba(241,243,248,.4);font-size:.58rem;letter-spacing:1px;margin-bottom:8px">TRADE ${t.n}</div>
          <div style="margin-bottom:4px">Result: <span style="color:${t.win ? C.green : C.red};font-weight:600">${t.win ? 'WIN' : 'LOSS'} ${t.returnPct >= 0 ? '+' : ''}${t.returnPct.toFixed(2)}%</span></div>
          <div style="margin-bottom:4px">P&L: <span style="color:${t.pnl >= 0 ? C.green : C.red}">${t.pnl >= 0 ? '+' : ''}₹${Math.abs(t.pnl).toFixed(2)}</span></div>
          <div style="margin-bottom:4px">Balance: <span style="color:${C.teal}">₹${t.balance.toFixed(2)}</span></div>
          <div>Drawdown: <span style="color:${C.red}">−${t.dd.toFixed(2)}%</span></div>`
      }
    },
    xAxis: {
      ...X_AXIS, data: labels,
      axisLabel: { ...X_AXIS.axisLabel, formatter: (v, i) => trades.value.length > 50 ? (i % 10 === 0 ? v : '') : (i % 5 === 0 ? v : '') }
    },
    yAxis: { ...Y_AXIS },
    dataZoom: DATA_ZOOM,
    series: [
      {
        name: 'Capital', type: 'line', data: balances,
        lineStyle: { color: C.teal, width: 2 }, itemStyle: { color: C.teal },
        symbol: (val, params) => { const t = trades.value[params.dataIndex]; return t ? (t.win ? 'circle' : 'diamond') : 'none' },
        symbolSize: (val, params) => { const t = trades.value[params.dataIndex]; return t ? 5 : 0 },
        itemStyle: { color: (params) => { const t = trades.value[params.dataIndex]; return t ? (t.win ? C.green : C.red) : C.teal } },
        areaStyle: { color: AREA_TEAL }, smooth: false,
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: 'rgba(255,255,255,.1)', type: 'dashed' },
          data: [{ yAxis: startCap, label: { formatter: `Start ₹${startCap}`, color: 'rgba(241,243,248,.3)', fontFamily: 'DM Mono', fontSize: 10 } }]
        }
      }
    ]
  }
})

const distChart = computed(() => {
  if (!trades.value.length) return {}
  return {
    backgroundColor: 'transparent',
    grid: { top: 12, right: 16, bottom: 36, left: 70 },
    tooltip: {
      ...TOOLTIP, trigger: 'item',
      formatter: (p) => `<div style="color:${p.color};font-weight:500">${p.data.value >= 0 ? '+' : ''}${fmtK(p.data.value)}</div>`
    },
    xAxis: {
      ...X_AXIS,
      data: trades.value.map(t => `T${t.n}`),
      axisLabel: { ...X_AXIS.axisLabel, formatter: (v, i) => trades.value.length > 50 ? (i % 10 === 0 ? v : '') : (i % 5 === 0 ? v : '') }
    },
    yAxis: { ...Y_AXIS },
    series: [{
      name: 'P&L', type: 'bar',
      data: trades.value.map(t => ({
        value: +t.pnl.toFixed(2),
        itemStyle: { color: t.win ? 'rgba(0,230,118,.65)' : 'rgba(255,69,96,.6)', borderColor: t.win ? C.green : C.red, borderWidth: 1, borderRadius: 2 }
      })),
      barMaxWidth: 12,
      markLine: { silent: true, symbol: 'none', lineStyle: { color: 'rgba(255,255,255,.1)', type: 'dashed' }, data: [{ yAxis: 0 }] }
    }]
  }
})
</script>
