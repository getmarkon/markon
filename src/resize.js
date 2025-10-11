import { createEventHandler, createElement, createClickHandler, injectStyles } from './utils.js'

// Layout utilities
const setPreviewWidth = (width, wrap) => {
	// Allow preview to expand to full width
	const finalWidth = Math.max(width, 0)
	wrap.style.gridTemplateColumns = `1fr 10px ${finalWidth}px`
}

// Resize component styles
const styles = /* css */`
#preview {
	display: grid;
	grid-template-columns: 1fr;
	overflow: hidden;
	overflow-x: auto;
	overflow-y: auto;
	position: relative;
	box-sizing: border-box;
	min-width: 0;
	width: 100%;
	max-width: none;
}

.preview-toggle {
	color: var(--comment);
	position: fixed;
	margin-left: -15px;
	transition: all 0.3s ease;
	pointer-events: auto;
	top: 100px;
	z-index: 10;
	cursor: pointer;
	opacity: 0;

	iconify-icon {
		width: 20px;
		height: 20px;
	}

	&:hover {
		color: var(--primary);
		opacity: 1;
		transform: translateX(0);
	}
}

#resize-handle {
	position: fixed;
	margin-left: -12px;
	pointer-events: none;
	user-select: none;
	top: 200px;
	z-index: 5;
	opacity: 1;
	transform: translateX(10px);
}

#split {
	width: 10px;
	cursor: col-resize;
	background: var(--bg-light);
	position: relative;
	user-select: none;
	-webkit-user-select: none;
	touch-action: none;

	&::before {
		content: "";
		position: absolute;
		inset: 0;
		background: var(--text-alpha);
		transition: background 0.15s ease;
	}

	&:hover {
		&::before {
			background: var(--bg-alpha);
		}

		.preview-toggle {
			transform: scale(1.1);
			opacity: 1;
			color: var(--operator);
		}
	}

	&.active::before {
		background: var(--accent);
	}
}
`

// Inject styles
injectStyles(styles)

// Preview manager
export const createPreviewManager = (wrap) => {
	let _width = 400 // Start with preview open
	const previewToggle = document.getElementById('preview-toggle')

	const setWidth = newWidth => {
		_width = newWidth
		setPreviewWidth(newWidth, wrap)
		previewToggle?.setAttribute('aria-pressed', String(newWidth > 0))
	}

	const toggle = () => setWidth(_width === 0 ? 400 : 0)

	// Add click handler to toggle button
	createClickHandler(previewToggle, toggle)

	// Initialize with preview open
	setWidth(_width)

	return {
		toggle,
		setWidth,
		get width() { return _width },
		set width(value) { _width = value }
	}
}

// Resize handler
export const createResizeHandler = (split, previewAside, wrap, previewManager) => e => {
	const startX = e.clientX
	const startWidth = previewAside.getBoundingClientRect().width

	split.classList.add('active')

	const onMove = ev => {
		const dx = startX - ev.clientX
		const newWidth = startWidth + dx
		const clampedWidth = Math.max(0, newWidth)
		setPreviewWidth(clampedWidth, wrap)
		// Update the preview manager's internal state
		if (previewManager) {
			previewManager.width = clampedWidth
		}
	}

	const onUp = () => {
		split.classList.remove('active')
		removeMoveListener()
		removeUpListener()

		// Update the preview manager's internal state
		const finalWidth = previewAside.getBoundingClientRect().width
		if (previewManager) {
			previewManager.width = finalWidth
		}
	}

	const removeMoveListener = createEventHandler(window, 'pointermove', onMove)
	const removeUpListener = createEventHandler(window, 'pointerup', onUp)
}
