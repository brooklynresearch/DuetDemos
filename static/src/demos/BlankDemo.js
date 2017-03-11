import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'


export class BlankDemo {
    constructor(container) {
        var demoTemplate = require("templates/blankdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Blank Demo: A Demo of a Demo"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)
    }

    start() {
        this.keyboard.activate()
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
}
