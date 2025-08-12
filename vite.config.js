import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
    base: '/markon/',
	define: {
		'import.meta.env.VERSION': JSON.stringify(pkg.version),
		__VUE_OPTIONS_API__: false,
		__VUE_PROD_DEVTOOLS__: false,
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
	},
})
