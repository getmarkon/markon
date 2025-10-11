import { createButtons } from './actions.js'
import { createHelpDialog, createHelpIcon } from './help.js'
import { observeTheme } from './syntax.js'
import { setupHotkeys } from './hotkeys.js'
import { createPreviewManager, createResizeHandler } from './resize.js'
import createToolbar from './toolbar.js'
import { applyTheme, createPointerHandler, createToast, getPrefTheme } from './utils.js'

// Initialize UI components
export const initUI = ({ getMarkdown, setMarkdown }) => {
	// Setup toast
	const toast = document.getElementById('toast')
	const showToast = createToast(toast)

	// Setup theme
	const theme = getPrefTheme()
	applyTheme(theme)

	// Setup buttons
	createButtons(showToast)

	// Setup help system
	const helpDialog = createHelpDialog()
	const helpIcon = createHelpIcon(helpDialog)
	document.body.appendChild(helpIcon)

	// Setup hotkeys
	setupHotkeys(helpDialog)

	// Setup theme observer
	observeTheme()

	// Setup preview manager and toggle button
	const previewManager = createPreviewManager(document.getElementById('wrap'))

	// Setup resize functionality
	const split = document.getElementById('split')
	const resizeHandle = document.getElementById('resize-handle')
	const previewAside = document.getElementById('preview')
	const wrap = document.getElementById('wrap')
	createPointerHandler(split, createResizeHandler(split, previewAside, wrap, previewManager))
	createPointerHandler(resizeHandle, createResizeHandler(split, previewAside, wrap, previewManager))

	// Setup toolbar with auto-hide behavior
	createToolbar()

	// Expose markdown functions globally for button access
	window.getMarkdown = getMarkdown
	window.setMarkdown = setMarkdown
	window.previewManager = previewManager
	window.readClipboardSmart = async () => {
		const { readClipboardSmart } = await import('./utils.js')
		return readClipboardSmart()
	}

	// Return preview HTML element for preview module
	return { previewHtml: document.getElementById('previewhtml') }
}
