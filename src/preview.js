import hljs from 'highlight.js/lib/core'
import lightHlCssUrl from 'highlight.js/styles/base16/gruvbox-light-medium.css?url'
import darkHlCssUrl from 'highlight.js/styles/paraiso-dark.css?url'
import { marked } from 'marked'
import { aliasToModule, coreImporters, moduleToPackage } from './hl.js'

const moduleToImporter = coreImporters
marked.setOptions({ gfm: true, breaks: true })

const ensureHlLink = () => {
	let link = document.getElementById('hljs-theme')
	if (!link) {
		link = document.createElement('link')
		link.id = 'hljs-theme'
		link.rel = 'stylesheet'
		document.head.appendChild(link)
	}
	return link
}
const setHlTheme = mode => {
	const link = ensureHlLink()
	const href = mode === 'light' ? lightHlCssUrl : darkHlCssUrl
	if (link.getAttribute('href') !== href) link.setAttribute('href', href)
}
const observeTheme = () => {
	const html = document.documentElement
	const apply = () => setHlTheme(html.classList.contains('light') ? 'light' : 'dark')
	apply()
	new MutationObserver(apply).observe(html, { attributes: true, attributeFilter: ['class'] })
}

const DEBUG_HL = false
const log = (...args) => {
	if (DEBUG_HL) console.debug('[hl]', ...args)
}
const selectBlocks = root => Array.from(root.querySelectorAll('pre code'))
const toKey = s => (s || '').toLowerCase().trim()
const normalize = s =>
	toKey(s)
		.replace('++', 'pp')
		.replace(/#/g, 'sharp')
		.replace(/[-_\s]/g, '')
const resolveModule = alias => {
	const k = normalize(alias)
	return aliasToModule?.[k] || (k === 'html' ? 'xml' : k)
}
const getLang = el =>
	resolveModule((Array.from(el.classList).find(c => c.startsWith('language-')) || '').replace('language-', ''))
const unique = arr => Array.from(new Set(arr))
const registerLang = async modName => {
	if (!modName || hljs.getLanguage(modName)) return
	const pkg = moduleToPackage?.[modName]
	const importer = pkg ? () => import(/* @vite-ignore */ pkg) : moduleToImporter[modName]
	if (!importer) {
		log('no importer for', modName, '(pkg:', pkg ?? 'core', ')')
		return
	}
	const mod = await importer().catch(err => {
		log('import failed for', modName, err)
		return null
	})
	if (!mod) return
	const loader = mod?.default || mod?.[modName]
	if (typeof loader === 'function' && !hljs.getLanguage(modName)) {
		hljs.registerLanguage(modName, loader)
		log('registered', modName)
	} else {
		log('invalid loader for', modName, loader)
	}
}
const highlightAll = root => {
	for (const code of selectBlocks(root)) {
		const modName = getLang(code)
		if (modName) {
			for (const cls of Array.from(code.classList)) if (cls.startsWith('language-')) code.classList.remove(cls)
			code.classList.add(`language-${modName}`)
		}
		hljs.highlightElement(code)
	}
}

// GitHub-style callouts inside blockquotes
const enhanceCallouts = root => {
	const kinds = ['note', 'tip', 'important', 'warning', 'caution']
	const rx = new RegExp(`^\\s*\\[!(${kinds.map(k => k.toUpperCase()).join('|')})\\]\\s*`, 'i')
	for (const bq of root.querySelectorAll('blockquote')) {
		const first = bq.firstElementChild
		if (!first || first.tagName !== 'P') continue
		const m = first.textContent.match(rx)
		if (!m) continue
		const kind = m[1].toLowerCase()
		if (!kinds.includes(kind)) continue
		first.textContent = first.textContent.replace(rx, '').trim()
		const wrapper = document.createElement('div')
		wrapper.className = 'callout'
		wrapper.dataset.kind = kind
		wrapper.dataset.title = kind.toUpperCase()
		while (bq.firstChild) wrapper.appendChild(bq.firstChild)
		bq.replaceWith(wrapper)
	}
}

export const setupPreview = ({ getMarkdown, onMarkdownUpdated, previewHtml }) => {
	observeTheme()

	let renderScheduled = false
	const render = async () => {
		const md = getMarkdown()
		previewHtml.innerHTML = marked.parse(md)
		enhanceCallouts(previewHtml)
		const blocks = selectBlocks(previewHtml)
		if (!blocks.length) return
		const langs = unique(blocks.map(getLang).filter(Boolean))
		log('langs found:', langs)
		await Promise.all(langs.map(registerLang))
		requestAnimationFrame(() => highlightAll(previewHtml))
	}
	const scheduleRender = () => {
		if (renderScheduled) return
		renderScheduled = true
		requestAnimationFrame(async () => {
			renderScheduled = false
			await render()
		})
	}
	// initial
	scheduleRender()
	onMarkdownUpdated(scheduleRender)
	return { renderNow: render }
}
