const createToolbar = () => {
	const delay = 1_000
	const toolShowTop = '0px'
	const pullShowTop = '0px'
	const toolHideTop = '-42px'
	const pullHideTop = '-40px'
	let hideTimer

	const tool = document.getElementById('bar')
	const wrap = document.getElementById('wrap')
	const pull = document.getElementById('bar-pull')

	const hide = () => {
		clearTimeout(hideTimer)
		hideTimer = setTimeout(() => {
			tool.style.top = toolHideTop
			pull.style.top = pullShowTop
			tool.classList.remove('open')
		}, delay)
	}

	const show = () => {
		clearTimeout(hideTimer)
		tool.style.top = toolShowTop
		pull.style.top = pullHideTop
		tool.classList.add('open')
	}

	tool.addEventListener('pointerenter', show)
	wrap.addEventListener('pointerenter', hide)
	pull.addEventListener('pointerenter', show)

	hide()
}

export default createToolbar
