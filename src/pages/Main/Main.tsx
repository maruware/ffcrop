import React, { FC, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Slider, Card } from '@geist-ui/react'
import { FileSelect } from '../../components/FileSelect'
import { Dimension, Video as _Video } from '../../components/Video'
import { Canvas as _Canvas, Rect } from '../../components/Canvas'
import { useMeasure } from 'react-use'

const calcClipSize = (
  boardWidth: number | undefined,
  boardHeight: number | undefined,
  videoWidth: number | undefined,
  videoHeight: number | undefined
) => {
  if (!boardWidth || !boardHeight) {
    return {
      clipWidth: undefined,
      clipHeight: undefined,
    }
  }
  if (!videoWidth || !videoHeight)
    return {
      clipWidth: boardWidth,
      clipHeight: boardHeight,
    }
  // boardの方が横長
  if (boardWidth / boardHeight > videoWidth / videoHeight) {
    return {
      clipHeight: boardHeight,
      clipWidth: Math.floor((videoWidth * boardHeight) / videoHeight),
    }
    // boardの方が縦長
  } else {
    return {
      clipWidth: boardWidth,
      clipHeight: Math.floor((videoHeight * boardWidth) / videoWidth),
    }
  }
}

export const Main: FC = () => {
  const [videoSrc, setVideoSrc] = useState('/BigBuckBunny.mp4')
  const [videoWidth, setVideoWidth] = useState<number>()
  const [videoHeight, setVideoHeight] = useState<number>()
  const handleLoadedDimension = (d: Dimension) => {
    setVideoWidth(d.width)
    setVideoHeight(d.height)
  }

  const [sliderVal, setSliderVal] = useState<number>(1)
  const handleChangeSlider = (val: number) => {
    setSliderVal(val)
  }

  const [filename, setFilename] = useState('')
  const handleClickFile = (file: File) => {
    // reset
    setVideoWidth(undefined)
    setVideoHeight(undefined)

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setFilename(file.name)
  }

  const [boardRef, { width: boardWidth, height: boardHeight }] =
    useMeasure<HTMLDivElement>()

  const { clipWidth, clipHeight } = useMemo(
    () => calcClipSize(boardWidth, boardHeight, videoWidth, videoHeight),
    [boardHeight, boardWidth, videoHeight, videoWidth]
  )

  const viewBox = useMemo(() => {
    if (!videoWidth || !videoHeight) return undefined
    return `0, 0, ${videoWidth}, ${videoHeight}`
  }, [videoHeight, videoWidth])

  const [rect, setRect] = useState<Rect>()
  const handleRectFixed = (r: Rect) => {
    setRect(r)
  }

  return (
    <Container>
      <Board ref={boardRef}>
        {clipWidth && clipHeight && (
          <>
            <Video
              width={clipWidth}
              height={clipHeight}
              sliderVal={sliderVal}
              src={videoSrc}
              onLoadedDimension={handleLoadedDimension}
            />
            <Canvas
              width={clipWidth}
              height={clipHeight}
              viewBox={viewBox}
              onRectFixed={handleRectFixed}
            />
          </>
        )}
      </Board>

      <Controls>
        <VideoControl>
          <Slider
            hideValue
            step={0.5}
            max={100}
            value={sliderVal}
            width="99%"
            onChange={handleChangeSlider}
          />
        </VideoControl>
        <Buttons>
          <FileSelect onOpen={handleClickFile} />
        </Buttons>
        <FfmpegCmdArea>
          {rect && (
            <FfmpegCmdText>
              {`ffmpeg -i ${filename || 'input'} -vf crop=x=${rect.x}:y=${
                rect.y
              }:w=${rect.width}:h=${rect.height} output`}
            </FfmpegCmdText>
          )}
        </FfmpegCmdArea>
      </Controls>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

const Video = styled(_Video)<{ width: number; height: number }>`
  position: absolute;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`

const Canvas = styled(_Canvas)<{ width: number; height: number }>`
  position: absolute;
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`

const Controls = styled.div`
  padding: 16px;
`

const VideoControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 8px;
  padding-bottom: 8px;
`

const Board = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: black;
`

const Buttons = styled.div`
  margin-top: 16px;
`

const FfmpegCmdArea = styled(Card)`
  margin-top: 16px !important;
  /* border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  padding: 8px; */
`

const FfmpegCmdText = styled.p``
