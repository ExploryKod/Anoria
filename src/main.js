import './style.css'
import './styles/main.css'
import './styles/btn.css'
import { initPWA } from './pwa.js'

const app = document.querySelector('#root-window')

initPWA(app)
