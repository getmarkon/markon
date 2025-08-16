import { createEditor } from './editor.js'
import { setupPreview } from './preview.js'
import { initUI } from './ui.js'

export const boot = async () => {
	const { getMarkdown, setMarkdown, onMarkdownUpdated } = await createEditor()
	const { previewHtml } = initUI({ getMarkdown, setMarkdown })
	setupPreview({ getMarkdown, onMarkdownUpdated, previewHtml })
}
