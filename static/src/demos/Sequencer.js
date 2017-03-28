import {SequencerInterface} from 'keyboard/SequencerInterface'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import Tone from 'tone'


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

        var keys = new Tone.MultiPlayer({
            urls : {
                "A" : "../../audio/Salamander/A1.mp3",
                "C" : "../../audio/Salamander/C2.mp3",
                "D#" : "../../audio/Salamander/Ds2.mp3",
                "F#" : "../../audio/Salamander/Fs2.mp3",
            },
            volume : -10,
            fadeOut : 0.1,
        }).toMaster();
        //the notes
        var noteNames = ["F#", "D#", "C", "A"];

        console.log("Loading Loop")
        /*
        this.loop = new Tone.Sequence((time, count) => {
            if (count === 0) {
                //console.log("KICK");
                this.sound.keyDown(count + 48);
            } else if (count === 2) {
                //console.log("SNARE");
                this.sound.keyDown(count + 48);
            }
        }, [0,1,2,3], '8n')
        */

        let seq = document.getElementById('sequencer');
        console.log("sequencer element");
        
        //console.log(this.sequencer._keyboardInterface._matrix);

        this.loop = new Tone.Sequence((time, count) => {

            let matrix = this.sequencer._keyboardInterface._matrix;

            for(var beat = 0; beat < 16; beat++){
                if(count === beat){
                    const now = Tone.now()
                    for (var note = 0; note < 12; note++){
                        if (matrix[beat * 12 + note].enabled == true){
                            console.log(note);
                            //this.sound.keyDown(note + 48);
                            //this.ai.keyDown(note + 48);
                            this.sequencer.emit('keyDown', (note + 48), time + now);
                            this.sequencer.emit('keyUp', (note + 48), time + 1.9 + now)
                        } else {
                            //this.sound.keyUp(note + 48);
                            //this.ai.keyUp(note + 48);
                        }
                    }
                }
            }        
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n');
        
    }

    start() {

        this.sequencer.activate()
        Tone.Transport.start()
        this.loop.start('1m');
        
        
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
