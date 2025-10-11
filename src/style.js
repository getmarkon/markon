import { defaultHighlightStyle, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// CodeMirror theme
const cmTheme = EditorView.theme({
	'&': { height: '100%' },
	'.cm-scroller': {
		fontFamily: 'Monaspace Argon, ui-monospace, monospace',
		background: 'var(--bg)',
	},
	'.cm-content': { caretColor: 'var(--accent)' },
	'.cm-gutters': { background: 'transparent', border: 'none' },
	'.cm-line': { color: 'var(--text)' },
	'.cm-selectionBackground': {
		background: 'var(--accent-alpha)',
	},
})

// Panda syntax groups for highlighting
const pandaGroups = [
	['var(--comment)', t.comment, t.blockComment, t.lineComment, t.docComment, t.quote],
	['var(--primary)', t.angleBracket],
	[
		'var(--fg)',
		t.name,
		t.punctuation,
		t.paren,
		t.standard,
		t.brace,
		t.bracket,
		t.annotation,
		t.compareOperator,
		t.arithmeticOperator,
	],
	[
		'var(--meta)',
		t.contentSeparator,
		t.deleted,
		t.documentMeta,
		t.color,
		t.meta,
		t.separator,
		t.null,
		t.macroName,
		t.atom,
	],
	[
		'var(--operator)',
		t.operator,
		t.derefOperator,
		t.invalid,
		t.tagName,
		t.updateOperator,
		t.namespace,
		t.typeOperator,
		t.definitionOperator,
		t.changed,
	],
	[
		'var(--keyword)',
		t.constant,
		t.keyword,
		t.self,
		t.moduleKeyword,
		t.function,
		t.controlOperator,
		t.operatorKeyword,
		t.definitionKeyword,
		t.logicOperator,
		t.bitwiseOperator,
	],
	['var(--regex)', t.controlKeyword, t.escape, t.special, t.monospace, t.squareBracket, t.list, t.regexp],
	[
		'var(--property)',
		t.name,
		t.typeName,
		t.variableName,
		t.function,
		t.definition,
		t.propertyName,
		t.unit,
		t.attributeName,
	],
	['var(--string)', t.string, t.docString, t.content, t.className, t.processingInstruction, t.character],
	[
		'var(--literal)',
		t.integer,
		t.literal,
		t.local,
		t.labelName,
		t.number,
		t.bool,
		t.inserted,
		t.float,
		t.attributeValue,
	],
]

// Functional approach to create highlight style
const createHighlightStyle = groups => groups.flatMap(([color, ...tags]) => tags.map(tag => ({ tag, color })))

// Markdown-specific styles
const sharedHeadings = {
	textShadow: '0 0 14px currentColor',
	fontWeight: 'bold',
}

const markdownStyles = [
	{ tag: [t.heading], color: 'var(--primary)', fontWeight: '800' },
	{ tag: [t.heading1], ...sharedHeadings, color: 'var(--string)' },
	{ tag: [t.heading2], ...sharedHeadings, color: 'var(--property)' },
	{ tag: [t.heading3], ...sharedHeadings, color: 'var(--operator)' },
	{ tag: [t.heading4], ...sharedHeadings, color: 'var(--literal)' },
	{ tag: [t.heading5], ...sharedHeadings, color: 'var(--keyword)' },
	{ tag: [t.heading6], ...sharedHeadings, color: 'var(--regex)' },
	{ tag: [t.strikethrough], color: 'var(--literal)', textDecoration: 'line-through' },
	{ tag: [t.strong], color: 'var(--meta)', fontWeight: '700' },
	{ tag: [t.emphasis], color: 'var(--operator)', fontStyle: 'italic' },
	{ tag: [t.link], color: 'var(--property)' },
	{ tag: [t.url], color: 'var(--string)', textDecoration: 'wavy' },
]

const pandaHighlight = HighlightStyle.define([...createHighlightStyle(pandaGroups), ...markdownStyles])

export const editorThemeExtensions = () => [
	cmTheme,
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	syntaxHighlighting(pandaHighlight),
]
