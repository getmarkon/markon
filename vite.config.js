import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
	base: '/markon/',
	define: {
		'import.meta.env.VERSION': JSON.stringify(pkg.version),
	},
	server: {
		watch: {
			ignored: ['**/*.tmp', '**/.dev/**', '**/.git/**', '**/.github/**', '**/node_modules/**', '**/dist/**'],
		},
	},
})
