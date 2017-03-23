import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import buckets from 'buckets-js'
import Tone from 'tone'

export class Quantizer {
    constructor(container) {
        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var demoTemplate = require("templates/quantizer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Quantizer"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.kickSampler = new Tone.Sampler('audio/drums/Kick02.mp3', () => {
            console.log ("LOADED KICK");
            this.kickSampler.volume.value = 1;
        }).toMaster();

        this.snareSampler = new Tone.Sampler('audio/drums/Snare05.mp3', () => {
            console.log("LOADED SNARE");
            this.snareSampler.volume.value = 1;
        }).toMaster();

        this.beat = new Tone.Sequence((time, count) => {
            if (count === 0) {
                //console.log("KICK");
                this.kickSampler.triggerAttackRelease(0, '8n');
            } else if (count === 2) {
                //console.log("SNARE");
                this.snareSampler.triggerAttackRelease(0, '8n');
            }
        }, [0,1,2,3], '8n')

        this.aiQueue = new buckets.Queue()
    }

    start() {
        Tone.Transport.start()

        /* IDEA: iterate through the queue. First note of the phrase (use some flag that 
         * gets reset) is scheduled for the beginning of next measure; Following
         * noteOns and noteOffs are scheduled relative to that first note
         * using the the BPM to determine the multiple of a small note value 
         * (8th or 16th notes) that is closest to the time value returned by the AI.
         * In other words, take the time from the AI respose and figure out the nearest
         * 8th (or 16th) note. Using a small note value to allow more variation.
         *
         * EX:
         * var t = begin + mult("8n", 14)
         * scheduleNoteOn(note, t)
         *
         * Where begin is the scheduled time of the first note*/

        var begin = 0
        Tone.Transport.scheduleRepeat((time) => {
            if(!this.aiQueue.isEmpty()) {
                if (begin === 0) {
                    // First note in series
                    begin = Tone.Time('+1m') // next measure
                }
                const event = this.aiQueue.dequeue()
                const unit = Tone.Time('8n')
                const factor = Math.ceil(event.time / 0.25)
                console.log("Factor ", factor)
                const q = unit.mult(factor).eval()
                console.log("Scheduling Note for ", q)
                event.callback(q)
            } else {
                // No notes in queue. Next note will be 1st in sequence
                begin = 0
            }
        }, '16n')

        this.beat.start('1m')
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
            //console.log("Queueing keydown")
            this.aiQueue.add({
                time : time,
                callback : (t) => {
                    //const now = Tone.now()
                    this.sound.keyDown(note, t, true)
                    this.keyboard.keyDown(note, t, true)
                    this.glow.ai(t)
                }
            })
        })

        this.ai.on('keyUp', (note, time) => {
            this.aiQueue.add({
                time: time,
                callback: (t) => {
                    //const now = Tone.now()
                    this.sound.keyUp(note, t, true)
                    this.keyboard.keyUp(note, t, true)
                    this.glow.ai(t)
                }
            })
        })
    }
}
