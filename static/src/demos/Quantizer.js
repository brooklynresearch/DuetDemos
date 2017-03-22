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

        // JUST PLAY ALL THE AI NOTES ON 8th NOTES
        Tone.Transport.scheduleRepeat((time) => {
            if(!this.aiQueue.isEmpty()) {
                console.log("Queue'd Note!")
                const event = this.aiQueue.dequeue()
                event.callback()
            }
        }, '8n')

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
            console.log("Queueing keydown")
            this.aiQueue.add({
                time : time,
                callback : () => {
                    const now = Tone.now()
                    this.sound.keyDown(note, now, true)
                    this.keyboard.keyDown(note, now, true)
                    this.glow.ai(now)
                }
            })
        })

        this.ai.on('keyUp', (note, time) => {
            this.aiQueue.add({
                time: time,
                callback: () => {
                    const now = Tone.now()
                    this.sound.keyUp(note, now, true)
                    this.keyboard.keyUp(note, now, true)
                    this.glow.ai(now)
                }
            })
        })
    }
}
