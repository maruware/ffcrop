import React, { FC, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Card, Button, useToasts } from '@geist-ui/react'
import { Copy as CopyIcon } from '@geist-ui/react-icons'
import { FileSelect } from '../../components/FileSelect'
import { Video as _Video, VideoMetadata } from '../../components/Video'
import { Canvas as _Canvas, Rect } from '../../components/Canvas'
import { useMeasure } from 'react-use'
import { useDropzone } from 'react-dropzone'
import { VideoSeekSlider } from '../../components/VideoSeekSlider'

declare global {
  interface File {
    path: string
  }
}

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
  const [videoSrc, setVideoSrc] = useState<string>()
  const [videoWidth, setVideoWidth] = useState<number>()
  const [videoHeight, setVideoHeight] = useState<number>()
  const [duration, setDuration] = useState<number>()
  const handleLoadedMetadata = (d: VideoMetadata) => {
    setVideoWidth(d.width)
    setVideoHeight(d.height)
    console.log('duration', d.duration)
    setDuration(d.duration)
  }

  const [currentTime, setCurrentTime] = useState<number>(0)
  const handleChangeCurrentTime = (val: number) => {
    setCurrentTime(val)
  }

  const [filepath, setFilepath] = useState('')
  const handleOpenFile = (file: File) => {
    // reset
    setVideoWidth(undefined)
    setVideoHeight(undefined)
    setRect(undefined)

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setFilepath(file.path)
  }

  const handleDropFile = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setToast({ type: 'error', text: 'Bad file' })
      return
    }
    const file = acceptedFiles[0]
    handleOpenFile(file)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'video/*',
    noClick: true,
    onDrop: handleDropFile,
  })

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
    return `ffmpeg -i ${filepath || 'input'} -vf crop=x=${rect.x}:y=${
      rect.y
    }:w=${rect.width}:h=${rect.height} output`
  }, [filepath, rect])

  const [, setToast] = useToasts()
  const handleCopyCmd = () => {
    if (ffmpegCmd) {
      navigator.clipboard.writeText(ffmpegCmd)
      setToast({ text: 'Copied!', type: 'success' })
    }
  }

  return (
    <Container>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Board ref={boardRef}>
          {!isDragActive && !videoSrc && (
            <DropTxt>
              <p>Drop one video file</p>
            </DropTxt>
          )}
          {isDragActive && (
            <DropTxt>
              <p>Continue dropping ...</p>
            </DropTxt>
          )}
          {!isDragActive && videoSrc && clipPos && (
            <>
              <Video
                left={clipPos.left}
                top={clipPos.top}
                width={clipPos.width}
                height={clipPos.height}
                currentTime={currentTime}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
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
      </div>

      <Controls>
        <VideoControl>
          {duration && (
            <VideoSeekSlider
              duration={duration}
              currentTime={currentTime}
              onChange={handleChangeCurrentTime}
            />
          )}
        </VideoControl>
        <Buttons>
          <FileSelect onOpen={handleOpenFile} />
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

const DropTxt = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    color: white;
    font-size: 36px;
    font-weight: 800;
  }
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
