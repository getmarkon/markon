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
const styles = /*css*/ `
button {
	all: unset;
	display: grid;
	grid-auto-flow: column;
	align-items: center;
	justify-content: center;
	padding: 2px 4px;
	opacity: 0.8;
	border-radius: 14px;
	border: none;
	color: var(--comment);
	background: transparent;
	cursor: pointer;
	mix-blend-mode: screen;
	white-space: nowrap;
	min-width: 0;
	transition: all 0.2s ease;
	position: relative;

	&::before {
		content: "";
		z-index: 1;
		width: 14px;
		height: 14px;
		background: currentColor;
		position: absolute;
		margin-left: 9px;
		filter: blur(8px) saturate(0.6);
	}

	span {
		display: none;
	}

	&:hover {
		transform: scale(1.2);
		opacity: 1;
	}

	&:active {
		transform: translateY(1px);
	}

	iconify-icon {
		opacity: 0.9;
		mix-blend-mode: lighten;
	}

	&.toggle {
		color: var(--muted);

		&[aria-pressed="true"] {
			color: var(--primary);
		}
	}

	&#toggle-spell[aria-pressed="true"] {
		background: var(--accent-alpha);
		box-shadow: var(--shadow-strong);
	}

	&#toggle-theme {
		color: var(--meta);

		iconify-icon {
			opacity: 1;
		}
	}

	&#copy-to-clipboard:hover { color: var(--success) !important; }
	&#load-from-clipboard:hover { color: var(--warning) !important; }
	&#save-to-file:hover { color: var(--error) !important; }
	&#load-from-file:hover { color: var(--hint) !important; }
	&#toggle-spell:hover { color: var(--string) !important; }
	&#toggle-theme:hover { color: var(--warning) !important; }
	&#github:hover { color: var(--info) !important; }
}
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

const iconStyle = 'bold'
// const iconStyle = 'outline'
// const iconStyle = 'broken'
// const iconStyle = 'linear'

// Button configurations
const BUTTON_CONFIGS = [
	[
		'copy-to-clipboard',
		'Copy to clipboard',
		`solar:copy-${iconStyle}`,
		async (_btn, showToast) => {
			const text = await window.getMarkdown?.()
			if (text) await copySmart(text, showToast)
		},
	],
	[
		'load-from-clipboard',
		'Load from clipboard',
		`solar:clipboard-text-${iconStyle}`,
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
		`solar:download-${iconStyle}`,
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
		`solar:upload-${iconStyle}`,
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
