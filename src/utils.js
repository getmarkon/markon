export const $ = sel => document.getElementById(sel)
export const el = (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs)

const styles = `
#toast {
	position: fixed;
	bottom: 16px;
	left: 50%;
	color: var(--accent);
	transform: translateX(-50%);
	background: var(--bg-light);
	border: 1px solid var(--accent-alpha);
	padding: 12px 20px;
	border-radius: 14px;
	box-shadow: 0 4px 20px var(--accent-alpha);
	backdrop-filter: blur(10px);
	z-index: 1100;
	max-width: 90vw;
	white-space: nowrap;
	opacity: 0;
	transition: opacity 0.3s ease;
}

#toast:not([hidden]) {
	opacity: 1;
}

`

const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)


export const createToast =
	toast =>
	(msg, ms = 1_200) => {
		toast.textContent = msg
		toast.removeAttribute('hidden')
		clearTimeout(window.__toastTimer)
		window.__toastTimer = setTimeout(() => {
			toast.setAttribute('hidden', '')
		}, ms)
	}

export const copySmart = async (text, notify) => {
	const fallback = () => {
		const ta = el('textarea', {
			value: text,
			style: 'position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px;border:none;outline:none;resize:none;overflow:hidden;'
		})
		document.body.appendChild(ta)
		ta.focus()
		ta.select()
		const ok = document.execCommand('copy')
		notify(ok ? 'copied to clipboard' : 'copy failed')
		ta.remove()
	}

	return (
		navigator.clipboard
			?.writeText?.(text)
			?.then(() => notify('copied to clipboard'))
			?.catch(fallback) ?? fallback()
	)
}

export const readClipboardSmart = async () =>
	!navigator.clipboard?.readText ? null : await navigator.clipboard.readText().catch(() => null)

export const downloadText = (name, text) => {
	const extension = name.split('.').pop().toLowerCase()
	const mimeTypes = {
		css: 'text/css;charset=utf-8',
		js: 'text/javascript;charset=utf-8',
		html: 'text/html;charset=utf-8',
		md: 'text/markdown;charset=utf-8',
		json: 'application/json;charset=utf-8',
		txt: 'text/plain;charset=utf-8'
	}
	const mimeType = mimeTypes[extension] || 'text/plain;charset=utf-8'

	const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
	const a = el('a', { href: url, download: name })
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}

export const openFileText = () =>
	new Promise(resolve => {
		const input = el('input', { type: 'file', accept: '.md,text/markdown,text/plain' })
		input.onchange = async () => {
			const file = input.files?.[0]
			resolve(file ? await file.text() : null)
		}
		input.click()
	})

export const openFileCSS = () =>
	new Promise(resolve => {
		const input = el('input', { type: 'file', accept: '.css,text/css' })
		input.onchange = async () => {
			const file = input.files?.[0]
			resolve(file ? await file.text() : null)
		}
		input.click()
	})

export const saveCustomThemesCSS = (cssText) => {
	localStorage.setItem('custom-themes-css', cssText)
	injectCustomThemesCSS()
}

export const loadCustomThemesCSS = () => {
	return localStorage.getItem('custom-themes-css')
}

export const clearCustomThemesCSS = () => {
	localStorage.removeItem('custom-themes-css')
	removeCustomThemesCSS()
}

export const injectCustomThemesCSS = () => {
	const customCSS = loadCustomThemesCSS()
	if (!customCSS) return

	removeCustomThemesCSS()

	const style = document.createElement('style')
	style.id = 'custom-themes'
	style.textContent = customCSS
	document.head.appendChild(style)
}

export const removeCustomThemesCSS = () => {
	const existing = document.getElementById('custom-themes')
	if (existing) existing.remove()
}



export const extractThemesFromCSS = () => {
	const themesSheet = findThemesSheet()
	if (!themesSheet) return []

	const themeNames = extractThemeNames(themesSheet)
	return themeNames.map(name => ({ id: name, colors: getThemeColors(name) }))
		.filter(theme => theme.colors.length > 0)
}

const findThemesSheet = () =>
	Array.from(document.styleSheets).find(sheet =>
		sheet.href?.includes('themes.css') ||
		hasThemeRules(sheet))

const hasThemeRules = sheet => {
	try {
		return Array.from(sheet.cssRules).some(rule =>
			rule.selectorText?.includes('[data-theme="panda"]'))
	} catch {
		return false
	}
}

const extractThemeNames = sheet => {
	try {
		return [...new Set(Array.from(sheet.cssRules)
			.filter(rule => rule.selectorText?.includes('[data-theme='))
			.map(rule => rule.selectorText.match(/\[data-theme="([^"]+)"/)?.[1])
			.filter(Boolean))]
	} catch {
		return []
	}
}

const getThemeColors = themeName => {
	const themesSheet = findThemesSheet()
	if (!themesSheet) return []

	try {
		const themeRule = Array.from(themesSheet.cssRules)
			.find(rule => rule.selectorText?.includes(`[data-theme="${themeName}"][data-mode="dark"]`))

		if (!themeRule) return []

		return ['--brand', '--accent', '--primary', '--secondary']
			.map(varName => themeRule.style?.getPropertyValue(varName)?.trim())
			.filter(Boolean)
	} catch {
		return []
	}
}


export const getPrefTheme = () => {
	const theme = localStorage.getItem('theme-name') || 'panda'
	const mode = localStorage.getItem('theme-mode') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')

	if (!theme || theme === 'undefined') {
		localStorage.setItem('theme-name', 'panda')
		return { theme: 'panda', mode }
	}

	return { theme, mode }
}

const updateThemeColor = () => {
	const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
	const meta = document.querySelector('meta[name="theme-color"]')
	if (meta && brandColor) meta.setAttribute('content', brandColor)
}

export const applyTheme = async (themeName, mode) => {
	const validTheme = themeName && themeName !== 'undefined' ? themeName : 'panda'
	const validMode = mode && mode !== 'undefined' ? mode : 'dark'

	const html = document.documentElement
	html.setAttribute('data-theme', validTheme)
	html.setAttribute('data-mode', validMode)
	html.classList.toggle('light', validMode === 'light')
	localStorage.setItem('theme-name', validTheme)
	localStorage.setItem('theme-mode', validMode)

	const { setHlTheme } = await import('./syntax.js')
	setHlTheme(validMode)

	updateThemeColor()
}

export const applySpell = (on = document.querySelector('#toggle-spell')?.getAttribute('aria-pressed') === 'true') => {
	document.querySelector('.cm-content')?.setAttribute('spellcheck', String(on))
}


export const createElement = (tag, attributes = {}, children = []) => {
	const element = Object.assign(document.createElement(tag), attributes)
	children.forEach(child => {
		element.appendChild(child)
	})
	return element
}

export const createEventHandler = (element, event, handler, options = {}) => {
	element.addEventListener(event, handler, options)
	return () => element.removeEventListener(event, handler, options)
}

export const createClickHandler = (element, handler) => createEventHandler(element, 'click', handler)
export const createPointerHandler = (element, handler) => createEventHandler(element, 'pointerdown', handler)

