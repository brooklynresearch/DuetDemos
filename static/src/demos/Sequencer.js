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
        

        this.beatIndicatorElement = document.createElement('div');
        this.beatIndicatorElement.id = 'beatCursor';
        container.appendChild(this.beatIndicatorElement);

        this.indicatorCanvas = document.createElement ('canvas');
        this.indicatorCtx = this.indicatorCanvas.getContext('2d');
        this.indicatorCanvas.width = document.getElementById('sequencer').offsetWidth;
        this.indicatorCanvas.height = this.sequencer._keyboardInterface._matrix[0].height;
        this.beatIndicatorElement.appendChild(this.indicatorCanvas);

        this._beatCursor = [];
        for(var i=0; i<16; i++){
            let beat = {
                id : 0,
                width   :   this.sequencer._keyboardInterface._matrix[0].width,
                height  :   this.sequencer._keyboardInterface._matrix[0].height,
                x       :   this.sequencer._keyboardInterface._matrix[i * 12].x,
                y       :   0
            }
            this._beatCursor.push(beat);
        }
        
        //console.log(this.sequencer._keyboardInterface._matrix);

        this.loop = new Tone.Sequence((time, count) => {

            let matrix = this.sequencer._keyboardInterface._matrix;
            this.indicatorCtx.clearRect(0, 0, this.indicatorCanvas.width, this.indicatorCanvas.height);
            for(var beat = 0; beat <16; beat++){
                if(count === beat){
                    const now = Tone.now()
                    this.indicatorCtx.fillStyle = "rgba(0, 183, 235, 0.5)";
                    this.indicatorCtx.fillRect(this._beatCursor[beat].x,this._beatCursor[beat].y,this._beatCursor[beat].width,this._beatCursor[beat].height);
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
