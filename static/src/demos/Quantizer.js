import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import Tone from 'tone'

export class Quantizer {
    constructor(container) {
        var demoTemplate = require("templates/quantizer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Quantizer"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)
    }

    start() {
        Tone.Transport.start()
        this.keyboard.activate()
        // Start listening
        this.keyboard.on('keyDown', (note) => {
            // Schedule input for the next 8th note
            Tone.Transport.schedule((t) => {
                this.sound.keyDown(note)
                this.ai.keyDown(note)
                this.glow.user()
            }, '@8n')
        })

        this.keyboard.on('keyUp', (note) => {
            // Schedule input for the next 8th note
            Tone.Transport.schedule((t) => {
                this.sound.keyUp(note)
                this.ai.keyUp(note)
                this.glow.user()
            }, '@8n')
        })

        this.ai.on('keyDown', (note, time) => {
            // Schedule output for the next 8th note
            Tone.Transport.schedule((t) => {
                this.sound.keyDown(note, time, true)
                this.keyboard.keyDown(note, time, true)
                this.glow.ai(time)
            }, '@8n')
        })

        this.ai.on('keyUp', (note, time) => {
            // Schedule output for the next 8th note
            Tone.Transport.schedule((t) => {
                this.sound.keyUp(note, time, true)
                this.keyboard.keyUp(note, time, true)
                this.glow.ai(time)
            }, '@8n')
        })
    }
}
