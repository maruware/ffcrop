import React, { useEffect, useRef } from 'react'
import { useThrottle } from 'react-use'
import styled from 'styled-components'

export type Dimension = {
  width: number
  height: number
}

export type VideoProps = {
  className?: string
  sliderVal: number
  src: string
  onLoadedDimension: (d: Dimension) => void
}

export const Video: React.FC<VideoProps> = ({
  className,
  sliderVal,
  src,
  onLoadedDimension,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const throttledSliderVal = useThrottle(sliderVal, 100)
  useEffect(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      const t = (duration * throttledSliderVal) / 100
      if (!t) {
        videoRef.current.currentTime = 1
        return
      }
      videoRef.current.currentTime = t
    }
  }, [throttledSliderVal])

  const handleLoadedMetadata: React.ReactEventHandler<HTMLVideoElement> =
    () => {
      if (!videoRef.current) return

      console.log('handleLoadedMetadata')
      onLoadedDimension({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      })
    }

  return (
    <VideoElem
      ref={videoRef}
      src={src}
      className={className}
      onLoadedMetadata={handleLoadedMetadata}
    />
  )
}

const VideoElem = styled.video`
  background-color: black;
`
