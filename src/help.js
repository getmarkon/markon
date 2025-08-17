import { createClickHandler, createElement, injectStyles } from './utils.js'

// Help component styles
const styles = `
.help-overlay {
	position: fixed;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgba(42, 44, 45, 0.28);
	z-index: 1300;
	opacity: 0;
	transition: opacity 0.2s ease;
}

.help-overlay.visible {
	opacity: 1;
}

.help-dialog {
	background: rgba(58, 60, 61, 0.6);
	border-radius: 12px;
	padding: 24px;
	max-width: 700px;
	width: 90vw;
	box-shadow: 0 0 24px rgba(0, 0, 0, 0.32);
	backdrop-filter: blur(8px);
	transform: scale(0.9);
	transition: transform 0.2s ease;
}

.help-dialog.visible {
	transform: scale(1);
}

.help-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.help-title {
	margin: 0;
	color: var(--fg);
	font-size: 20px;
	font-weight: 600;
}

.help-close {
	background: none;
	border: none;
	color: var(--muted);
	cursor: pointer;
	padding: 8px;
	border-radius: 6px;
	font-size: 18px;
}

.help-close:hover {
	background: var(--text-overlay);
}

.help-shortcuts {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	align-items: start;
}

.help-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: rgba(58, 60, 61, 0.6);
	border-radius: 8px;
	border: 1px solid var(--muted);
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
}

.help-item:hover {
	background: rgba(74, 76, 77, 0.6);
	border-color: var(--accent);
	transform: translateY(-1px);
}

.help-key {
	background: var(--accent);
	border: none;
	border-radius: 6px;
	padding: 6px 10px;
	font-size: 13px;
	font-family: monospace;
	color: var(--bg);
	font-weight: 600;
	min-width: 24px;
	text-align: center;
}

.help-desc {
	color: var(--fg);
	font-size: 14px;
	font-weight: 500;
}

.help-icon {
	position: fixed;
	bottom: 20px;
	right: 20px;
	border-radius: 50%;
	display: grid;
	place-items: center;
	cursor: pointer;
	z-index: 1000;
	font-size: 24px;
	color: var(--secondary);
	font-weight: bold;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.help-icon::before {
	content: "";
	z-index: -1;
	width: 18px;
	height: 18px;
	background: currentColor;
	position: absolute;
	filter: blur(16px);
	box-shadow: 0 0 8px 4px currentColor;
	right: 25%;
	top: 25%;
}

.help-icon:hover {
	transform: scale(1.1);
	box-shadow: 0 0 24px rgba(0, 0, 0, 0.32);
}
`

// Inject styles
injectStyles(styles)

// Hotkey configuration - single source of truth
const HOTKEYS = [
	['t', 'Toggle theme', 'toggle-theme'],
	['s', 'Toggle spell check', 'toggle-spell'],
	['p', 'Toggle preview', 'toggle-preview'],
	['c', 'Copy to clipboard', 'copy-to-clipboard'],
	['f', 'Save to file', 'save-to-file'],
	['o', 'Open file', 'load-from-file'],
	['g', 'Open GitHub', 'github'],
]

// Help dialog creation
export const createHelpDialog = () => {
	const overlay = createElement('div', { className: 'help-overlay' })
	const dialog = createElement('div', { className: 'help-dialog' })
	const header = createElement('div', { className: 'help-header' })
	const title = createElement('h2', { className: 'help-title', textContent: 'Keyboard Shortcuts' })
	const closeBtn = createElement('button', { className: 'help-close', textContent: '×' })
	const shortcuts = createElement('div', { className: 'help-shortcuts' })

	// Build shortcuts list
	HOTKEYS.forEach(([key, desc]) => {
		const item = createElement('div', { className: 'help-item' })
		item.append(
			createElement('kbd', { className: 'help-key', textContent: key }),
			createElement('span', { className: 'help-desc', textContent: desc }),
		)
		shortcuts.appendChild(item)
	})

	header.append(title, closeBtn)
	dialog.append(header, shortcuts)
	overlay.appendChild(dialog)

	const show = () => {
		document.body.appendChild(overlay)
		requestAnimationFrame(() => {
			overlay.classList.add('visible')
			dialog.classList.add('visible')
		})
	}

	const hide = () => {
		overlay.classList.remove('visible')
		dialog.classList.remove('visible')
		setTimeout(() => overlay.remove(), 200)
	}

	createClickHandler(closeBtn, hide)
	overlay.addEventListener('click', e => e.target === overlay && hide())

	return { show, hide }
}

// Help icon creation
export const createHelpIcon = helpDialog => {
	const icon = createElement('iconify-icon', {
		icon: 'solar:question-square-bold-duotone',
		className: 'help-icon',
		title: 'Show keyboard shortcuts (?)',
		width: '36',
	})
	createClickHandler(icon, () => helpDialog.show())
	return icon
}

// Export hotkeys for use in hotkeys module
export { HOTKEYS }
