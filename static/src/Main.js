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
import {FirstDemo} from 'demos/FirstDemo'
import {BlankDemo} from 'demos/BlankDemo'
import {Arpeggiator} from 'demos/Arpeggiator'
import {Quantizer} from 'demos/Quantizer'
import {ServerDemo} from 'demos/ServerDemo'
import 'babel-polyfill'

export class Controller {

    constructor() {
        console.log("LOADING CONTROLLER");
        this.route = window.location.hash;
        this.container = document.createElement('div')
        this.container.id = 'container'
        document.body.appendChild(this.container)
    }

    start() {
        switch(this.route) {
            case "#tutorial": // TUTORIAL
                const tutorial = new Tutorial(this.container)
                tutorial.start()
                break;

            case "#firstdemo": // PENTATONIC
                const firstDemo = new FirstDemo(this.container)
                firstDemo.start()
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

            default:
                const blankDemo = new BlankDemo(this.container)
                blankDemo.start()
                break;
        }
    }
}
var app = new Controller();
app.start();

