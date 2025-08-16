class Toolbar {
	#delay = 3_000
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
			this.tool.style.top = '-42px'
			this.pull.style.top = '4px'
		}, this.#delay)
	}

	#show() {
		clearTimeout(this.#hideTimer)
		this.tool.style.top = '0'
		this.pull.style.top = '-30px'
	}
}

export default () => new Toolbar()
