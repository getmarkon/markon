import '@fontsource/bungee'
import '@fontsource/monaspace-argon'
import '@fontsource/monaspace-argon/400-italic.css'
import '@fontsource/monaspace-argon/700.css'
import '@fontsource/monaspace-krypton'
import '@fontsource/monaspace-krypton/400-italic.css'
import '@fontsource/monaspace-krypton/700.css'
import 'iconify-icon'
import './style.css'
import './components.css'
import { createEditor } from './core.js'
import { setupPreview } from './preview.js'
import { initUI } from './ui.js'

const boot = async () => {
	const { getMarkdown, setMarkdown, onMarkdownUpdated } = await createEditor()
	const { previewHtml } = initUI({ getMarkdown, setMarkdown })
	setupPreview({ getMarkdown, onMarkdownUpdated, previewHtml })
}

boot()
