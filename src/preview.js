import { marked } from 'marked'
import { highlightAll } from './syntax.js'
import { enhanceCallouts } from './callouts.js'

marked.setOptions({ gfm: true, breaks: true })


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
