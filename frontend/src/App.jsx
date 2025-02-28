import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WebcamStream from './components/WebcamStream'
import Landing from './components/Landing'

function App() {

  return (
    <>
    <BrowserRouter>
   <Routes>
    <Route path="/" element={<Landing></Landing>} ></Route>
    <Route path="/stream" element={<WebcamStream></WebcamStream>} ></Route>
   </Routes>
   </BrowserRouter>
   </>
  )
}

export default App
