import {SequencerInterface} from 'keyboard/SequencerInterface'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'


export class Sequencer {
    constructor(container) {
        this.ai = new AI()
        this.sequencer = new SequencerInterface(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var demoTemplate = require("templates/sequencer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Sequencer"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)
    }

    start() {
        this.sequencer.activate()
        // Start listening
        this.sequencer.on('keyDown', (note) => {
            this.sound.keyDown(note)
            this.ai.keyDown(note)
            this.glow.user()
        })

        this.sequencer.on('keyUp', (note) => {
            this.sound.keyUp(note)
            this.ai.keyUp(note)
            this.glow.user()
        })

        this.ai.on('keyDown', (note, time) => {
            this.sound.keyDown(note, time, true)
            this.sequencer.keyDown(note, time, true)
            this.glow.ai(time)
        })

        this.ai.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time, true)
            this.sequencer.keyUp(note, time, true)
            this.glow.ai(time)
        })
    }
}
