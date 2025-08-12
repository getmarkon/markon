import './style.css'
import { initUI } from './actions.js'
import { createEditor } from './editor.js'
import '@fontsource/monaspace-argon'
import '@fontsource/monaspace-argon/700.css'
import '@fontsource/monaspace-argon/400-italic.css'
import '@fontsource/monaspace-neon'
import '@fontsource/monaspace-neon/700.css'
import '@fontsource/monaspace-neon/400-italic.css'
import '@fontsource/monaspace-krypton'
import '@fontsource/monaspace-krypton/700.css'
import '@fontsource/monaspace-krypton/400-italic.css'
import 'iconify-icon'

const { getMarkdown, setMarkdown, onMarkdownUpdated } = await createEditor()
const { rawText } = initUI({ getMarkdown, setMarkdown })
onMarkdownUpdated(() => {
	rawText.value = getMarkdown()
})
