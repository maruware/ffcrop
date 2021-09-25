import React, { useRef } from 'react'
import { Button } from '@geist-ui/react'
import { File as FileIcon } from '@geist-ui/react-icons'
import styled from 'styled-components'

export type FileSelectProps = {
  onOpen: (file: File) => void
}

export const FileSelect: React.FC<FileSelectProps> = ({ onOpen }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSelectFile = () => {
    inputRef.current && inputRef.current.click()
  }
  const handleOpenFile: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    if (!ev.target.files) return
    if (ev.target.files.length === 0) return
    const file = ev.target.files[0]
    onOpen(file)
  }
  return (
    <div>
      <Button
        auto
        scale={2 / 3}
        iconRight={<FileIcon />}
        onClick={handleSelectFile}
      />
      <InputFile ref={inputRef} accept="video/*" onChange={handleOpenFile} />
    </div>
  )
}

const InputFile = styled.input.attrs(() => ({
  type: 'file',
}))`
  display: none;
`
