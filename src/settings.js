import { createClickHandler, createElement, applyTheme, getPrefTheme, extractThemesFromCSS, saveCustomThemesCSS, clearCustomThemesCSS, openFileCSS, downloadText, copySmart, openFileText } from './utils.js'
import { getActionHandlers, SETTINGS_ACTIONS, HOTKEYS } from './actions.js'
import pkg from '../package.json'
import './settings.css'



export const createSettingsDialog = (showToast) => {
	const dialog = createElement('dialog', {
		id: 'settings-system',
		className: 'settings-dialog',
		closedby: 'any' // Allow dismissal by backdrop click, ESC key, or close button
	})

	const closeBtn = createElement('button', { className: 'settings-close' })
	closeBtn.innerHTML = '<iconify-icon width="32" height="32" icon="tabler:circle-x-filled"></iconify-icon>'

	const content = createElement('div', { className: 'settings-content' })

	const themesSection = createThemesSection()
	const actionsSection = createActionsSection(showToast)

	content.append(themesSection, actionsSection)

	const footer = createElement('div', { className: 'settings-footer' })
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
	const text4 = document.createTextNode(' · ')
	const version = createElement('kbd', {
		textContent: `v${pkg.version}`,
		className: 'settings-version'
	})

	// Line break
	const br = createElement('br')

	// Footer - line 2: Issues link
	const issuesIcon = createElement('iconify-icon', {
		icon: 'tabler:brand-github',
		width: '16',
		style: 'vertical-align: middle; margin-right: 4px;'
	})
	const issuesLink = createElement('a', {
		href: 'https://github.com/metaory/markon/issues/new/choose',
		target: '_blank',
		textContent: 'Submit issues or feature requests',
		style: 'display: inline-flex; align-items: center; margin-top: 8px; color: var(--accent);'
	})
	issuesLink.prepend(issuesIcon)

	footer.append(text1, heart, text2, githubProfileLink, text3, githubRepoLink, text4, version, br, issuesLink)

	dialog.append(closeBtn, content, footer)

	const show = () => {
		// Only append if not already in DOM
		if (!dialog.parentNode) {
			document.body.appendChild(dialog)
		}
		dialog.showModal()
		// Highlight current theme after dialog is shown
		const themeGrid = dialog.querySelector('.settings-theme-grid')
		if (themeGrid) highlightCurrentTheme(themeGrid)

	}

	const hide = () => {
		dialog.close()
		dialog.remove()
	}

	createClickHandler(closeBtn, hide)

	// Fallback for backdrop click (in case closedby attribute isn't fully supported)
	dialog.addEventListener('click', e => {
		if (e.target === dialog) {
			hide()
		}
	})

	return { show, hide }
}


// Create unified actions and shortcuts section
const createActionsSection = (showToast) => {
	const section = createElement('div', { className: 'settings-section' })

	const actionsGrid = createElement('div', {
		className: 'settings-shortcuts'
	})

	SETTINGS_ACTIONS
		.filter(action => action.id !== 'install-pwa' && action.id !== 'github')
		.forEach(({ id, label, icon, hotkey, gradient, handler }) => {
		const item = createElement('div', { className: 'settings-item' })

		// Label
		const labelSpan = createElement('span', {
			textContent: label,
			style: 'font-weight: 500;'
		})

		// Button
		const btn = createElement('button', {
			className: 'settings-theme-control-btn',
			id,
			style: `background: ${gradient}; border: none; min-width: 80px;${id === 'install-pwa' ? ' display: none;' : ''}`
		})
		const btnIcon = createElement('iconify-icon', { icon, width: '32', height: '32' })
		const btnText = createElement('span', {
			textContent: id === 'github' ? 'Open'
				: id.includes('toggle') || id.includes('profiler') ? 'Toggle'
				: id.includes('save') ? 'Save'
				: id.includes('load') ? 'Load'
				: 'Run'
		})
		btn.append(btnIcon, btnText)
		createClickHandler(btn, () => handler(showToast))

		// Hotkey badge (only show if hotkey exists)
		if (hotkey) {
			const hotkeyKbd = createElement('kbd', {
				className: 'settings-key',
				textContent: hotkey
			})
			item.append(labelSpan, btn, hotkeyKbd)
		} else {
			item.append(labelSpan, btn)
		}

		actionsGrid.appendChild(item)
	})

	section.append(actionsGrid)
	return section
}


