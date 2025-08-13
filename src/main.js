import '@fontsource/bungee'
import '@fontsource/monaspace-argon'
import '@fontsource/monaspace-argon/400-italic.css'
import '@fontsource/monaspace-argon/700.css'
import '@fontsource/monaspace-krypton'
import '@fontsource/monaspace-krypton/400-italic.css'
import '@fontsource/monaspace-krypton/700.css'
import 'iconify-icon'
import './style.css'
import { boot } from './app.js'

// show app version (from Vite define) in bottom-right
const showVersion = () => {
	const v = import.meta.env?.VERSION
	if (!v) return
	let el = document.getElementById('ver')
	if (!el) {
		el = document.createElement('div')
		el.id = 'ver'
		document.body.appendChild(el)
	}
	el.textContent = `v${v}`
}
showVersion()

await boot()
