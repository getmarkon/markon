import {
	applySpell,
	applyTheme,
	copySmart,
	createClickHandler,
	createElement,
	downloadText,
	injectStyles,
	openFileText,
} from './utils.js'

// Button component styles
const styles = `
button {
	all: unset;
	display: grid;
	grid-auto-flow: column;
	align-items: center;
	justify-content: center;
	padding: 2px 4px;
	border-radius: 14px;
	border: none;
	color: var(--accent);
	background: transparent;
	cursor: pointer;
	mix-blend-mode: screen;
	white-space: nowrap;
	min-width: 0;
	transition: all 0.2s ease;
	position: relative;
}

button::before {
	content: "";
	z-index: 1;
	width: 14px;
	height: 14px;
	background: currentColor;
	position: absolute;
	margin-left: 9px;
	filter: blur(8px);
	box-shadow: 0 0 20px 4px currentColor;
}

button span {
	display: none;
}

button:hover {
	color: var(--primary) !important;
	transform: scale(1.2);
}

button:active {
	transform: translateY(1px);
}

button iconify-icon {
	opacity: 0.9;
	mix-blend-mode: lighten;
}

button.toggle {
	color: var(--muted);
}

button.toggle[aria-pressed="true"] {
	color: var(--primary);
}

button#toggle-spell[aria-pressed="true"] {
	background: var(--accent-overlay);
	box-shadow: 0 0 24px rgba(0, 0, 0, 0.32);
}

button#copy-to-clipboard { color: #22bb11; }
button#load-from-clipboard { color: #ff9922; }
button#save-to-file { color: #ff4488; }
button#load-from-file { color: #bb44aa; }
button#toggle-spell { color: #00aa88; }
button#toggle-theme { color: #ffaa00; }
button#github { color: #1199cc; }
`

// Inject styles
injectStyles(styles)

// Button factory - more functional approach
const createButton = (config, showToast) => {
	const [id, label, icon, handler, isToggle, pressedDefault] = config

	const btn = createElement('button', {
		id,
		title: label,
		...(isToggle && { 'aria-pressed': String(pressedDefault) }),
		className: isToggle ? 'toggle' : '',
	})

	const iconEl = createElement('iconify-icon', { icon, width: '32' })
	btn.appendChild(iconEl)

	label && btn.appendChild(createElement('span', { textContent: label }))
	createClickHandler(btn, () => handler(btn, showToast))

	return btn
}

// Button configurations
const BUTTON_CONFIGS = [
	[
		'copy-to-clipboard',
		'Copy to clipboard',
		'solar:copy-bold-duotone',
		async (_btn, showToast) => {
			const text = await window.getMarkdown?.()
			if (text) await copySmart(text, showToast)
		},
	],
	[
		'load-from-clipboard',
		'Load from clipboard',
		'solar:clipboard-text-bold-duotone',
		async (_btn, showToast) => {
			const text = await window.readClipboardSmart?.()
			if (text) {
				window.setMarkdown?.(text)
				showToast('loaded from clipboard')
			} else showToast('clipboard empty')
		},
	],
	[
		'save-to-file',
		'Save to file',
		'solar:download-bold-duotone',
		async (_btn, showToast) => {
			const text = await window.getMarkdown?.()
			if (text) {
				const name = prompt('filename:', 'document.md') || 'document.md'
				downloadText(name, text)
				showToast('saved to file')
			}
		},
	],
	[
		'load-from-file',
		'Load from file',
		'solar:upload-bold-duotone',
		async (_btn, showToast) => {
			const text = await openFileText()
			if (text) {
				window.setMarkdown?.(text)
				showToast('loaded from file')
			}
		},
	],
	[
		'toggle-spell',
		'Toggle spell check',
		'solar:spell-check-bold-duotone',
		(btn, showToast) => {
			const pressed = btn.getAttribute('aria-pressed') === 'true'
			btn.setAttribute('aria-pressed', !pressed)
			applySpell(!pressed)
			showToast(pressed ? 'spell check off' : 'spell check on')
		},
		true,
		false,
	],
	[
		'toggle-theme',
		'Toggle theme',
		'solar:sun-bold-duotone',
		(_btn, showToast) => {
			const current = document.documentElement.classList.contains('light') ? 'light' : 'dark'
			const next = current === 'light' ? 'dark' : 'light'
			applyTheme(next)
			showToast(`theme: ${next}`)
		},
		true,
		false,
	],
	[
		'github',
		'GitHub',
		'solar:iconify-icon-bold-duotone',
		(_btn, _showToast) => {
			window.open('https://github.com/metaory/markon', '_blank')
		},
	],
]

// Create all buttons
export const createButtons = showToast => {
	const actions = document.getElementById('actions')
	BUTTON_CONFIGS.forEach(config => {
		const btn = createButton(config, showToast)
		actions.appendChild(btn)
	})
}
