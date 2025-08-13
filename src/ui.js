// extracted from actions.js to a shorter, single-word module name
export const $ = sel => document.getElementById(sel)
export const el = (tag, attrs = {}) => Object.assign(document.createElement(tag), attrs)

const makeToast =
	toast =>
	(msg, ms = 1_200) => {
		toast.textContent = msg
		toast.hidden = false
		clearTimeout(window.__toastTimer)
		window.__toastTimer = setTimeout(() => {
			toast.hidden = true
		}, ms)
	}
const copySmart = async (text, notify) => {
	const fallback = () => {
		const ta = el('textarea', { value: text, style: 'position:fixed;opacity:0' })
		document.body.appendChild(ta)
		ta.select()
		const ok = document.execCommand('copy')
		notify(ok ? 'copied to clipboard' : 'copy failed')
		ta.remove()
	}
	if (!navigator.clipboard?.writeText) return fallback()
	return navigator.clipboard
		.writeText(text)
		.then(() => notify('copied to clipboard'))
		.catch(fallback)
}
const readClipboardSmart = async () =>
	!navigator.clipboard?.readText ? null : await navigator.clipboard.readText().catch(() => null)
const pasteOverlay = () =>
	new Promise(resolve => {
		const overlay = el('div')
		Object.assign(overlay.style, {
			position: 'fixed',
			inset: 0,
			display: 'grid',
			placeItems: 'center',
			background: 'var(--overlay)',
			zIndex: 1200,
		})
		const ta = el('textarea', { placeholder: 'Paste here (Cmd/Ctrl+V), Enter to apply' })
		Object.assign(ta.style, {
			width: '80vw',
			height: '40vh',
			borderRadius: '10px',
			border: 'none',
			background: 'var(--panel)',
			color: 'var(--fg)',
			padding: '10px',
			outline: 'none',
			boxShadow: 'var(--shadow-1)',
			backdropFilter: 'blur(6px)',
		})
		overlay.appendChild(ta)
		document.body.appendChild(overlay)
		ta.focus()
		const cleanup = () => overlay.remove()
		const commit = () => {
			const v = ta.value || ''
			cleanup()
			resolve(v)
		}
		ta.addEventListener('paste', () => setTimeout(commit))
		ta.addEventListener('keydown', e => {
			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !ta.value)) commit()
			if (e.key === 'Escape') {
				cleanup()
				resolve('')
			}
		})
		overlay.addEventListener('click', e => {
			if (e.target === overlay) {
				cleanup()
				resolve('')
			}
		})
	})
const openFileText = () =>
	new Promise(resolve => {
		const input = el('input', { type: 'file', accept: '.md,text/markdown,text/plain' })
		input.onchange = async () => {
			const file = input.files?.[0]
			resolve(file ? await file.text() : null)
		}
		input.click()
	})
const downloadText = (name, text) => {
	const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }))
	const a = el('a', { href: url, download: name })
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}