// Create themes section
const createThemesSection = () => {
	const section = createElement('div', { className: 'settings-section' })

	// Theme grid
	const themeGrid = createElement('div', { className: 'settings-theme-grid' })

	// Get themes dynamically from CSS
	const themes = extractThemesFromCSS()

	themes.forEach(theme => {
		const themeCard = createElement('div', {
			className: `settings-theme-card theme-${theme.id}`,
			'data-theme': theme.id
		})

		const themeName = createElement('div', { className: 'settings-theme-name', textContent: theme.id })

		// Color preview
		const colorPreview = createElement('div', { className: 'settings-theme-preview' })
		theme.colors.forEach(color => {
			const colorDot = createElement('div', {
				className: 'settings-theme-color',
				style: `background-color: ${color}`
			})
			colorPreview.appendChild(colorDot)
		})

		themeCard.append(themeName, colorPreview)

		// Add click handler for theme selection
		themeCard.addEventListener('click', async () => {
			const currentMode = getPrefTheme().mode
			await applyTheme(theme.id, currentMode)
			highlightCurrentTheme(themeGrid)
		})

		themeGrid.appendChild(themeCard)
	})

	// Download card
	const downloadCard = createElement('div', { className: 'settings-theme-card' })
	const downloadBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		title: 'Download themes.css'
	})
	const downloadIcon = createElement('iconify-icon', {
		icon: 'tabler:download',
		width: '16',
		height: '16'
	})
	const downloadText = createElement('span', { textContent: 'Download' })
	downloadBtn.append(downloadIcon, downloadText)
	downloadCard.appendChild(downloadBtn)

	// Upload card
	const uploadCard = createElement('div', { className: 'settings-theme-card' })
	const uploadBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		title: 'Upload themes.css'
	})
	const uploadIcon = createElement('iconify-icon', {
		icon: 'tabler:upload',
		width: '16',
		height: '16'
	})
	const uploadText = createElement('span', { textContent: 'Upload' })
	uploadBtn.append(uploadIcon, uploadText)
	uploadCard.appendChild(uploadBtn)

	// Reset card
	const resetCard = createElement('div', { className: 'settings-theme-card' })
	const resetBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		textContent: 'Reset',
		title: 'Reset to built-in themes'
	})
	resetCard.appendChild(resetBtn)

	// Event handlers
	downloadBtn.addEventListener('click', async () => {
		const { downloadText } = await import('./utils.js')

		// Fetch the original themes.css file directly from GitHub
		const response = await fetch('https://raw.githubusercontent.com/metaory/markon/refs/heads/master/src/themes.css')
		const cssToDownload = await response.text()
		downloadText('themes.css', cssToDownload)
	})

	uploadBtn.addEventListener('click', async () => {
		const cssText = await openFileCSS()
		if (cssText) {
			saveCustomThemesCSS(cssText)
			// Refresh the settings dialog to show new themes
			location.reload()
		}
	})

	resetBtn.addEventListener('click', () => {
		clearCustomThemesCSS()
		location.reload()
	})

	// TODO: temporary disable
	// themeGrid.append(downloadCard, uploadCard, resetCard)

	section.append(themeGrid)
	return section
}

// Highlight current theme in settings dialog
const highlightCurrentTheme = (themeGrid) => {
	const currentTheme = document.documentElement.getAttribute('data-theme')

	// Clear all selections and highlight current
	themeGrid.querySelectorAll('.settings-theme-card').forEach(card => {
		card.classList.toggle('selected', card.classList.contains(`theme-${currentTheme}`))
	})
}



// Export hotkeys for use in hotkeys module
export { HOTKEYS }
