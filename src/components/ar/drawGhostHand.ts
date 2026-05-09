import { Landmark } from "@/types/hands"

const FINGER_GROUPS = [
  { color: [170, 196, 255], segs: [[0,1],[1,2],[2,3],[3,4]] },
  { color: [255, 179, 222], segs: [[0,5],[5,6],[6,7],[7,8]] },
  { color: [179, 255, 204], segs: [[5,9],[9,10],[10,11],[11,12]] },
  { color: [255, 212, 163], segs: [[9,13],[13,14],[14,15],[15,16]] },
  { color: [255, 224, 102], segs: [[13,17],[17,18],[18,19],[19,20]] },
]

function toCanvasCoords(lm: Landmark, canvas: HTMLCanvasElement) {
  return {
    x: lm.x * canvas.width,
    y: lm.y * canvas.height,
  }
}

function drawCapsule(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number,
  bx: number, by: number,
  radius: number
) {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return

  const nx = -dy / len
  const ny = dx / len

  ctx.beginPath()
  ctx.moveTo(ax + nx * radius, ay + ny * radius)
  ctx.lineTo(bx + nx * radius, by + ny * radius)
  ctx.arc(bx, by, radius, Math.atan2(ny, nx), Math.atan2(-ny, -nx))
  ctx.lineTo(ax - nx * radius, ay - ny * radius)
  ctx.arc(ax, ay, radius, Math.atan2(-ny, -nx), Math.atan2(ny, nx))
  ctx.closePath()
}

export function drawGhostHand(
  ctx: CanvasRenderingContext2D,
  lms: Landmark[],
  canvas: HTMLCanvasElement
) {
  const wrist = toCanvasCoords(lms[0], canvas)
  const midMCP = toCanvasCoords(lms[9], canvas)

  const handSize = Math.sqrt(
    (midMCP.x - wrist.x) ** 2 + (midMCP.y - wrist.y) ** 2
  )
  const baseRadius = handSize * 0.07

  FINGER_GROUPS.forEach(({ color: [r, g, b], segs }) => {
    segs.forEach(([aIdx, bIdx], segIndex) => {
      const a = toCanvasCoords(lms[aIdx], canvas)
      const bPt = toCanvasCoords(lms[bIdx], canvas)
      const radius = baseRadius * (1 - segIndex * 0.15)

      drawCapsule(ctx, a.x, a.y, bPt.x, bPt.y, radius)

      ctx.fillStyle = `rgba(${r},${g},${b},0.35)`
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`
      ctx.lineWidth = 2

      ctx.fill()
      ctx.stroke()
    })
  })

  lms.forEach((lm) => {
    const { x, y } = toCanvasCoords(lm, canvas)
    ctx.beginPath()
    ctx.arc(x, y, baseRadius * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.6)"
    ctx.stroke()
  })
}