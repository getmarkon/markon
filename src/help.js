import { createClickHandler, createElement, injectStyles } from './utils.js'

// Help component styles
const styles = /* css */`
.help-overlay {
	position: fixed;
	inset: 0;
	display: grid;
	place-items: center;
	background: var(--bg-alpha);
	backdrop-filter: blur(10px);
	z-index: 1300;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.help-overlay.visible {
	opacity: 1;
}

.help-dialog {
	background: var(--bg-light);
	border-radius: var(--radius);
	padding: 32px;
	max-width: 600px;
	width: 90vw;
	box-shadow: var(--shadow-strong);
	backdrop-filter: blur(10px);
	transform: scale(0.9);
	transition: transform 0.3s ease;
	border: 1px solid var(--text-alpha);
}

.help-dialog.visible {
	transform: scale(1);
}

.help-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
}

.help-title {
	margin: 0;
	color: var(--brand);
	font-size: 24px;
	font-weight: 700;
	font-family: "Monaspace Krypton", system-ui, Helvetica, Arial, sans-serif;
}

.help-close {
	background: var(--text-alpha);
	border: none;
	color: var(--comment);
	cursor: pointer;
	padding: 8px;
	border-radius: 50%;
	font-size: 20px;
	width: 36px;
	height: 36px;
	display: grid;
	place-items: center;
	transition: all 0.2s ease;

	&:hover {
		background: var(--accent-alpha);
		color: var(--accent);
		transform: scale(1.1);
	}
}

.help-shortcuts {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 12px;
	align-items: center;
}

.help-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 20px;
	background: var(--bg-alpha);
	border-radius: 16px;
	transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
	width: 100%;
	box-sizing: border-box;

	&:hover {
		background: var(--accent-alpha);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px var(--accent-alpha);
	}
}

.help-key {
	background: var(--primary);
	border: none;
	border-radius: 12px;
	padding: 8px 12px;
	font-size: 14px;
	font-family: "Monaspace Krypton", ui-monospace, monospace;
	color: var(--bg);
	font-weight: 600;
	min-width: 32px;
	text-align: center;
	box-shadow: 0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent);
}

.help-desc {
	color: var(--text);
	font-size: 16px;
	font-weight: 500;
	font-family: "Monaspace Krypton", system-ui, Helvetica, Arial, sans-serif;
}

.help-footer {
	text-align: center;
	margin-top: 24px;
	padding-top: 20px;
	border-top: 1px solid var(--text-alpha);
	color: var(--comment);
	font-size: 14px;
	font-weight: 500;
	font-family: "Monaspace Krypton", system-ui, Helvetica, Arial, sans-serif;

	.heart {
		display: inline-block;
		background: linear-gradient(45deg, #ff4488, #4488ff, #ffdd44, #44ffdd, #ff4488);
		background-size: 300% 300%;
		animation: gradientShift 2s ease-in-out infinite;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		font-size: 18px;
		font-weight: bold;
	}

	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		25% { background-position: 100% 0%; }
		50% { background-position: 100% 100%; }
		75% { background-position: 0% 100%; }
		100% { background-position: 0% 50%; }
	}

	a {
		color: var(--secondary);
		text-decoration: none;
		transition: color 0.2s ease;

		&:hover {
			color: var(--brand);
		}
	}
}

.help-icon {
	opacity: 0.3;
	position: fixed;
	bottom: 24px;
	right: 24px;
	border-radius: 50%;
	display: grid;
	place-items: center;
	cursor: pointer;
	z-index: 1000;
	font-size: 28px;
	color: var(--secondary);
	font-weight: bold;
	transition: all 0.3s ease;
	width: 48px;
	height: 48px;
	background: var(--text-alpha);
	backdrop-filter: blur(10px);

	&::before {
		content: "";
		z-index: -1;
		width: 20px;
		height: 20px;
		background: currentColor;
		position: absolute;
		filter: blur(12px);
		box-shadow: 0 0 12px currentColor;
	}

	&:hover {
		opacity: 0.8;
		transform: scale(1.1);
		background: var(--accent-alpha);
		color: var(--accent);
	}
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
]

// Help dialog creation
export const createHelpDialog = () => {
	const overlay = createElement('div', { className: 'help-overlay' })
	const dialog = createElement('div', { className: 'help-dialog' })
	const header = createElement('div', { className: 'help-header' })
	const title = createElement('h2', { className: 'help-title', textContent: 'Keyboard Shortcuts' })
	const closeBtn = createElement('button', { className: 'help-close', textContent: '×' })
	const shortcuts = createElement('div', { className: 'help-shortcuts' })
	const footer = createElement('div', { className: 'help-footer' })
	const heart = createElement('span', { className: 'heart', textContent: '❤️' })
	const text1 = document.createTextNode('Made with ')
	const text2 = document.createTextNode(' by ')
	const githubProfileLink = createElement('a', {
		href: 'https://github.com/metaory',
		target: '_blank',
		textContent: 'github.metaory'
	})
	const text3 = document.createTextNode('/')
	const githubRepoLink = createElement('a', {
		href: 'https://github.com/metaory/markon',
		target: '_blank',
		textContent: 'markon'
	})
	footer.append(text1, heart, text2, githubProfileLink, text3, githubRepoLink)

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
	dialog.append(header, shortcuts, footer)
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
