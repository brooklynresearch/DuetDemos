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

import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
import {Splash} from 'interface/Splash'
import {About} from 'interface/About'
import {Tutorial} from 'ai/Tutorial'
import {FirstDemo} from 'demos/FirstDemo'
import 'babel-polyfill'

console.log("LOADING MAIN");
/* MAKE CONTROLLER CLASS TO HANDLE TEMLPLATE/CLASS SWAPPING */

export class Controller {

    constructor() {
        this.route = window.location.hash;
        this.keyboard;
        this.container = document.createElement('div')
        this.container.id = 'container'
        document.body.appendChild(this.container)
        this.glow = new Glow(this.container)
        this.sound = new Sound()
        this.sound.load()

        ////// AI ///////////////////
        this.ai = new AI()
        this.ai.on('keyDown', (note, time) => {
            this.sound.keyDown(note, time, true)
            if (this.keyboard){
                this.keyboard.keyDown(note, time, true)
            }
            this.glow.ai(time)
        })

        this.ai.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time, true)
            if (this.keyboard){
                this.keyboard.keyUp(note, time, true)
            }
            this.glow.ai(time)
        })
    }

    start() {
        ////////// SPLASH /////////
        const about = new About(document.body)
        const splash = new Splash(document.body)
        splash.on('click', () => {
            if (this.keyboard) {
                this.keyboard.activate()
            }
            about.showButton()
        })
        splash.on('about', () => {
            about.open(true)
        })
        about.on('close', () => {
            if (!splash.loaded || splash.isOpen()){
                splash.show()
            } else {
                if (this.keyboard) {
                    this.keyboard.activate()
                }
            }
        })
        about.on('open', () => {
            if (this.keyboard) {
                this.keyboard.deactivate()
            }
            if (splash.isOpen()){
                splash.hide()
            }
        })

        switch(this.route){
            case "#tutorial": // TUTORIAL
                const tutorial = new Tutorial(this.container)
                this.addDefaultKeyboard()
                tutorial.start()

                tutorial.on('keyDown', (note, time) => {
                    this.sound.keyDown(note, time)
                    this.keyboard.keyDown(note, time)
                    this.glow.user()
                })

                tutorial.on('keyUp', (note, time) => {
                    this.sound.keyUp(note, time)
                    this.keyboard.keyUp(note, time)
                    this.glow.user()
                })

                tutorial.on('aiKeyDown', (note, time) => {
                    this.ai.keyDown(note, time)
                })

                tutorial.on('aiKeyUp', (note, time) => {
                    this.ai.keyUp(note, time)
                })
                break;

            case "#firstdemo": // FIRST DEMO
                const firstDemo = new FirstDemo(this.container);
                firstDemo.start()
                this.keyboard = new Keyboard(this.container)
                // Intercept regular note and make it all pentatonic-like
                this.keyboard.on('keyDown', (note) => {
                    firstDemo.makePenta(note, (newNote) => {
                        console.log("NEWNOTE", newNote)
                        this.sound.keyDown(newNote)
                        this.ai.keyDown(newNote)
                        this.glow.user()
                    })
                })
                this.keyboard.on('keyUp', (note) => {
                    firstDemo.makePenta(note, (newNote) => {
                        this.sound.keyUp(newNote)
                        this.ai.keyUp(newNote)
                        this.glow.user()
                    })
                })
                break;

            default:
                this.addDefaultKeyboard()
                break;
        }
    }

    addDefaultKeyboard() {
        this.keyboard = new Keyboard(this.container)
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
    }
}

var app = new Controller();
app.start();

////////////// OLD MAIN CODE ////////////////
/*
/////////////// SPLASH ///////////////////	

const about = new About(document.body)
const splash = new Splash(document.body)
splash.on('click', () => {
	keyboard.activate()
	tutorial.start()
	about.showButton()
})
splash.on('about', () => {
	about.open(true)
})
about.on('close', () => {
	if (!splash.loaded || splash.isOpen()){
		splash.show()
	} else {
		keyboard.activate()
	}
})
about.on('open', () => {
	keyboard.deactivate()
	if (splash.isOpen()){
		splash.hide()
	}
})


/////////////// PIANO ///////////////////

const container = document.createElement('div')
container.id = 'container'
document.body.appendChild(container)

const glow = new Glow(container)
const keyboard = new Keyboard(container)

const sound = new Sound()
sound.load()

keyboard.on('keyDown', (note) => {
	sound.keyDown(note)
	ai.keyDown(note)
	glow.user()
})

keyboard.on('keyUp', (note) => {
	sound.keyUp(note)
	ai.keyUp(note)
	glow.user()
})

/////////////// AI ///////////////////

const ai = new AI()

ai.on('keyDown', (note, time) => {
	sound.keyDown(note, time, true)
	keyboard.keyDown(note, time, true)
	glow.ai(time)
})

ai.on('keyUp', (note, time) => {
	sound.keyUp(note, time, true)
	keyboard.keyUp(note, time, true)
	glow.ai(time)
})

/////////////// TUTORIAL ///////////////////
const tutorial = new Tutorial(container)

tutorial.on('keyDown', (note, time) => {
	sound.keyDown(note, time)
	keyboard.keyDown(note, time)
	glow.user()
})

tutorial.on('keyUp', (note, time) => {
	sound.keyUp(note, time)
	keyboard.keyUp(note, time)
	glow.user()
})

tutorial.on('aiKeyDown', (note, time) => {
	ai.keyDown(note, time)
})

tutorial.on('aiKeyUp', (note, time) => {
	ai.keyUp(note, time)
})
/////////////// FIRSTDEMO ///////////////////
const demo = new FirstDemo(container);
*/
