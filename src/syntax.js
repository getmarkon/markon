import hljs from 'highlight.js/lib/core'
import darkHlCssUrl from 'highlight.js/styles/panda-syntax-dark.css?url'
import lightHlCssUrl from 'highlight.js/styles/panda-syntax-light.css?url'
import { aliasToModule, coreImporters, moduleToPackage } from './languages.js'

const moduleToImporter = coreImporters

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

export const observeTheme = () => {
	const html = document.documentElement
	const apply = () => setHlTheme(html.classList.contains('light') ? 'light' : 'dark')
	apply()
	new MutationObserver(apply).observe(html, { attributes: true, attributeFilter: ['class'] })
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

const unique = arr => [...new Set(arr)]

const registerLang = async modName => {
	if (!modName || hljs.getLanguage(modName)) return
	const pkg = moduleToPackage?.[modName]
	const importer = pkg ? () => import(/* @vite-ignore */ pkg) : moduleToImporter[modName]
	if (!importer) return

	const mod = await importer().catch(() => null)
	if (!mod) return

	const loader = mod?.default || mod?.[modName]
	if (typeof loader === 'function' && !hljs.getLanguage(modName)) {
		hljs.registerLanguage(modName, loader)
	}
}

export const highlightAll = async root => {
	const blocks = selectBlocks(root)
	if (!blocks.length) return

	const langs = unique(blocks.map(getLang).filter(Boolean))
	await Promise.all(langs.map(registerLang))

	for (const code of blocks) {
		const modName = getLang(code)
		if (modName) {
			const classesToRemove = Array.from(code.classList).filter(cls => cls.startsWith('language-'))
			for (const cls of classesToRemove) {
				code.classList.remove(cls)
			}
			code.classList.add(`language-${modName}`)
		}
		hljs.highlightElement(code)
	}
}
