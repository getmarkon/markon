import { defaultHighlightStyle, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const cmTheme = EditorView.theme({
	'&': { height: '100%' },
	'.cm-scroller': {
		fontFamily: 'Monaspace Argon, ui-monospace, monospace',
		background: 'var(--surface-0)',
	},
	'.cm-content': { caretColor: 'var(--accent)' },
	'.cm-gutters': { background: 'transparent', border: 'none' },
	'.cm-line': { color: 'var(--text)' },
	'.cm-selectionBackground': {
		background: 'color-mix(in oklab, var(--accent) 25%, transparent)',
	},
})

// Comprehensive Lezer tag styling using Base16-like CSS vars
// 00..07: shades, 08..0F: accent hues
const TT = (...xs) => xs.filter(Boolean)
const cmHighlight = HighlightStyle.define([
	// comments & meta
	{ tag: TT(t.comment, t.blockComment, t.lineComment, t.docComment), color: 'var(--base03)', fontStyle: 'italic' },
	{ tag: TT(t.meta, t.processingInstruction), color: 'var(--base04)' },

	// invalid / errors
	{ tag: TT(t.invalid), color: 'var(--base08)', textDecoration: 'wavy underline 1px var(--base08)' },

	// keywords
	{
		tag: TT(t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword, t.moduleKeyword),
		color: 'var(--base08)',
		fontWeight: '700',
	},
	{ tag: TT(t.special(t.keyword)), color: 'var(--base0E)' },

	// operators & punctuation
	{
		tag: TT(
			t.operator,
			t.compareOperator,
			t.arithmeticOperator,
			t.logicOperator,
			t.bitwiseOperator,
			t.updateOperator,
			t.definitionOperator,
			t.typeOperator,
			t.controlOperator,
			t.derefOperator,
		),
		color: 'var(--base05)',
	},
	{ tag: TT(t.punctuation, t.separator), color: 'var(--base04)' },
	{ tag: TT(t.bracket, t.brace, t.squareBracket, t.paren, t.angleBracket), color: 'var(--base04)' },

	// literals
	{ tag: TT(t.literal), color: 'var(--base0B)' },
	{ tag: TT(t.null, t.bool), color: 'var(--base09)', fontWeight: '600' },
	{ tag: TT(t.number, t.integer, t.float), color: 'var(--base09)' },
	{ tag: TT(t.string, t.special(t.string), t.character, t.docString, t.attributeValue), color: 'var(--base0B)' },
	{ tag: TT(t.regexp, t.escape), color: 'var(--base0E)' },
	{ tag: TT(t.color, t.url), color: 'var(--base0C)' },

	// identifiers
	{ tag: TT(t.name), color: 'var(--base05)' },
	{ tag: TT(t.variableName), color: 'var(--base05)' },
	{ tag: TT(t.definition(t.variableName)), color: 'var(--base05)', fontWeight: '600' },
	{ tag: TT(t.definition), color: 'var(--base05)', fontWeight: '600' },
	{ tag: TT(t.propertyName, t.attributeName), color: 'var(--base0A)' },
	{ tag: TT(t.className), color: 'var(--base0A)', fontWeight: '600' },
	{ tag: TT(t.typeName, t.typeOperator), color: 'var(--base0C)' },
	{ tag: TT(t.namespace, t.labelName), color: 'var(--base0C)' },
	{ tag: TT(t.macroName), color: 'var(--base0E)', fontWeight: '600' },
	{ tag: TT(t.constant), color: 'var(--base09)', fontWeight: '600' },
	{ tag: TT(t.self), color: 'var(--base08)', fontWeight: '700' },
	{ tag: TT(t.tagName), color: 'var(--base0D)', fontWeight: '600' },

	// functions
	{
		tag: TT(
			t.function(t.variableName),
			t.function(t.propertyName),
			t.function(t.definition(t.variableName)),
			t.function(t.name),
		),
		color: 'var(--base0D)',
		fontWeight: '600',
	},
	{ tag: TT(t.special(t.variableName)), color: 'var(--base0E)' },
	{ tag: TT(t.local(t.variableName)), textDecoration: 'underline 1px dotted var(--base04)' },
	{ tag: TT(t.standard(t.variableName)), color: 'var(--base05)' },

	// markdown-ish
	{
		tag: TT(t.heading, t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6),
		color: 'var(--primary)',
		fontWeight: '800',
	},
	{ tag: TT(t.strong), color: 'var(--primary)', fontWeight: '700' },
	{ tag: TT(t.emphasis), color: 'var(--secondary)', fontStyle: 'italic' },
	{ tag: TT(t.link), color: 'var(--accent)', textDecoration: 'underline' },
	{ tag: TT(t.quote), color: 'var(--muted)' },
	{ tag: TT(t.list, t.listMark), color: 'var(--base0A)' },
	{
		tag: TT(t.code, t.monospace),
		color: 'var(--text)',
		backgroundColor: 'color-mix(in oklab, var(--text) 12%, transparent)',
	},
	{ tag: TT(t.content), color: 'var(--base05)' },
	{ tag: TT(t.contentSeparator), color: 'var(--base04)' },
	{ tag: TT(t.strikethrough), color: 'var(--base04)', textDecoration: 'line-through' },
	{
		tag: TT(t.inserted),
		color: 'var(--base0B)',
		backgroundColor: 'color-mix(in oklab, var(--base0B) 12%, transparent)',
	},
	{
		tag: TT(t.deleted),
		color: 'var(--base08)',
		backgroundColor: 'color-mix(in oklab, var(--base08) 12%, transparent)',
	},
	{
		tag: TT(t.changed),
		color: 'var(--base0A)',
		backgroundColor: 'color-mix(in oklab, var(--base0A) 12%, transparent)',
	},
])

export const editorThemeExtensions = () => [
	cmTheme,
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	syntaxHighlighting(cmHighlight),
]
