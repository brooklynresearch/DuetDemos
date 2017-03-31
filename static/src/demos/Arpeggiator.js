import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import events from 'events'
import Tone from 'Tone/core/Tone'

export class Arpeggiator extends events.EventEmitter{
    constructor(container) {
        super()
        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var demoTitle = "Arpeggiator"
        var infoText =
        "Arpeggiator demo is a test for allowing users to quickly and easily input more complex musical structures. Touching each key triggers an arpeggio to be played with the key pressed as the root. This makes it easy for user’s to generate a certain kind of complex structure which in turn could allow for a more complex response from the AI."

        var demoTemplate = require("templates/arpeggiator.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: demoTitle})
        this.element.id = 'tutorial'
        container.appendChild(this.element)


        document.getElementById("info-title").innerHTML = demoTitle
        document.getElementById("info-body").innerHTML = infoText
    }

    start() {
        this.keyboard.activate()

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))


        this.on('keyDown', (note, time) => {
            this.sound.keyDown(note, time)
            this.keyboard.keyDown(note, time)
            this.glow.user()
        })

        this.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time)
            this.keyboard.keyUp(note, time)
            this.glow.user()
        })

        this.on('aiKeyDown', (note, time) => {
            this.ai.keyDown(note, time)
        })

        this.on('aiKeyUp', (note, time) => {
            this.ai.keyUp(note, time)
        })

        // Keyboard Input listener
        this.keyboard.on('keyDown', (note) => {
            // Play arpeggio based on note
            this.makeArpeggio("2oct-up-down", note, (arp) => {
                this.playArpeggio(arp)
                this._sendArpeggio(arp)
            })
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

    makeArpeggio(type, rootNote, callback) {
        // Based On sampleMelody in Tutorial.js
        var beat = 0.2
        switch (type) {
            case "1oct-up-down":
                callback( [ // 1 Octave Up-Down Major Chord
                    {note: rootNote, time: beat * 0, duration: beat},
                    {note: rootNote + 4, time: beat * 1, duration: beat},
                    {note: rootNote + 7, time: beat * 2, duration: beat},
                    {note: rootNote + 12, time: beat * 3, duration: beat},
                    {note: rootNote + 7, time: beat * 4, duration: beat},
                    {note: rootNote + 4, time: beat * 5, duration: beat},
                    {note: rootNote, time: beat * 6, duration: beat}
                ])
                break;

            case "2oct-up-down-minor":
                callback( [ // 2 Octave Up-Down Minor Chord
                    {note: rootNote, time: beat * 0, duration: beat},
                    {note: rootNote + 3, time: beat * 1, duration: beat},
                    {note: rootNote + 7, time: beat * 2, duration: beat},
                    {note: rootNote + 12, time: beat * 3, duration: beat},
                    {note: rootNote + 15, time: beat * 4, duration: beat},
                    {note: rootNote + 19, time: beat * 5, duration: beat},
                    {note: rootNote + 24, time: beat * 6, duration: beat},
                    {note: rootNote + 19, time: beat * 7, duration: beat},
                    {note: rootNote + 15, time: beat * 8, duration: beat},
                    {note: rootNote + 12, time: beat * 9, duration: beat},
                    {note: rootNote + 7, time: beat * 10, duration: beat},
                    {note: rootNote + 3, time: beat * 11, duration: beat}
                ])
                break;
 
            case "2oct-up-down":
                callback([ // 2 Octave Up-Down Major Chord
                    {note: rootNote, time: beat * 0, duration: beat},
                    {note: rootNote + 4, time: beat * 1, duration: beat},
                    {note: rootNote + 7, time: beat * 2, duration: beat},
                    {note: rootNote + 12, time: beat * 3, duration: beat},
                    {note: rootNote + 16, time: beat * 4, duration: beat},
                    {note: rootNote + 19, time: beat * 5, duration: beat},
                    {note: rootNote + 24, time: beat * 6, duration: beat},
                    {note: rootNote + 19, time: beat * 7, duration: beat},
                    {note: rootNote + 16, time: beat * 8, duration: beat},
                    {note: rootNote + 12, time: beat * 9, duration: beat},
                    {note: rootNote + 7, time: beat * 10, duration: beat},
                    {note: rootNote + 4, time: beat * 11, duration: beat}
                ])
                break;
        }
    }

    playArpeggio(arp) {
        const now = Tone.now()
        arp.forEach((event) => {
            this.emit('keyDown', event.note, event.time + now)
            this.emit('keyUp', event.note, event.time + event.duration * 0.9 + now)
        })
    }

    _sendArpeggio(arp){
        const now = Tone.now()
        arp.forEach((event) => {
            this.emit('aiKeyDown', event.note, event.time + now)
            this.emit('aiKeyUp', event.note, event.time + event.duration * 0.9 + now)
        })
    }

    _promiseTimeout(time){
        return new Promise(done => {
            setTimeout(done, time)
        })
    }

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }
}

