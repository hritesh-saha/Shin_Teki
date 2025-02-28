import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WebcamStream from './components/WebcamStream'

function App() {

  return (
    <>
    <BrowserRouter>
   <Routes>
    <Route path="/" element={<WebcamStream></WebcamStream>} ></Route>
   </Routes>
   </BrowserRouter>
   </>
  )
}

export default App
