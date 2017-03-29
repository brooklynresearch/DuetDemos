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

        this.kickSampler = new Tone.Sampler('audio/drums/Kick15.wav', () => {
            this.kickSampler.volume.value = 1
        }).toMaster();

        this.hatSampler = new Tone.Sampler('audio/drums/Hihat04.wav', () => {
            this.hatSampler.volume.value = -3
        }).toMaster();

        this.snareSampler = new Tone.Sampler('audio/drums/Snare05.mp3', () => {
            this.snareSampler.volume.value = 1
        }).toMaster();

        this.sideSampler = new Tone.Sampler('audio/drums/Side07.wav', () => {
            this.sideSampler.volume.value = 1
        }).toMaster();


        Tone.Transport.timeSignature = [4,4]
        Tone.Transport.bpm.value = 120

        //Samba beat
        this.sambaBeat = new Tone.Sequence((time, count) => {
            if ([0,3,4,7,8,11,12,15].indexOf(count) >= 0) {
                this.kickSampler.triggerAttackRelease(0, '8n')
            }
            if ([0,2,5,7,9,12,14].indexOf(count) >= 0) {
                this.sideSampler.triggerAttackRelease(0, '8n')
            }
            if ([0,2,3,4,6,7,8,10,11,12,14,15].indexOf(count) >= 0) {
                this.hatSampler.triggerAttackRelease(0, '8n')
            }
        }, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'8n')

        //Basic beat
        this.basicBeat = new Tone.Sequence((time, count) => {
            //this.hatSampler.triggerAttackRelease(0,'8n')
            if ([0,4,5].indexOf(count) >= 0) {
                //console.log("KICK");
                this.kickSampler.triggerAttackRelease(0, '8n');
            } else if ([2,6].indexOf(count) >= 0) {
                //console.log("SNARE");
                this.snareSampler.triggerAttackRelease(0, '8n');
            }
        }, [0,1,2,3,4,5,6,7], '8n')

        this.aiQueue = new buckets.Queue()
    }

    start() {
        Tone.Transport.start()

        // check for queue'd AI notes and trigger callbacks
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


        var beatSelect = document.getElementById("change-beat")
        beatSelect.addEventListener("change", this.changeBeat.bind(this))

        var bpmSelect = document.getElementById("change-bpm")
        bpmSelect.addEventListener("change", this.changeBpm.bind(this))

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))

        this.basicBeat.start('1m')
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

     changeBeat(event) {
        switch(event.target.value) {
            case 'none':
                this.basicBeat.stop(Tone.now())
                this.sambaBeat.stop(Tone.now())
                break

            case 'basic':
                this.sambaBeat.stop(Tone.now())
                this.basicBeat.start('+1m')
                break

            case 'samba':
                this.basicBeat.stop(Tone.now())
                this.sambaBeat.start('+1m')
                break
        }

    }

     changeBpm(event) {
        Tone.Transport.bpm.value = parseInt(event.target.value)
        document.getElementById("display-bpm").innerHTML = event.target.value
     }

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }
}

