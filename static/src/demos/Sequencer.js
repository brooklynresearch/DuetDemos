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

        this.noteDuration = 1.9;

        var infoText =
        "Sequencer"

        var demoTemplate = require("templates/sequencer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Sequencer"});
        this.element.innerHTML = demoTemplate({info: infoText});
        this.element.id = 'tutorial'
        container.appendChild(this.element)
        
        this.aiIndicatorElement = document.createElement('div');
        this.aiIndicatorElement.id = 'aiSequenceIndicator';
        container.appendChild(this.aiIndicatorElement);  

        this.aiIndicatorCanvas = document.createElement('canvas');
        this.aiIndicatorCtx = this.aiIndicatorCanvas.getContext('2d');
        this.aiIndicatorCanvas.width = document.getElementById('aiSequenceIndicator').offsetWidth;
        this.aiIndicatorCanvas.height = document.getElementById('aiSequenceIndicator').offsetHeight;
        this.aiIndicatorElement.appendChild(this.aiIndicatorCanvas);

        this._aiNotes = [];

        for(var i=0; i<12; i++){
            let note = {
                id      :   i,
                width   :   document.getElementById('aiSequenceIndicator').offsetWidth,
                height  :   this.sequencer._keyboardInterface._matrix[0].height,
                x       :   0,
                y       :   this.sequencer._keyboardInterface._matrix[i].y,
                alpha   :   0.2,
                enabled :   false, 
                time    :   0.0 
            }
            this._aiNotes.push(note);
        }      

        console.log(this._aiNotes)

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
                id : i,
                width   :   this.sequencer._keyboardInterface._matrix[0].width,
                height  :   this.sequencer._keyboardInterface._matrix[0].height,
                x       :   this.sequencer._keyboardInterface._matrix[i * 12].x,
                y       :   0
            }
            this._beatCursor.push(beat);
        }
        
        //console.log(this.sequencer._keyboardInterface._matrix);
        this.aiLoop = new Tone.Sequence((time, count) => {
            this.checkTriggerTiming();
            this.renderAIIndicator();
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n');

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
                            //this.sound.keyDown(note + 48);
                            //this.ai.keyDown(note + 48);
                            this.sequencer.emit('keyDown', (note + 48), time +this.noteDuration + now);
                            this.sequencer.emit('keyUp', (note + 48), time + this.noteDuration + now)
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
        this.aiLoop.start();

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))

        var bpmSelect = document.getElementById("change-bpm")
        bpmSelect.addEventListener("change", this.changeBPM.bind(this))

        var sequencerSelect = document.getElementById("toggle-seq");
        sequencerSelect.addEventListener("change", this.toggleSeq.bind(this));
        
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
            //console.log(note);
            this.resetAlphaOnAIIndicator(note, time);
        })

        this.ai.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time, true)
            this.sequencer.keyUp(note, time, true)
            this.glow.ai(time)
        })
    }

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }

     changeBPM(event) {
        Tone.Transport.bpm.value = parseInt(event.target.value);
     }

     toggleSeq(event) {
        console.log(event.target.checked);
        if(event.target.checked == false){
            this.loop.stop();
        }else if(event.target.checked = true){
            this.loop.start();
        }
     }

    renderAIIndicator(){
        this.aiIndicatorCtx.clearRect(0, 0, this.aiIndicatorCanvas.width, this.aiIndicatorCanvas.height);
        for(var i=0; i<12; i++){
            this._aiNotes[i].alpha *= 0.8;
            if(this._aiNotes[i].alpha <= 0.1){
               this._aiNotes[i].alpha = 0.0;
            }
            let alpha = (this._aiNotes[i].alpha).toString();
            let rectColor = "rgba(249, 187, 45, " + alpha + " )" ;
            this.aiIndicatorCtx.fillStyle=rectColor;
            this.aiIndicatorCtx.fillRect(this._aiNotes[i].x,this._aiNotes[i].y,this._aiNotes[i].width,this._aiNotes[i].height);
       }
    }

    checkTriggerTiming(){
        for(var i=0; i<12; i++){
            let currentTime = Tone.now();
            if(this._aiNotes[i].enabled == true){
                if(currentTime >= this._aiNotes[i].time){
                    console.log("TURN " + i + " OFF");
                    this._aiNotes[i].alpha = 1.0;
                    this._aiNotes[i].enabled = false;
                }
            }
        }
    }

    resetAlphaOnAIIndicator(note, time) {
        let index = note - 48;

        if(index < 0){
            index = 0;
        } else if (index > 11){
            index = 11;
        }
        this._aiNotes[index].time = (time - this.noteDuration);
        this._aiNotes[index].enabled = true;
        console.log(this._aiNotes[index].time);
    }      
}
