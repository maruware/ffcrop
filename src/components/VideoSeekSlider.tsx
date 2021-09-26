import React, { useState } from 'react'
import styled from 'styled-components'
import { useTheme } from '@geist-ui/react'

const toTimeString = (d: number) => {
  const h = Math.floor(d / 3600)
  const m = Math.floor((d % 3600) / 60)
  const s = Math.floor((d % 3600) % 60)

  const hDisplay = h > 0 ? h.toString().padStart(2, '0') + ':' : ''
  const mDisplay = m > 0 ? m.toString().padStart(2, '0') + ':' : '00:'
  const sDisplay = s > 0 ? s.toString().padStart(2, '0') : ''
  return hDisplay + mDisplay + sDisplay
}

type VideoSeekSliderProps = {
  currentTime: number
  duration: number
  onChange: (currentTime: number) => void
}

export const VideoSeekSlider: React.FC<VideoSeekSliderProps> = ({
  currentTime,
  duration,
  onChange,
}) => {
  const { palette } = useTheme()
  const [showDetail, setShowDetail] = useState(false)
  const handleMouseOver = () => {
    setShowDetail(true)
  }
  const handleMouseOut = () => {
    setShowDetail(false)
  }

  const [hoverPercent, setHoverPercent] = useState<number>()
  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const x = ev.clientX - r.left
    const percent = (100 * x) / r.width
    console.log('percent', percent)
    setHoverPercent(percent)
  }

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setHoverPercent(undefined)
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const x = ev.clientX - r.left
    const ratio = x / r.width
    const t = duration * ratio
    onChange(t)
  }

  return (
    <div>
      <Bar
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <BackgoundBar color={palette.accents_1} />
        <ForegroundBar
          color={palette.successLight}
          percent={(100 * currentTime) / duration}
        />
        <Circle
          color={palette.successLight}
          percent={(100 * currentTime) / duration}
          hide={!showDetail}
        />
        <Time
          txtColor={palette.accents_5}
          percent={hoverPercent}
          hide={hoverPercent === undefined}
        >
          {hoverPercent !== undefined &&
            toTimeString((duration * hoverPercent) / 100)}
        </Time>
      </Bar>
    </div>
  )
}

const BarBase = styled.div`
  height: 8px;
  border-radius: 6px;
`

const Bar = styled(BarBase)`
  position: relative;
  cursor: pointer;
`
const BackgoundBar = styled(BarBase)<{ color: string }>`
  position: absolute;
  background-color: ${({ color }) => color};
  width: 100%;
`

const ForegroundBar = styled(BarBase)<{ percent: number; color: string }>`
  position: absolute;
  background-color: ${({ color }) => color};
  width: ${({ percent }) => `${percent}%`};
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
`

const Circle = styled.div<{ color: string; percent: number; hide?: boolean }>`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ color }) => color};
  top: -2px;
  left: ${({ percent }) => `calc(${percent}% - 6px)`};
  opacity: ${({ hide }) => (hide ? 0 : 1)};
  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in;
`

const Time = styled.div<{ txtColor: string; percent: number; hide?: boolean }>`
  position: absolute;
  top: -18px;
  left: ${({ percent }) => `calc(${percent}% - 24px)`};
  width: 48px;
  height: 16px;
  border-radius: 6px;
  color: ${({ txtColor }) => txtColor};
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  text-align: center;
  opacity: ${({ hide }) => (hide ? 0 : 1)};
  transition: opacity 0.2s 0s ease;
`
