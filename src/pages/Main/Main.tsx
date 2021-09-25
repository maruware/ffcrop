import React, { FC, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Slider, Card, Button, useToasts } from '@geist-ui/react'
import { Copy as CopyIcon } from '@geist-ui/react-icons'
import { FileSelect } from '../../components/FileSelect'
import { Dimension, Video as _Video } from '../../components/Video'
import { Canvas as _Canvas, Rect } from '../../components/Canvas'
import { useMeasure } from 'react-use'

const calcClipPos = (
  boardWidth: number | undefined,
  boardHeight: number | undefined,
  videoWidth: number | undefined,
  videoHeight: number | undefined
) => {
  if (!boardWidth || !boardHeight) {
    return undefined
  }
  if (!videoWidth || !videoHeight)
    return {
      left: 0,
      top: 0,
      width: boardWidth,
      height: boardHeight,
    }
  // boardの方が横長
  if (boardWidth / boardHeight > videoWidth / videoHeight) {
    const width = Math.floor((videoWidth * boardHeight) / videoHeight)
    return {
      left: Math.floor((boardWidth - width) / 2),
      top: 0,
      height: boardHeight,
      width,
    }
    // boardの方が縦長
  } else {
    const height = Math.floor((videoHeight * boardWidth) / videoWidth)
    return {
      left: 0,
      top: Math.floor((boardHeight - height) / 2),
      width: boardWidth,
      height,
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
    setRect(undefined)

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setFilename(file.name)
  }

  const [boardRef, { width: boardWidth, height: boardHeight }] =
    useMeasure<HTMLDivElement>()

  const clipPos = useMemo(
    () => calcClipPos(boardWidth, boardHeight, videoWidth, videoHeight),
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

  const ffmpegCmd = useMemo(() => {
    if (!rect) return
    return `ffmpeg -i ${filename || 'input'} -vf crop=x=${rect.x}:y=${
      rect.y
    }:w=${rect.width}:h=${rect.height} output`
  }, [filename, rect])

  const [, setToast] = useToasts()
  const handleCopyCmd = () => {
    if (ffmpegCmd) {
      navigator.clipboard.writeText(ffmpegCmd)
      setToast({ text: 'Copied', type: 'success' })
    }
  }

  return (
    <Container>
      <Board ref={boardRef}>
        {clipPos && (
          <>
            <Video
              left={clipPos.left}
              top={clipPos.top}
              width={clipPos.width}
              height={clipPos.height}
              sliderVal={sliderVal}
              src={videoSrc}
              onLoadedDimension={handleLoadedDimension}
            />
            <Canvas
              left={clipPos.left}
              top={clipPos.top}
              width={clipPos.width}
              height={clipPos.height}
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
          {ffmpegCmd && (
            <>
              <FfmpegCmdText>{ffmpegCmd}</FfmpegCmdText>
              <Button
                iconRight={<CopyIcon />}
                auto
                scale={2 / 3}
                onClick={handleCopyCmd}
              />
            </>
          )}
        </FfmpegCmdArea>
      </Controls>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

type ClipPos = {
  left: number
  top: number
  width: number
  height: number
}

const Video = styled(_Video)<ClipPos>`
  position: absolute;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  width: ${(props) => `${props.width}px`};
  height: ${(props) => `${props.height}px`};
`

const Canvas = styled(_Canvas)<ClipPos>`
  position: absolute;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
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

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  padding: 8px; */
`

const FfmpegCmdText = styled.span``
