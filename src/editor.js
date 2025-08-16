import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import sampleMd from './sample.md?raw'
import { editorThemeExtensions } from './theme.js'

const readDefaultMarkdown = async () => sampleMd || '# markon\n\nStart typing...'

export const createEditor = async () => {
	let view = null
	const subscribers = []
	let baseline = sampleMd || ''

	const mountIfNeeded = () => {
		const html = document.documentElement
		if (!html.classList.contains('ready')) html.classList.add('ready')
		const bar = document.getElementById('bar')
		const wrap = document.getElementById('wrap')
		if (bar) bar.hidden = false
		if (wrap) wrap.hidden = false
	}

	const notify = () => {
		if (!subscribers.length) return
		const value = view.state.doc.toString()
		for (const fn of subscribers) fn(value)
	}

	const make = defaultValue => {
		view?.destroy?.()
		const state = EditorState.create({
			doc: defaultValue,
			extensions: [
				markdown({ base: markdownLanguage, codeLanguages: languages }),
				keymap.of([indentWithTab, ...defaultKeymap]),
				EditorView.lineWrapping,
				EditorView.updateListener.of(v => {
					if (v.docChanged) notify()
				}),
				...editorThemeExtensions(),
			],
		})
		view = new EditorView({ state, parent: document.querySelector('#editor') })
		mountIfNeeded()
	}

	make(await readDefaultMarkdown())
	baseline = sampleMd || ''

	if (import.meta.hot) {
		import.meta.hot.accept('./sample.md?raw', mod => {
			const next = mod?.default || ''
			if (view.state.doc.toString() === baseline) setMarkdown(next)
			baseline = next
		})
	}

	const getMarkdown = () => view.state.doc.toString()
	const setMarkdown = markdown => {
		const doc = markdown ?? ''
		const tr = view.state.update({ changes: { from: 0, to: view.state.doc.length, insert: doc } })
		view.update([tr])
		notify()
	}
	const onMarkdownUpdated = fn => subscribers.push(fn)

	// No remount needed on theme change; CSS variables drive colors

	return { getMarkdown, setMarkdown, onMarkdownUpdated }
}
