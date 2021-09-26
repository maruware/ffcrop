import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { GeistProvider, CssBaseline } from '@geist-ui/react'

import { VideoSeekSlider } from './VideoSeekSlider'

export default {
  component: VideoSeekSlider,
  title: 'VideoSeekSlider',
  argTypes: { onChange: { action: 'onChange' } },
} as ComponentMeta<typeof VideoSeekSlider>

const Template: ComponentStory<typeof VideoSeekSlider> = (args) => (
  <GeistProvider>
    <CssBaseline />
    <VideoSeekSlider {...args} />
  </GeistProvider>
)

export const Default = Template.bind({})
Default.args = {
  duration: 300,
  currentTime: 30,
}
