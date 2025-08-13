import '@fontsource/bungee'
import '@fontsource/monaspace-argon'
import '@fontsource/monaspace-argon/400-italic.css'
import '@fontsource/monaspace-argon/700.css'
import '@fontsource/monaspace-krypton'
import '@fontsource/monaspace-krypton/400-italic.css'
import '@fontsource/monaspace-krypton/700.css'
import 'iconify-icon'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-dark.css'
import { marked } from 'marked'
import { createEditor } from './editor.js'
import { aliasToModule, coreImporters, moduleToPackage } from './hl.js'
import { initUI } from './ui.js'
import './style.css'
// Pre-resolve hljs language modules so Vite transforms them (avoids runtime bare specifier issues)
// IMPORTANT: use the dependency specifier path, not a relative node_modules path
const moduleToImporter = coreImporters

marked.setOptions({ gfm: true, breaks: true })

// show app version (from Vite define) in bottom-right
const showVersion = () => {
	const v = import.meta.env?.VERSION
	if (!v) return
	let el = document.getElementById('ver')
	if (!el) {
		el = document.createElement('div')
		el.id = 'ver'
		document.body.appendChild(el)
	}
	el.textContent = `v${v}`
}
showVersion()

const { getMarkdown, setMarkdown, onMarkdownUpdated } = await createEditor()
const { previewHtml } = initUI({ getMarkdown, setMarkdown })

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
	resolveModule(
		(Array.from(el.classList).find(c => c.startsWith('language-')) || '').replace('language-', ''),
	)
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
			for (const cls of Array.from(code.classList))
				if (cls.startsWith('language-')) code.classList.remove(cls)
			code.classList.add(`language-${modName}`)
		}
		hljs.highlightElement(code)
	}
}

let renderScheduled = false
const render = async () => {
	const md = getMarkdown()
	previewHtml.innerHTML = marked.parse(md)
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

scheduleRender()
onMarkdownUpdated(scheduleRender)
