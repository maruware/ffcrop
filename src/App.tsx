import React, { FC } from 'react'
import { GeistProvider, CssBaseline } from '@geist-ui/react'
import { Main } from './pages/Main'

const App: FC = () => {
  return (
    <GeistProvider>
      <CssBaseline />
      <Main />
    </GeistProvider>
  )
}

export default App
