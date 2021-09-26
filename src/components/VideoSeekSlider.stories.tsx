import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { GeistProvider, CssBaseline } from '@geist-ui/react'

import { VideoSeekSlider } from './VideoSeekSlider'

export default {
  component: VideoSeekSlider,
  title: 'VideoSeekSlider',
} as ComponentMeta<typeof VideoSeekSlider>

const Template: ComponentStory<typeof VideoSeekSlider> = (args) => {
  const [currentTime, setCurrentTime] = useState(0)
  const handleChange = (val: number) => {
    setCurrentTime(val)
  }
  return (
    <GeistProvider>
      <CssBaseline />
      <VideoSeekSlider
        {...args}
        currentTime={currentTime}
        onChange={handleChange}
      />
    </GeistProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  duration: 300,
}
