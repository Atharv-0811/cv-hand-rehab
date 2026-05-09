import { HAND_CONNECTIONS } from "@/utils/handConnections"
import { Landmark } from "@/types/hands"

function toCanvasCoords(lm: Landmark, canvas: HTMLCanvasElement) {
  return {
    x: lm.x * canvas.width,
    y: lm.y * canvas.height,
  }
}

export function drawLiveHand(
  ctx: CanvasRenderingContext2D,
  lms: Landmark[],
  canvas: HTMLCanvasElement,
  progress: number
) {
  const p = Math.min(progress, 1)
  const r = Math.floor(255 * (1 - p))
  const g = Math.floor(255 * p)

  ctx.lineWidth = 4
  ctx.strokeStyle = `rgba(${r},${g},120,0.9)`
  ctx.fillStyle = `rgba(${r},${g},120,1)`

  HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
    const a = toCanvasCoords(lms[aIdx], canvas)
    const b = toCanvasCoords(lms[bIdx], canvas)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  })

  lms.forEach((lm) => {
    const { x, y } = toCanvasCoords(lm, canvas)
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
  })
}