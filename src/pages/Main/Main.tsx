import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Slider } from '@geist-ui/react'
import { useThrottle } from 'react-use'

const SLIDER_MAX = 100

export const Main: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [sliderVal, setSliderVal] = useState<number>(0)
  const handleChangeSlider = (val: number) => {
    setSliderVal(val)
  }

  const throttledSliderVal = useThrottle(sliderVal, 100)
  useEffect(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      videoRef.current.currentTime =
        (duration * throttledSliderVal) / SLIDER_MAX
    }
  }, [throttledSliderVal])

  return (
    <Container>
      <Video src="/BigBuckBunny.mp4" ref={videoRef} />
      <VideoControl>
        <Slider
          hideValue
          step={0.5}
          max={SLIDER_MAX}
          width="95%"
          value={sliderVal}
          onChange={handleChangeSlider}
        />
      </VideoControl>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

const Video = styled.video`
  width: 100%;
  height: auto;
  background-color: black;
`
const VideoControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 8px;
  padding-bottom: 8px;
`
