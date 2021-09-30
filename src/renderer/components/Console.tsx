import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

type ConsoleProps = {
  className?: string
  content: string
}

export const Console: React.FC<ConsoleProps> = ({ content, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTop = ref.current.scrollHeight
  }, [content])
  return (
    <Pre ref={ref} className={className}>
      {content}
    </Pre>
  )
}

const Pre = styled.div`
  background-color: black;
  color: white;
  height: 100%;
  box-sizing: border-box;
  overflow-y: scroll;
  overflow-x: auto;
  white-space: pre-wrap;
  font-size: 12px;
  border-radius: 4px;
  padding: 8px;
`
