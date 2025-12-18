import {
	applySpell,
	applyTheme,
	copySmart,
	createClickHandler,
	createElement,
	downloadText,
	openFileText,
} from './utils.js'

// Check if PWA is installed (running in standalone mode)
const isPWAInstalled = () => {
	if (window.matchMedia('(display-mode: standalone)').matches) return true
	if (window.navigator.standalone) return true
	if (localStorage.getItem('pwa-installed') === 'true') return true
	return false
}

// Update PWA install button visibility
export const updatePWAInstallButton = () => {
	const btn = document.getElementById('install-pwa')
	if (!btn) return
	const isInstalled = isPWAInstalled()
	const shouldShow = window.deferredPrompt && !isInstalled
	btn.style.display = shouldShow ? 'flex' : 'none'
}

// Update both PWA UI elements
export const updatePWAUI = () => {
	updatePWAInstallButton()
	updatePWAInstallBanner()
}

// Shared PWA install handler
const handlePWAInstall = async showToast => {
	if (!window.deferredPrompt) {
		if (showToast) showToast('not available', 1200, 'tabler:alert-circle')
		return
	}
	window.deferredPrompt.prompt()
	const { outcome } = await window.deferredPrompt.userChoice
	window.deferredPrompt = null
	updatePWAUI()
	if (showToast) {
		const messages = {
			accepted: { text: 'installed!', icon: 'tabler:check' },
			dismissed: { text: 'cancelled', icon: 'tabler:x' },
		}
		const { text, icon } = messages[outcome] || messages.dismissed
		showToast(text, 1200, icon)
	}
	return outcome
}

// Create PWA install banner
const createPWAInstallBanner = () => {
	const banner = createElement('div', {
		id: 'pwa-install-banner',
		hidden: true,
	})

	const message = createElement('span', {
		textContent: 'Add Markon to your home screen for offline notes',
		style: 'flex: 1;',
	})

	const installBtn = createElement('button', {
		textContent: 'Install',
		style:
			'padding: 8px 16px; border-radius: 8px; border: none; background: var(--accent); color: var(--bg); font-weight: 500; cursor: pointer;',
	})

	const dismissBtn = createElement('button', {
		style:
			'padding: 8px; border: none; background: transparent; color: var(--text); cursor: pointer; display: flex; align-items: center;',
	})
	const dismissIcon = createElement('iconify-icon', {
		icon: 'solar:close-circle-bold-duotone',
		width: '36',
		height: '36',
	})
	dismissBtn.appendChild(dismissIcon)

	banner.appendChild(message)
	banner.appendChild(installBtn)
	banner.appendChild(dismissBtn)

	createClickHandler(installBtn, () => handlePWAInstall(window.showToast))

	createClickHandler(dismissBtn, () => {
		localStorage.setItem('pwa-banner-dismissed', 'true')
		updatePWAInstallBanner()
	})

	document.body.appendChild(banner)
	return banner
}

// Update PWA install banner visibility
export const updatePWAInstallBanner = () => {
	let banner = document.getElementById('pwa-install-banner')
	if (!banner) {
		banner = createPWAInstallBanner()
	}

	const isInstalled = isPWAInstalled()
	const isDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true'
	const shouldShow = window.deferredPrompt && !isInstalled && !isDismissed

	if (shouldShow) {
		banner.removeAttribute('hidden')
	} else {
		banner.setAttribute('hidden', '')
	}
}

