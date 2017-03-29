import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'


export class BlankDemo {
    constructor(container) {
        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var infoText =
        "This is the default demo. Use this to play around with changing the underlying models and the wait and interrupt parameters for the AI. Higher values on the AI interrupt slider means the AI cuts in less abruptly."

        var demoTemplate = require("templates/blankdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Default Demo", info: infoText})
        this.element.id = 'tutorial'
        container.appendChild(this.element)
    }

    start() {
        this.keyboard.activate()

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))


        // Start listening
        this.keyboard.on('keyDown', (note) => {
            this.sound.keyDown(note)
            this.ai.keyDown(note)
            this.glow.user()
        })

        this.keyboard.on('keyUp', (note) => {
            this.sound.keyUp(note)
            this.ai.keyUp(note)
            this.glow.user()
        })

        this.ai.on('keyDown', (note, time) => {
            this.sound.keyDown(note, time, true)
            this.keyboard.keyDown(note, time, true)
            this.glow.ai(time)
        })

        this.ai.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time, true)
            this.keyboard.keyUp(note, time, true)
            this.glow.ai(time)
        })
    }

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }
}
