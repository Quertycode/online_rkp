import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initStore } from './utils/userStore'
import { initGamificationStore } from './utils/gamificationStore'

// Инициализация stores
initStore()
initGamificationStore()

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)