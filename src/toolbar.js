class Toolbar {
	#delay = 1_000
	#toolShowTop = '0px'
	#pullShowTop = '0px'
	#toolHideTop = '-42px'
	#pullHideTop = '-40px'
	#hideTimer

	constructor() {
		this.tool = document.getElementById('bar')
		this.wrap = document.getElementById('wrap')
		this.pull = document.getElementById('bar-pull')

		this.tool.addEventListener('pointerenter', this.#show.bind(this))
		this.wrap.addEventListener('pointerenter', this.#hide.bind(this))
		this.pull.addEventListener('pointerenter', this.#show.bind(this))

		this.#hide()
	}

	#hide() {
		clearTimeout(this.#hideTimer)
		this.#hideTimer = setTimeout(() => {
			this.tool.style.top = this.#toolHideTop
			this.pull.style.top = this.#pullShowTop
		}, this.#delay)
	}

	#show() {
		clearTimeout(this.#hideTimer)
		this.tool.style.top = this.#toolShowTop
		this.pull.style.top = this.#pullHideTop
	}
}

export default () => new Toolbar()
