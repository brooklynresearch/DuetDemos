/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Tutorial} from 'ai/Tutorial'
import {Pentatonic} from 'demos/Pentatonic'
import {BlankDemo} from 'demos/BlankDemo'
import {Arpeggiator} from 'demos/Arpeggiator'
import {Quantizer} from 'demos/Quantizer'
import {ServerDemo} from 'demos/ServerDemo'
import {MidiPlayer} from 'demos/MidiPlayer'
import 'babel-polyfill'

export class Controller {

    constructor() {
        console.log("LOADING CONTROLLER");
        this.route = window.location.hash;
        this.container = document.createElement('div')
        this.container.id = 'container'
        document.body.appendChild(this.container)

        var wait = setInterval(function() { // THERE MUST BE A BETTER WAY
            var elem = document.getElementById("change-model")
            if (elem) {
                elem.addEventListener("change", Controller.changeModel)
                clearInterval(wait)
            }
        }, 200)
    }

    start() {
        switch(this.route) {
            case "#tutorial": // TUTORIAL
                const tutorial = new Tutorial(this.container)
                tutorial.start()
                break;

            case "#pentatonic": // PENTATONIC
                const pentatonic = new Pentatonic(this.container)
                pentatonic.start()
                break;

            case "#arpeggiator": // ARPEGGIATOR
                const arpeggiator = new Arpeggiator(this.container)
                arpeggiator.start()
                break;

            case "#quantizer": // QUANTIZER
                const quantizer = new Quantizer(this.container)
                quantizer.start()
                break

            case "#serverdemo": // SERVER DEMO
                const serverDemo = new ServerDemo(this.container)
                serverDemo.start()
                break;

            case "#midiplayer": // MIDI PLAYER
                const midiPlayer = new MidiPlayer(this.container)
                midiPlayer.start()
                break;

            default:
                const blankDemo = new BlankDemo(this.container)
                blankDemo.start()
                break;
        }
    }

    static changeModel(event) {

        this.models = {
            'melodic - attention': 'attention_rnn',
            'melodic - lookback': 'lookback_rnn',
            'melodic - basic': 'basic_rnn',
            'polyphonic': 'polyphony_rnn'
        }

        fetch('/model', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.models[event.target.value]
          })
        })
        .then(function(res){ 
            console.log(res);
        })
        .catch(function(error){
            console.log('Request failed', error)
        })
    }
}
var app = new Controller();
app.start();

