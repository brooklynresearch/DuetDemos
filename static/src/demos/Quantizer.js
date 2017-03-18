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

        this.kickSampler = new Tone.Sampler('audio/drums/Kick02.mp3', () => {
            console.log ("LOADED KICK");
            this.kickSampler.volume.value = 2;
        }).toMaster();

        this.snareSampler = new Tone.Sampler('audio/drums/Snare05.mp3', () => {
            console.log("LOADED SNARE");
            this.snareSampler.volume.value = 2;
        }).toMaster();

        this.beat = new Tone.Sequence((time, count) => {
            if (count === 0) {
                console.log("KICK");
                this.kickSampler.triggerAttackRelease(0, '8n');
            } else if (count === 2) {
                console.log("SNARE");
                this.snareSampler.triggerAttackRelease(0, '8n');
            }
        }, [0,1,2,3], '8n')
    }

    start() {
        Tone.Transport.start()
        this.beat.start('1m')
        this.keyboard.activate()
        // Start listening
        this.keyboard.on('keyDown', (note) => {
            // Schedule input for the next 8th note
            var t = Tone.Time('@8n').eval()
            //Tone.Transport.schedule((t) => {
                this.sound.keyDown(note, t)
                this.ai.keyDown(note, t)
                this.glow.user()
            //}, t)
        })

        this.keyboard.on('keyUp', (note) => {
            // Schedule input for the next 8th note
            var t = Tone.Time('@8n').eval()
            //Tone.Transport.schedule((t) => {
                this.sound.keyUp(note, t)
                this.ai.keyUp(note, t)
                this.glow.user()
            //}, '@8n')
        })

        this.ai.on('keyDown', (note, time) => {
            // Schedule output for the next 8th note
            //Tone.Transport.schedule((t) => {
            var t = Tone.Time('@8n').eval()
                this.sound.keyDown(note, t, true)
                this.keyboard.keyDown(note, t, true)
                this.glow.ai(time)
            //}, '@8n')
        })

        this.ai.on('keyUp', (note, time) => {
            // Schedule output for the next 8th note
            var t = Tone.Time('@8n').eval()
            //Tone.Transport.schedule((t) => {
                this.sound.keyUp(note, t, true)
                this.keyboard.keyUp(note, t, true)
                this.glow.ai(time)
            //}, '@8n')
        })
    }
}
