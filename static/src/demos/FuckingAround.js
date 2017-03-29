import {Keyboard} from 'keyboard/SequencerOLD'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import Tone from 'tone'

export class FuckingAround {
    constructor(container) {

        this.ai = new AI()
        this.keyboard = new Keyboard(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)

        var demoTemplate = require("templates/fuckingAround.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Fucking Around"});
        this.element.id = 'sequencer'
        container.appendChild(this.element)

        this.keys = new Tone.MultiPlayer({
            urls : {
                "A" : "audio/Salamander/A1.mp3",
                "C" : "audio/Salamander/C2.mp3",
                "D#" : "audio/Salamander/Ds2.mp3",
                "F#" : "audio/Salamander/Fs2.mp3",
            },
            volume : -10,
            fadeOut : 0.1,
        }).toMaster();

        this.aSampler = new Tone.Sampler('audio/Salamander/A1.mp3', () => {
            console.log ("LOADED A");
            this.kickSampler.volume.value = 2;
        }).toMaster();

        this.cSampler = new Tone.Sampler('audio/Salamander/C2.mp3', () => {
            console.log("LOADED C");
            this.snareSampler.volume.value = 2;
        }).toMaster();
        //the notes
        var noteNames = ["F#", "D#", "C", "A"];
        
        this.loop = new Tone.Sequence((time, count) => {
            if (count === 0) {
                console.log("A");
                //this.aSampler.triggerAttackRelease(0, '8n');
                var vel = Math.random() * 0.5 + 0.5;
                this.keys.start(noteNames[count], time, 0, "32n", 0, vel);
            } else if (count === 8) {
                console.log("C");
                //this.cSampler.triggerAttackRelease(0, '8n');
                var vel = Math.random() * 0.5 + 0.5;
                this.keys.start(noteNames[count], time, 0, "32n", 0, vel);
            }
            // var column = matrix1.matrix[col];
            // var column = this.keyboard.keys[count]
            // for (var i = 0; i < 4; i++){
            //     if (column[i] === 1){
            //         //slightly randomized velocities
            //         var vel = Math.random() * 0.5 + 0.5;
            //         this.keys.start(noteNames[i], time, 0, "32n", 0, vel);
            //     }
            // }
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");


    }

    start() {

        //Tone.Transport.start()
        //this.loop.start('1m')
        //var synth = new Tone.FMSynth().toMaster()

        //schedule a series of notes to play as soon as the page loads
        // synth.triggerAttackRelease('C4', '4n', '8n')
        // synth.triggerAttackRelease('E4', '8n', '4n + 8n')
        // synth.triggerAttackRelease('G4', '16n', '2n')
        // synth.triggerAttackRelease('B4', '16n', '2n + 8t')
        // synth.triggerAttackRelease('G4', '16','2n + 8t * 2')
        // synth.triggerAttackRelease('E4', '2n', '0:3')
        
        this.keyboard.activate()
        

        // Start listening
        this.keyboard.on('keyDown', (note) => {
            //console.log(note)
            var newNote = parseInt(note/16) + 48
            this.sound.keyDown(newNote)
            this.ai.keyDown(newNote)
            this.glow.user()
        })

        this.keyboard.on('keyUp', (note) => {
            var newNote = parseInt(note/16) + 48
            this.sound.keyUp(newNote)
            this.ai.keyUp(newNote)
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
