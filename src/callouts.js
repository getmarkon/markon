import { createElement } from './utils.js'

export const enhanceCallouts = root => {
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
