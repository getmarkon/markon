import { Crepe } from '@milkdown/crepe'
import { InputRule, inputRules } from '@milkdown/prose/inputrules'
import { $prose } from '@milkdown/utils'
import '@milkdown/crepe/theme/common/style.css'

export const createEditor = async () => {
    let instance = null
    const subscribers = []

    const mountIfNeeded = () => {
        const html = document.documentElement
        if (!html.classList.contains('ready')) html.classList.add('ready')
        const bar = document.getElementById('bar')
        const wrap = document.getElementById('wrap')
        if (bar) bar.hidden = false
        if (wrap) wrap.hidden = false
    }

    const wireSubscribers = () => {
        if (!subscribers.length) return
        instance.on(l => {
            for (const fn of subscribers) l.markdownUpdated(fn)
        })
    }

	const make = async defaultValue => {
		instance?.destroy?.()
		instance = new Crepe({
			root: '#editor',
			defaultValue,
			features: { [Crepe.Feature.ListItem]: true, [Crepe.Feature.Toolbar]: true },
			featureConfigs: { [Crepe.Feature.LinkTooltip]: { inputPlaceholder: 'Enter URL...' } },
		})
		// link [text](url) input rule
		const linkRule = new InputRule(/\[([^\]]+)\]\(([^)\s]+)\)$/, (state, match, start, end) => {
			const [, label, href] = match
			if (!label || !href) return null
			const { schema, tr } = state
			const link = schema.marks.link
			if (!link) return null
			const node = schema.text(label, [link.create({ href })])
			return tr.replaceWith(start, end, node)
		})
		const linkInputRulePlugin = $prose(() => inputRules({ rules: [linkRule] }))
		instance.editor.use(linkInputRulePlugin)
		await instance.create()
		mountIfNeeded()
		wireSubscribers()

		// open links in new tab and prevent edit-time navigation
        const root = document.querySelector('#editor')
        root?.addEventListener('click', e => {
            const a = e.target?.closest?.('a')
            const href = a?.getAttribute?.('href')
            if (!href) return
            if (e.metaKey || e.ctrlKey) {
                e.preventDefault()
                window.open(href, '_blank', 'noopener,noreferrer')
            }
        })
	}

	await make('# hello\n\nType here...')

	const getMarkdown = () => instance.getMarkdown()
    const setMarkdown = async markdown => {
        await make(markdown ?? '')
    }
	const onMarkdownUpdated = fn => {
		subscribers.push(fn)
		instance.on(l => l.markdownUpdated(fn))
	}

    return { getMarkdown, setMarkdown, onMarkdownUpdated }
}
