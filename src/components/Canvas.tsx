import React, { useEffect, useRef, useState } from 'react'

type CanvasProps = {
  className?: string
  viewBox?: string
  onRectFixed: (rect: Rect) => void
}

const screenPointToSVGPoint = (
  svg: SVGSVGElement,
  elem: SVGGraphicsElement,
  x: number,
  y: number
) => {
  const p = svg.createSVGPoint()
  p.x = x
  p.y = y
  const CTM = elem.getScreenCTM()
  if (!CTM) return
  return p.matrixTransform(CTM.inverse())
}

export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type Rect = Point & Size

const calcRect = (s: Point, e: Point): Rect => {
  const rect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  if (s.x < e.x) {
    rect.x = Math.round(s.x)
    rect.width = Math.round(e.x - s.x)
  } else {
    rect.x = Math.round(e.x)
    rect.width = Math.round(s.x - e.x)
  }

  if (s.y < e.y) {
    rect.y = Math.round(s.y)
    rect.height = Math.round(e.y - s.y)
  } else {
    rect.y = Math.round(e.y)
    rect.height = Math.round(s.y - e.y)
  }
  return rect
}

export const Canvas: React.FC<CanvasProps> = ({
  className,
  viewBox,
  onRectFixed,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const rectRef = useRef<SVGRectElement>(null)

  const [startPt, setStartPt] = useState<Point>()
  const [endPt, setEndPt] = useState<Point>()
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 })

  useEffect(() => {
    // initialize
    if (viewBox) {
      setRect({ x: 0, y: 0, width: 0, height: 0 })
    }
  }, [viewBox])

  const handleMouseDown: React.MouseEventHandler<SVGSVGElement> = (ev) => {
    if (!svgRef.current) return
    if (!rectRef.current) return

    const pt = screenPointToSVGPoint(
      svgRef.current,
      rectRef.current,
      ev.clientX,
      ev.clientY
    )
    setStartPt(pt)
  }

  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (ev) => {
    if (!svgRef.current) return
    if (!rectRef.current) return
    if (!startPt) return

    const pt = screenPointToSVGPoint(
      svgRef.current,
      rectRef.current,
      ev.clientX,
      ev.clientY
    )
    setEndPt(pt)
  }

  const handleMouseUp: React.MouseEventHandler<SVGSVGElement> = (ev) => {
    if (!svgRef.current) return
    if (!rectRef.current) return
    if (!startPt) return

    const pt = screenPointToSVGPoint(
      svgRef.current,
      rectRef.current,
      ev.clientX,
      ev.clientY
    )
    if (!pt) return
    const r = calcRect(startPt, pt)

    onRectFixed(r)
    setStartPt(undefined)
    setEndPt(undefined)
  }

  useEffect(() => {
    if (!startPt || !endPt) return
    const r = calcRect(startPt, endPt)
    setRect(r)
  }, [startPt, endPt])

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={viewBox}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <rect
        ref={rectRef}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="none"
        stroke="#0070f3"
        strokeWidth="5"
      />
    </svg>
  )
}
