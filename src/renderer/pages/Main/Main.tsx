import React, { FC, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useToasts } from '@geist-ui/react'
import {
  Clipboard as ClipboardIcon,
  FileFunction as FileFunctionIcon,
} from '@geist-ui/react-icons'
import { FileSelect } from '../../components/FileSelect'
import { Video as _Video, VideoMetadata } from '../../components/Video'
import { Canvas as _Canvas, Rect } from '../../components/Canvas'
import { useMeasure } from 'react-use'
import { useDropzone } from 'react-dropzone'
import { VideoSeekSlider } from '../../components/VideoSeekSlider'
import { IconButton } from '../../components/IconButton'
import { Console } from '../../components/Console'

declare global {
  interface File {
    path: string
  }
  interface Window {
    api: {
      execFfmpeg(cmd: string): Promise<string>
      // eslint-disable-next-line @typescript-eslint/ban-types
      on(channel: string, fn: Function): void
    }
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

const outputFilename = (src: string, suffix: string) => {
  const m = src.match(/(.+)[.]([^.]+)$/)
  if (!m) return undefined
  return m[1] + suffix + '.' + m[2]
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

  const [
    boardRef,
    { width: boardWidth, height: boardHeight },
  ] = useMeasure<HTMLDivElement>()

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
    const output = outputFilename(filepath, '_cropped') || 'output'
    return `ffmpeg -y -i ${filepath || 'input'} -vf crop=x=${rect.x}:y=${
      rect.y
    }:w=${rect.width}:h=${rect.height} ${output}`
  }, [filepath, rect])

  const [, setToast] = useToasts()
  const handleCopyCmd = () => {
    if (ffmpegCmd) {
      navigator.clipboard.writeText(ffmpegCmd)
      setToast({ text: 'Copied!', type: 'success' })
    }
  }

  const [processOut, setProcessOut] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    window.api.on('ffmpegOut', (out: string) => {
      const out_ = out.replace('\r', '\n')
      setProcessOut((prev) => prev + out_)
    })
  }, [])

  const handleExecCmd = async () => {
    if (!ffmpegCmd) return
    setProcessOut('')
    setProcessing(true)
    const r = await window.api.execFfmpeg(ffmpegCmd)
    setProcessing(false)
    console.log(r)
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

      <Panel>
        <Controls>
          <Buttons>
            <FileSelect onOpen={handleOpenFile} />
          </Buttons>
          <VideoControl>
            {duration && (
              <VideoSeekSlider
                duration={duration}
                currentTime={currentTime}
                onChange={handleChangeCurrentTime}
              />
            )}
          </VideoControl>
        </Controls>
        <FfmpegCmdArea>
          <FfmpegCmdText>{ffmpegCmd}</FfmpegCmdText>
          <FfmpegButtons>
            <IconButton
              iconRight={<ClipboardIcon />}
              onClick={handleCopyCmd}
              disabled={!ffmpegCmd}
            />
            <IconButton
              iconRight={<FileFunctionIcon />}
              onClick={handleExecCmd}
              disabled={!ffmpegCmd || processing}
            />
          </FfmpegButtons>
        </FfmpegCmdArea>

        <Console content={processOut} />
      </Panel>
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

const Panel = styled.div`
  padding: 8px 16px;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
`

const VideoControl = styled.div`
  width: 100%;
`

const Board = styled.div`
  position: relative;
  width: 100%;
  height: 440px;
  background-color: black;
`

const Buttons = styled.div`
  margin-right: 8px;
`

const FfmpegCmdArea = styled.div`
  margin-top: 8px !important;
  border-radius: 4px;
  padding: 16px 8px;
  border-style: solid;
  border-color: #eaeaea;
  border-width: 1px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  display: flex;
`

const FfmpegCmdText = styled.span`
  font-size: 14px;
`

const FfmpegButtons = styled.div`
  display: flex;
`
