import { useFormatters } from './useFormatters'

const { fmtK } = useFormatters()

export const C = {
  teal:   '#00CFBA',
  orange: '#FF7A40',
  green:  '#00E676',
  red:    '#FF4560',
  blue:   '#60A5FA',
  violet: '#A78BFA',
  grey:   'rgba(241,243,248,.22)',
}

const MONO = 'DM Mono, monospace'

export const TOOLTIP = {
  backgroundColor: 'rgba(11,14,22,.97)',
  borderColor: 'rgba(0,207,186,.2)',
  borderWidth: 1,
  padding: [12, 16],
  textStyle: { color: '#F1F3F8', fontFamily: MONO, fontSize: 11 },
  extraCssText: 'border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.6)',
}

export const AXIS_LABEL = { color: 'rgba(241,243,248,.28)', fontFamily: MONO, fontSize: 10 }

export const X_AXIS = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,.06)' } },
  axisTick: { show: false },
  axisLabel: AXIS_LABEL,
  splitLine: { show: false },
}

export const Y_AXIS = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { ...AXIS_LABEL, formatter: (v) => fmtK(v) },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,.05)', type: 'dashed' } },
}

export const GRID = { top: 16, right: 16, bottom: 36, left: 70, containLabel: false }

export const DATA_ZOOM = [
  { type: 'inside', zoomOnMouseWheel: true, moveOnMouseWheel: false },
  { type: 'slider', show: false },
]

export const AREA_TEAL = {
  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [{ offset: 0, color: 'rgba(0,207,186,.22)' }, { offset: 1, color: 'rgba(0,207,186,.01)' }]
}

export const AREA_GREEN = {
  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [{ offset: 0, color: 'rgba(0,230,118,.18)' }, { offset: 1, color: 'rgba(0,230,118,.01)' }]
}

export function tooltipFormatter(params) {
  const arr = Array.isArray(params) ? params : [params]
  let s = `<div style="color:rgba(241,243,248,.4);font-size:.58rem;letter-spacing:1px;margin-bottom:8px;text-transform:uppercase">${arr[0].axisValueLabel || arr[0].name}</div>`
  arr.forEach(p => {
    s += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block;box-shadow:0 0 6px ${p.color}"></span>
      <span style="color:rgba(241,243,248,.5)">${p.seriesName}:</span>
      <span style="font-weight:500;color:${p.color}">${fmtK(p.value)}</span>
    </div>`
  })
  return s
}
