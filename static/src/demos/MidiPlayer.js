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
import events from 'events'
import Tone from 'Tone/core/Tone'
import Part from 'Tone/event/Part'
import MidiConvert from 'midiconvert/build/MidiConvert'
import 'style/tutorial.css'

export class MidiPlayer extends events.EventEmitter{
    constructor(container){
        super()
        this.keyboard = new Keyboard(container)
        this.glow = new Glow(container)
        this.sound = new Sound()
        this.sound.load()
        this.ai = new AI()

        this.midiNotes = [];

        var midiTemplate = require("templates/midiplayer.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = midiTemplate({title: "Midi Player"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)
    }

    start() {
        this.keyboard.activate()
        var that = this;
        MidiConvert.load("midi/bach_846.mid", function(midi) {
            console.log("MIDI FILE LOADED", midi);

            Tone.Transport.bpm.value = midi.header.bpm;
            Tone.Transport.timeSignature = midi.timeSignature;

            var notes = midi.get("Piano left").notes;
            var i = 0;
            notes.forEach(function(event) {
                if (i <= 11) {
                    that.midiNotes.push({note: event.midi, time: event.time, duration: event.duration});
                }
                i++;
            });
        });

        this.on('keyDown', (note, time) => {
            this.sound.keyDown(note, time)
            this.keyboard.keyDown(note, time)
            this.glow.user()
        })

        this.on('keyUp', (note, time) => {
            this.sound.keyUp(note, time)
            this.keyboard.keyUp(note, time)
            this.glow.user()
        })

       this.on('aiKeyDown', (note, time) => {
            this.ai.keyDown(note, time)
        })

        this.on('aiKeyUp', (note, time) => {
            this.ai.keyUp(note, time)
        })

        this.keyboard.on('keyDown', (note) => {
            this.sound.keyDown(note)
            this.ai.keyDown(note)
            //this.glow.user()
        })

        this.keyboard.on('keyUp', (note) => {
            this.sound.keyUp(note)
            this.ai.keyUp(note)
            //this.glow.user()
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

         //setInterval(function() {
                that._promiseTimeout(400).then(() => {
                    //this._addText('When you play a few notes', 'user', 4200)
                    return that._promiseTimeout(500)
                }).then(() => {
                    console.log("NOTES", that.midiNotes);
                    const now = Tone.now()
                    that.midiNotes.forEach((event) => {
                        that.emit('keyDown', event.note, event.time + now)
                        that.emit('keyUp', event.note, event.time + event.duration * 0.9 + now)
                    })
                    return that._promiseTimeout(500)
                }).then(() => {
                    that._sendUserMelody()
                    return that._promiseTimeout(500)
                }).then(() => {
                    //this._addText('the computer will respond to what you play', 'ai', 5000)
                })
        //}, 25000);
    }

    _promiseTimeout(time){
        return new Promise(done => {
            setTimeout(done, time)
        })
    }

    _sendUserMelody(){
        const now = Tone.now()
        this.midiNotes.forEach((event) => {
            this.emit('aiKeyDown', event.note, event.time + now)
            this.emit('aiKeyUp', event.note, event.time + event.duration * 0.9 + now)
        })
    }
}

