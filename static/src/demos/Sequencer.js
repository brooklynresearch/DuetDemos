import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import events from 'events'
import Tone from 'Tone/core/Tone'

export class Sequencer extends events.EventEmitter{
    constructor(container) {
        super()
        var demoTemplate = require("templates/sequencer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Sequencer"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)
    }

    start() {
        this.on('keyDown', (note, time) =>


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

    makeArpeggio(rootNote) {
        var beat = 0.4 // From Tutorial.js
        return [ // Basic ascending major scale arpeggio
        {note: rootNote, time: beat * 0, duration: beat},
        {note: rootNote + 2, beat * 1, duration: beat},
        {note: rootNote + 4, beat * 2, duration: beat},
        {note: rootNote + 5, beat * 3, duration: beat},
        {note: rootNode + 7, beat * 4, duration: beat},
        {note: rootNote + 9, beat * 5, duration: beat},
        {note: rootNote + 11, beat * 6, duration: beat},
        {note: rootNote + 12, beat * 7, duration: beat}
        ]
    }

    playArpeggio(arp) {
        const now = Tone.now()
        testMelody.forEach((event) => {
            this.emit('keyDown', event.note, event.time + now)
            this.emit('keyUp', event.note, event.time + event.duration * 0.9 + now)
        })
    }
}