export const initUI = ({ getMarkdown, setMarkdown }) => {
	const [previewAside, previewHtml, split, wrap, toast, actions] = [
		'preview',
		'previewhtml',
		'split',
		'wrap',
		'toast',
		'actions',
	].map($)
	previewHtml.innerHTML = ''
	const showToast = makeToast(toast)

	const getPrefTheme = () =>
		localStorage.getItem('theme') ||
		(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
	const setThemeIcon = theme => {
		const btn = document.getElementById('toggle-theme')
		if (!btn) return
		const iconEl = btn.querySelector('iconify-icon')
		if (!iconEl) return
		const isLight = theme === 'light'
		iconEl.setAttribute(
			'icon',
			isLight
				? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
				: 'line-md:moon-filled-to-sunny-filled-loop-transition',
		)
	}
	const applyTheme = theme => {
		const isLight = theme === 'light'
		document.documentElement.classList.toggle('light', isLight)
		localStorage.setItem('theme', isLight ? 'light' : 'dark')
		setThemeIcon(theme)
	}
	applyTheme(getPrefTheme())
	const setRawOpen = open => {
		previewAside.hidden = !open
		split.hidden = !open
		wrap.style.gridTemplateColumns = open ? '1fr 10px minmax(280px, 40vw)' : '1fr 0px 0px'
	}

	const REPO = import.meta.env?.VITE_GITHUB || 'https://github.com/metaory/markon'

	const applySpell = (
		on = document.getElementById('toggle-spell')?.getAttribute('aria-pressed') === 'true',
	) => {
		const root = document.querySelector('.cm-content')
		if (!root) return
		root.setAttribute('spellcheck', on ? 'true' : 'false')
	}

	const buttons = [
		[
			'copy-to-clipboard',
			'copy',
			'solar:copy-bold-duotone',
			() => copySmart(getMarkdown(), showToast),
		],
		[
			'load-from-clipboard',
			'paste',
			'tabler:clipboard-text-filled',
			async () => {
				const text = (await readClipboardSmart()) ?? (await pasteOverlay())
				setMarkdown(text || '')
				showToast(text ? 'loaded from clipboard' : 'nothing pasted')
			},
		],
		[
			'save-to-file',
			'save',
			'ic:round-save',
			() => {
				downloadText('untitled.md', getMarkdown())
				showToast('saved as file')
			},
		],
		[
			'load-from-file',
			'load',
			'gravity-ui:folder-open-fill',
			async () => {
				const text = await openFileText()
				if (!text) return
				setMarkdown(text)
				showToast('loaded file')
			},
		],
		// [id, label, icon, handler(pressed?), isToggle, pressedDefault]
		[
			'toggle-spell',
			'spell',
			'tabler:text-spellcheck',
			pressed => {
				applySpell(pressed)
				showToast(pressed ? 'spell on' : 'spell off')
			},
			true,
			true,
		],
		[
			'toggle-theme',
			'',
			'tabler:moon-filled',
			pressed => {
				applyTheme(pressed ? 'light' : 'dark')
				showToast(pressed ? 'light' : 'dark')
			},
			true,
			getPrefTheme() === 'light',
		],
		[
			'github',
			'',
			'tabler:brand-github-filled',
			() => {
				window.open(REPO, '_blank', 'noopener,noreferrer')
			},
		],
		[
			'toggle-raw',
			'',
			'mynaui:panel-right-open-solid',
			pressed => setRawOpen(pressed),
			true,
			false,
		],
	]

	actions.innerHTML = ''
	for (const [id, label, icon, handler, isToggle, pressedDefault] of buttons) {
		const btn = el('button', { id, title: label })
		if (isToggle) {
			btn.classList.add('toggle')
			btn.setAttribute('aria-pressed', String(pressedDefault))
		}
		btn.appendChild(el('iconify-icon', { icon, width: '40' }))
		btn.appendChild(el('span', { textContent: label }))
		btn.addEventListener('click', e => {
			if (!isToggle) return handler?.(e)
			const next = btn.getAttribute('aria-pressed') !== 'true'
			btn.setAttribute('aria-pressed', String(next))
			return handler?.(next)
		})
		actions.appendChild(btn)
	}

	const editorRoot = document.getElementById('editor')
	if (editorRoot) {
		const mo = new MutationObserver(() => applySpell())
		mo.observe(editorRoot, { childList: true, subtree: true })
		requestAnimationFrame(() => applySpell())
	}

	const onDown = e => {
		const startX = e.clientX
		const startWidth = previewAside.getBoundingClientRect().width
		split.classList.add('active')
		const onMove = ev => {
			const dx = startX - ev.clientX
			const next = Math.min(Math.max(startWidth + dx, 200), window.innerWidth * 0.9)
			wrap.style.gridTemplateColumns = `1fr 10px ${next}px`
		}
		window.addEventListener('pointermove', onMove)
		window.addEventListener(
			'pointerup',
			() => {
				split.classList.remove('active')
				window.removeEventListener('pointermove', onMove)
			},
			{ once: true },
		)
	}
	split.addEventListener('pointerdown', onDown)

	setThemeIcon(getPrefTheme())

	return { previewHtml, showToast }
}
