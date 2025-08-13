import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
const hlStyle = HighlightStyle.define([
    t.heading1 && { tag: t.heading1, color: 'var(--primary)', fontWeight: '800' },
    t.heading2 && { tag: t.heading2, color: 'var(--primary)', fontWeight: '700' },
    t.heading3 && { tag: t.heading3, color: 'var(--primary)', fontWeight: '600' },
    t.strong && { tag: t.strong, color: 'var(--primary)', fontWeight: '700' },
    t.emphasis && { tag: t.emphasis, color: 'var(--secondary)', fontStyle: 'italic' },
    t.link && { tag: t.link, color: 'var(--accent)', textDecoration: 'underline' },
    t.code && { tag: t.code, color: 'var(--text)', backgroundColor: 'color-mix(in oklab, var(--text) 12%, transparent)' },
    t.quote && { tag: t.quote, color: 'var(--muted)' },
].filter(Boolean))

const themeExtension = () => EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { fontFamily: 'Monaspace Argon, ui-monospace, monospace', background: 'var(--surface-0)' },
        '.cm-content': { caretColor: 'var(--accent)' },
        '.cm-gutters': { background: 'transparent', border: 'none' },
        '.cm-line': { color: 'var(--text)' },
        '.cm-selectionBackground': { background: 'color-mix(in oklab, var(--accent) 25%, transparent)' },
})

export const createEditor = async () => {
	let view = null
	const subscribers = []

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
					markdown({ codeLanguages: languages }),
				keymap.of([indentWithTab, ...defaultKeymap]),
				EditorView.lineWrapping,
				EditorView.updateListener.of(v => { if (v.docChanged) notify() }),
				themeExtension(),
				syntaxHighlighting(hlStyle),
			],
		})
		view = new EditorView({ state, parent: document.querySelector('#editor') })
		mountIfNeeded()
	}

	make('# hello\n\nType here...')

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