// Unified actions configuration - single source of truth
const ACTIONS_CONFIG = [
	// Toolbar actions (ordered from left to right, so rightmost appears last)
	{
		id: 'save-to-file',
		label: 'Save',
		icon: 'tabler:device-floppy',
		hotkey: 'ctrl+s',
		gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
		showInToolbar: true,
		handler: async showToast => {
			const text = await window.getMarkdown?.()
			if (text) {
				const name = prompt('filename:', 'document.md') || 'document.md'
				downloadText(name, text)
				showToast('saved', 1200, 'tabler:check')
			}
		},
	},
	{
		id: 'load-from-file',
		label: 'Open',
		icon: 'tabler:folder-open',
		hotkey: 'ctrl+o',
		gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: true,
		handler: async showToast => {
			const text = await openFileText()
			if (text) {
				window.setMarkdown?.(text)
				showToast('opened', 1200, 'tabler:check')
			}
		},
	},
	{
		id: 'toggle-spell',
		label: 'Spell',
		icon: 'tabler:text-spellcheck',
		hotkey: 'ctrl+k',
		gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: false,
		handler: showToast => {
			const btn = document.getElementById('toggle-spell')
			const pressed = btn?.getAttribute('aria-pressed') === 'true'
			btn?.setAttribute('aria-pressed', String(!pressed))
			applySpell(!pressed)
			showToast(`spell: ${!pressed ? 'on' : 'off'}`, 1200, 'tabler:file-text')
		},
		isToggle: true,
	},
	{
		id: 'install-pwa',
		label: 'Install',
		icon: 'tabler:square-rounded-chevrons-down',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
		showInToolbar: true,
		handler: showToast => handlePWAInstall(showToast),
	},
	{
		id: 'settings',
		label: 'Settings',
		icon: 'tabler:settings-2',
		hotkey: 'ctrl+/',
		gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2))',
		showInToolbar: true,
		handler: showToast => {
			// This will be handled by the settings dialog creation
			document.getElementById('settings')?.click()
		},
	},
	{
		id: 'toggle-theme',
		label: 'Theme',
		icon: 'tabler:sun-electricity',
		hotkey: 'ctrl+m',
		gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
		showInToolbar: true,
		handler: async showToast => {
			const current = document.documentElement.getAttribute('data-mode') || 'dark'
			const next = current === 'light' ? 'dark' : 'light'
			const theme = document.documentElement.getAttribute('data-theme') || 'panda'
			await applyTheme(theme, next)
			showToast(`theme: ${next}`, 1200, 'tabler:palette')
		},
		isToggle: true,
	},
	// Settings-only actions
	{
		id: 'copy-to-clipboard',
		label: 'Copy',
		icon: 'tabler:copy',
		hotkey: 'ctrl+shift+c',
		gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
		showInToolbar: false,
		handler: async showToast => {
			const text = await window.getMarkdown?.()
			if (text) {
				await copySmart(text, showToast)
			}
		},
	},
	{
		id: 'load-from-clipboard',
		label: 'Paste',
		icon: 'tabler:clipboard-text-filled',
		hotkey: 'ctrl+shift+v',
		gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
		showInToolbar: false,
		handler: async showToast => {
			const text = await window.readClipboardSmart?.()
			if (text) {
				const lines = text.split('\n')
				const minLines = 5
				const paddingLines = lines.length < minLines ? 3 : 0
				const paddedText = paddingLines > 0 ? '\n'.repeat(paddingLines) + text : text
				window.setMarkdown?.(paddedText)
				showToast('pasted', 1200, 'tabler:clipboard-check')
			} else {
				showToast('clipboard empty', 1200, 'tabler:alert-circle')
			}
		},
	},
	{
		id: 'toggle-editor-sync',
		label: 'Sync',
		icon: 'tabler:arrow-autofit-height-filled',
		hotkey: 'ctrl+b',
		gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: false,
		handler: showToast => {
			const currentState = localStorage.getItem('editor-sync-enabled') === 'true'
			const enabled = !currentState
			localStorage.setItem('editor-sync-enabled', String(enabled))

			const btn = document.getElementById('toggle-editor-sync')
			if (btn) {
				btn.setAttribute('aria-pressed', String(enabled))
			}

			if (window.editorSync) {
				enabled ? window.editorSync.enable() : window.editorSync.disable()
			}
			showToast(`sync: ${enabled ? 'on' : 'off'}`, 1200, 'tabler:arrow-autofit-height-filled')
		},
		isToggle: true,
	},
	{
		id: 'toggle-profiler',
		label: 'Profiler',
		icon: 'tabler:gauge-filled',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: false,
		handler: showToast => {
			const profiler = window.__MARKON_PERF__
			if (profiler) {
				profiler.toggle()
				const isVisible = profiler.isVisible
				showToast(`profiler: ${isVisible ? 'on' : 'off'}`, 1200, 'tabler:gauge')
			}
		},
		isToggle: true,
	},
	{
		id: 'github',
		label: 'GitHub',
		icon: 'tabler:brand-github-filled',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2))',
		showInToolbar: false,
		handler: () => {
			window.open('https://github.com/getmarkon/markon', '_blank')
		},
	},
]

// Button factory - functional approach with popover
const createButton = (config, showToast) => {
	const { id, label, icon, handler, isToggle, hotkey } = config

	const btn = createElement('button', {
		id,
		...(isToggle && { 'aria-pressed': 'false' }),
		className: isToggle ? 'toggle' : '',
	})

	const iconEl = createElement('iconify-icon', { icon, width: '32' })
	btn.appendChild(iconEl)

	// Add popover span with label + hotkey (no title attribute)
	// For theme-mode and settings, show only hotkey
	const popoverText = id === 'toggle-theme' || id === 'settings' ? hotkey : hotkey ? `${label} • ${hotkey}` : label
	const span = createElement('span', { textContent: popoverText })
	btn.appendChild(span)

	createClickHandler(btn, () => handler(showToast))

	return btn
}

// Derive arrays for different uses
export const SETTINGS_ACTIONS = ACTIONS_CONFIG
export const HOTKEYS = ACTIONS_CONFIG.filter(a => a.hotkey)
	.map(a => [a.hotkey, a.label, a.id])
	.concat([['ctrl+p', 'Toggle preview', 'preview-toggle']])

// Create all buttons
export const createButtons = (showToast, settingsDialog) => {
	const actions = document.getElementById('actions')
	ACTIONS_CONFIG.filter(a => a.showInToolbar).forEach(config => {
		const btn = createButton(config, showToast)

		// Special handling for settings button
		if (config.id === 'settings') {
			createClickHandler(btn, () => settingsDialog.show())
		}

		actions.appendChild(btn)
	})

	// Initialize PWA UI (always check, even if installed)
	updatePWAUI()
}

// Export action handlers for reuse in settings
export const getActionHandlers = () => {
	const handlers = {}
	ACTIONS_CONFIG.forEach(config => {
		handlers[config.id] = config.handler
	})
	return handlers
}
