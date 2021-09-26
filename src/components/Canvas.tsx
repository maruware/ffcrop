import { useTheme } from '@geist-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

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

const rectIncludesPt = (rect: Rect, pt: Point) => {
  return (
    rect.x <= pt.x &&
    rect.x + rect.width >= pt.x &&
    rect.y <= pt.y &&
    rect.y + rect.height >= pt.y
  )
}

export const Canvas: React.FC<CanvasProps> = ({
  className,
  viewBox,
  onRectFixed,
}) => {
  const { palette } = useTheme()

  const svgRef = useRef<SVGSVGElement>(null)
  const rectRef = useRef<SVGRectElement>(null)

  const [startPt, setStartPt] = useState<Point>()
  const [endPt, setEndPt] = useState<Point>()
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 })
  const isMoveMode = useRef(false)
  const startRect = useRef<Rect>()

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
    if (!pt) return

    setStartPt(pt)

    const includes = rectIncludesPt(rect, pt)
    isMoveMode.current = includes
    if (includes) {
      startRect.current = rect
    }
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

    let rect: Rect
    if (!isMoveMode.current) {
      rect = calcRect(startPt, pt)
    } else {
      if (!startRect.current) return
      const dx = pt.x - startPt.x
      const dy = pt.y - startPt.y
      rect = {
        ...startRect.current,
        x: startRect.current.x + dx,
        y: startRect.current.y + dy,
      }
    }
    setRect(rect)
    onRectFixed(rect)

    // initialize
    setStartPt(undefined)
    setEndPt(undefined)
    isMoveMode.current = false
    startRect.current = undefined
  }

  useEffect(() => {
    if (!startPt || !endPt) return
    if (!isMoveMode.current) {
      const r = calcRect(startPt, endPt)
      setRect(r)
    } else {
      if (!startRect.current) return
      const dx = endPt.x - startPt.x
      const dy = endPt.y - startPt.y
      setRect({
        ...startRect.current,
        x: startRect.current.x + dx,
        y: startRect.current.y + dy,
      })
    }
  }, [startPt, endPt])

  return (
    <Svg
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
        fill={palette.success}
        fillOpacity={0.2}
        stroke={palette.success}
        strokeWidth="5"
        strokeOpacity={0.7}
      />
      {rect.width > 0 && rect.height > 0 && (
        <text
          x={rect.x + rect.width - 20}
          y={rect.y + rect.height + 20}
          fill={palette.successDark}
          stroke="white"
          strokeWidth={0.4}
          strokeOpacity={0.7}
          fontSize={18}
          fontWeight={800}
        >
          {`${rect.width} x ${rect.height}`}
        </text>
      )}
    </Svg>
  )
}

const Svg = styled.svg`
  cursor: pointer;
`
