import React from 'react'

type CanvasProps = {
  className?: string
  viewBox?: string
}

export const Canvas: React.FC<CanvasProps> = ({ className, viewBox }) => {
  return (
    <svg className={className} viewBox={viewBox}>
      <rect
        x="10"
        y="10"
        width="380"
        height="180"
        rx="10"
        ry="10"
        fill="#e74c3c"
      />
    </svg>
  )
}
