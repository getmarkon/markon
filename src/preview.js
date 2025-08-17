import { marked } from 'marked'
import { highlightAll } from './highlight.js'
import { createElement, injectStyles } from './utils.js'

// Preview component styles
const styles = `
#previewhtml {
	width: 100%;
	height: 100%;
	overflow: auto;
	overflow-x: hidden;
	border: 0;
	outline: none;
	padding: 16px;
	background: var(--surface-2);
	color: var(--text);
	font-family: system-ui, Helvetica, Arial, sans-serif;
	font-size: 15px;
	line-height: 1.5;
	box-sizing: border-box;
	word-wrap: break-word;
	overflow-wrap: break-word;
	min-width: 0;
	max-width: none;
}

#previewhtml h1, #previewhtml h2, #previewhtml h3, #previewhtml h4, #previewhtml h5, #previewhtml h6 {
	margin: 1.2em 0 0.4em;
}

#previewhtml p {
	margin: 0.6em 0;
}

#previewhtml ul, #previewhtml ol {
	margin: 0.6em 0 0.6em 1.2em;
}

#previewhtml blockquote {
	margin: 0.8em 0;
	padding-left: 1em;
	border-left: 3px solid var(--text-overlay);
	opacity: 0.9;
}

#previewhtml hr {
	border: none;
	height: 1px;
	background: var(--text-overlay);
	margin: 0.8em 0;
}

#previewhtml a {
	color: var(--accent);
	text-decoration: underline;
}

#previewhtml pre, #previewhtml code {
	background: var(--text-overlay);
	border-radius: 14px;
	font-family: "Monaspace Krypton", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

#previewhtml pre {
	padding: 0.8em;
	overflow: auto;
}

#previewhtml code {
	padding: 0 0.3em;
	border-radius: 6px;
}

#previewhtml kbd {
	display: inline-block;
	padding: 2px 6px;
	font: 600 0.86em / 1.2 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	color: var(--text);
	background: var(--text-overlay);
	border: 1px solid rgba(230, 230, 230, 0.25);
	border-bottom-color: rgba(230, 230, 230, 0.35);
	border-radius: 6px;
	box-shadow: 0 1px 0 rgba(230, 230, 230, 0.3), inset 0 -1px 0 var(--text-overlay);
	vertical-align: middle;
	white-space: nowrap;
}

#previewhtml kbd + kbd {
	margin-left: 4px;
}

#previewhtml table {
	width: 100%;
	border-collapse: collapse;
	margin: 0.8em 0;
	font-size: 0.95em;
}

#previewhtml th, #previewhtml td {
	border: 1px solid rgba(230, 230, 230, 0.18);
	padding: 6px 8px;
	text-align: left;
}

#previewhtml thead th {
	background: var(--text-overlay);
}

#previewhtml tbody tr:nth-child(even) {
	background: rgba(230, 230, 230, 0.06);
}

#previewhtml .callout {
	border-left: 5px solid var(--brand);
	background: var(--text-overlay);
	padding: 10px 12px;
	border-radius: 0 10px 10px 0px;
	margin: 0.8em 0;
}

#previewhtml .callout::before {
	content: attr(data-title);
	display: block;
	font-weight: 700;
	margin-bottom: 4px;
	color: var(--accent);
	letter-spacing: 0.5px;
}

#previewhtml .callout[data-kind="note"] { border-color: var(--accent); }
#previewhtml .callout[data-kind="tip"] { border-color: #00aa88; }
#previewhtml .callout[data-kind="important"] { border-color: #ff4488; }
#previewhtml .callout[data-kind="warning"] { border-color: #ffaa00; }
#previewhtml .callout[data-kind="caution"] { border-color: #ff5555; }
`

// Inject styles
injectStyles(styles)

marked.setOptions({ gfm: true, breaks: true })

const enhanceCallouts = root => {
	const kinds = ['note', 'tip', 'important', 'warning', 'caution']
	const rx = new RegExp(`^\\s*\\[!(${kinds.map(k => k.toUpperCase()).join('|')})\\]\\s*`, 'i')

	Array.from(root.querySelectorAll('blockquote')).forEach(bq => {
		const first = bq.firstElementChild
		if (!first || first.tagName !== 'P') return

		const m = first.textContent.match(rx)
		if (!m) return

		const kind = m[1].toLowerCase()
		if (!kinds.includes(kind)) return

		first.textContent = first.textContent.replace(rx, '').trim()
		const wrapper = createElement('div', {
			className: 'callout',
		})
		wrapper.setAttribute('data-kind', kind)
		wrapper.setAttribute('data-title', kind.toUpperCase())

		while (bq.firstChild) wrapper.appendChild(bq.firstChild)
		bq.replaceWith(wrapper)
	})
}

export const setupPreview = ({ getMarkdown, onMarkdownUpdated, previewHtml }) => {
	let renderScheduled = false

	const render = async () => {
		const md = getMarkdown()
		previewHtml.innerHTML = marked.parse(md)
		enhanceCallouts(previewHtml)
		await highlightAll(previewHtml)
	}

	const scheduleRender = () => {
		if (renderScheduled) return
		renderScheduled = true
		requestAnimationFrame(async () => {
			renderScheduled = false
			await render()
		})
	}

	// Initial render
	scheduleRender()
	onMarkdownUpdated(scheduleRender)
}
