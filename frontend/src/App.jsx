import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WebcamStream from './components/WebcamStream'
import Landing from './components/Landing'
import ShinC from './components/Shin'

function App() {

  return (
    <>
    <BrowserRouter>
   <Routes>
    <Route path="/" element={<Landing></Landing>} ></Route>
    <Route path="/stream" element={<WebcamStream></WebcamStream>} ></Route>
    <Route path="/chain" element={<ShinC></ShinC>} ></Route>

   </Routes>
   </BrowserRouter>
   </>
  )
}

export default App
