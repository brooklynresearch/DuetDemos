import events from 'events'
import Tone from 'Tone/core/Tone'
import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'

export class Pentatonic extends events.EventEmitter{
    constructor(container){
        super()

        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var demoTemplate = require("templates/pentatonic.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Pentatonic"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.pentaNotes = [0,12,24,36,48,60,72,84,96,108,120,    // C
                           2,14,26,38,50,62,74,86,98,110,122,    // D
                           4,16,28,40,52,64,76,88,100,112,124,   // E
                           7,19,31,43,55,67,79,91,103,115,127,   // G
                           9,21,33,45,57,69,81,93,105,117,129];  // A
    }

    start() { // Start listening
        this.keyboard.activate()
        // Intercept regular note and make it all pentatonic-like
        this.keyboard.on('keyDown', (note) => {
            this.makePenta(note, (newNote) => {
                //console.log("NEWNOTE", newNote)
                this.sound.keyDown(newNote)
                this.ai.keyDown(newNote)
                this.glow.user()
            })
        })
        this.keyboard.on('keyUp', (note) => {
            this.makePenta(note, (newNote) => {
                this.sound.keyUp(newNote)
                this.ai.keyUp(newNote)
                this.glow.user()
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

    makePenta(note, callback) {
        if (this.pentaNotes.indexOf(note) === -1) {
            var closest = this.pentaNotes[0]
            var i = 0;
            this.pentaNotes.forEach((pNote) => {
                if (Math.abs(pNote - note) < Math.abs(closest-note)) {
                    closest = pNote
                }
                if (i === this.pentaNotes.length-1) {
                    //console.log("NEW NOTE", closest)
                    callback(closest)
                }
                i++;
            })
        } else {
            //console.log("SAME NOTE", note)
            callback(note)
        }
    }
}
