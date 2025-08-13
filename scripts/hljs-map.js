// Generate src/hljs-map.js (alias->module and module->package) from live SUPPORTED_LANGUAGES.md + installed hljs languages
// No deps, Node >=18
import { mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const SRC = resolve(process.cwd(), 'scripts', 'SUPPORTED_LANGUAGES.md')
const REMOTE = 'https://raw.githubusercontent.com/highlightjs/highlight.js/refs/heads/main/SUPPORTED_LANGUAGES.md'
const OUT_JS = resolve(process.cwd(), 'src', 'hljs-map.js')
const OUT_IMPORTERS = resolve(process.cwd(), 'src', 'hljs-importers.js')
const HL_DIR = resolve(process.cwd(), 'node_modules', 'highlight.js', 'lib', 'languages')

const toKey = s => (s || '').toLowerCase().trim()
const normalizeCandidate = s => {
    const x = toKey(s)
        .replace(/c\s*\+\+/, 'cpp')
        .replace(/c#/, 'csharp')
        .replace(/f#/, 'fsharp')
        .replace(/q#/, 'qsharp')
    return x.replace(/[^a-z0-9]+/g, '')
}
const parseAliases = s => (s || '')
	.split(',')
	.map(x => toKey(x).replace(/\|/g, '').trim())
	.filter(Boolean)

const toModuleName = filename => filename.replace(/(\.js)+$/i, '')
const availableModules = (() => {
    try {
        const names = readdirSync(HL_DIR)
            .filter(f => f.endsWith('.js'))
            .map(toModuleName)
        return new Set(names)
    } catch { return new Set() }
})()

const pickModule = (languageCell, aliases) => {
    // Prefer aliases first (captures csharp/fsharp/qsharp, cpp, etc.)
    for (const a of aliases) {
        const an = normalizeCandidate(a)
        if (availableModules.has(an)) return an
    }
    // languageCell may include commas (e.g., 'HTML, XML'). Try split tokens next
    const langTokens = languageCell.split(',').map(s => normalizeCandidate(s))
    for (const tok of langTokens) if (availableModules.has(tok)) return tok
    // try full normalized language string (remove spaces/punct)
    const norm = normalizeCandidate(languageCell)
    if (availableModules.has(norm)) return norm
    // special-case: html should use xml module
    if (langTokens.some(t => t === 'html') && availableModules.has('xml')) return 'xml'
    return ''
}

const fetchText = async (url, timeoutMs = 8000) => {
	const ctrl = new AbortController()
	const id = setTimeout(() => ctrl.abort(), timeoutMs)
    return fetch(url, { signal: ctrl.signal })
		.then(r => (r?.ok ? r.text() : ''))
		.catch(() => '')
		.finally(() => clearTimeout(id))
}

const readSupportedLanguages = async () => {
	return fetchText(REMOTE, 8000).then(text => text || (existsSync(SRC) ? readFileSync(SRC, 'utf8') : ''))
}

const run = async () => {
	const text = await readSupportedLanguages()
	const lines = text.split(/\r?\n/)
	const start = lines.findIndex(l => l.trim().startsWith('| Language'))
	const aliasToModule = {}
	const moduleToPackage = {}
	if (start >= 0) {
        for (let i = start + 2; i < lines.length; i++) {
			const l = lines[i]
			if (!l?.startsWith('|')) break
			const cols = l.split('|').map(c => c.trim())
			const languageCell = cols[1] || ''
			const aliases = parseAliases(cols[2])
			const pkgCell = cols[3] || ''
			const pkgMatch = pkgCell.match(/\[([^\]]+)\]/)
			const pkgName = pkgMatch ? pkgMatch[1] : ''
            let mod = pickModule(languageCell, aliases)
            // If not a core module but a package exists, synthesize module name from alias/language
            if (!mod && pkgName) mod = normalizeCandidate(aliases[0] || languageCell)
            if (!mod) continue
            for (const a of aliases) aliasToModule[toKey(a)] = mod
            // also map normalized language tokens themselves
            for (const tok of languageCell.split(',').map(s => normalizeCandidate(s))) if (tok) aliasToModule[tok] = mod
            if (pkgName) moduleToPackage[mod] = pkgName
		}
	}
    mkdirSync(dirname(OUT_JS), { recursive: true })
    writeFileSync(OUT_JS, `// generated from live SUPPORTED_LANGUAGES.md (with local fallback)\nexport const aliasToModule = ${JSON.stringify(aliasToModule, null, 1)}\nexport const moduleToPackage = ${JSON.stringify(moduleToPackage, null, 1)}\n`)
    // Generate static importers for all core language modules Vite can analyze
    const coreMods = Array.from(availableModules).sort()
    const importerLines = [
        '// generated list of static importers for highlight.js core languages',
        'export const coreImporters = {',
        ...coreMods.map(m => ` ${JSON.stringify(m)}: () => import('highlight.js/lib/languages/${m}.js'),`),
        '}',
        '',
    ]
    writeFileSync(OUT_IMPORTERS, importerLines.join('\n'))
    console.log(`[hljs-map] wrote ESM map (${Object.keys(aliasToModule).length} aliases, ${Object.keys(moduleToPackage).length} packages) -> ${OUT_JS}`)
    console.log(`[hljs-map] wrote core importers (${coreMods.length}) -> ${OUT_IMPORTERS}`)
}

run()
