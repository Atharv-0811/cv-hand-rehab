"use client"

import { useEffect, useRef } from "react"
import { Landmark } from "@/types/hands"
import { drawLiveHand } from "./drawLiveHand"
import { drawGhostHand } from "./drawGhostHand"

type HandCanvasProps = {
  videoRef: React.RefObject<HTMLVideoElement>
  landmarks: Landmark[] | null

  showLiveHand?: boolean
  showGhostHand?: boolean

  ghostLandmarks?: Landmark[] | null
  progress?: number
}

export default function HandCanvas({
  videoRef,
  landmarks,
  showLiveHand = true,
  showGhostHand = false,
  ghostLandmarks = null,
  progress = 0,
}: HandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const landmarksRef = useRef(landmarks)
  const ghostRef = useRef(ghostLandmarks)
  const progressRef = useRef(progress)

  landmarksRef.current = landmarks
  ghostRef.current = ghostLandmarks
  progressRef.current = progress

  useEffect(() => {
    let animId: number

    function render() {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video || !video.videoWidth) {
        animId = requestAnimationFrame(render)
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        animId = requestAnimationFrame(render)
        return
      }

      // sync canvas to video
      // canvas.width = video.videoWidth
      // canvas.height = video.videoHeight

      const rect = video.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // compute scale factors
      const scaleX = rect.width / video.videoWidth
      const scaleY = rect.height / video.videoHeight


      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // mirror to match CameraMirror
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)

      const ghost = ghostRef.current
      const lms = landmarksRef.current
      const prog = progressRef.current

      if (showGhostHand && ghost) {
        drawGhostHand(ctx, ghost, canvas)
      }

      if (showLiveHand && lms) {
        drawLiveHand(ctx, lms, canvas, prog)
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [videoRef, showLiveHand, showGhostHand])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}