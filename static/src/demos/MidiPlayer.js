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

        var infoText =
        "Midi Player demo that plays snippets of existing and recognizable musical pieces and allowing the AI to respond in kind. The quality of the response varies greatly on the piece input and the model used."

        this.midiNotes = []
        this.sequenceLength = 63
        this.sequencePos = 0

        this.trackNames = {
            "haydn_8_1.mid": "Sonate Hoboken XVI:8 1. Satz",
            "schubert_935_4.mid": "Piano right",
            "mozart_545_1.mid": "Sonate KV 545 1. Satz"
        }

        var midiTemplate = require("templates/midiplayer.hbs")
        this.element = document.createElement('div')
        this.element.innerHTML = midiTemplate({title: "Midi Player", info: infoText})
        this.element.id = 'tutorial'
        container.appendChild(this.element)
    }

    start() {
        this.keyboard.activate()

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))

        this.midiSelect = document.getElementById('change-midi')
        this.midiSelect.onchange = this.loadMidi.bind(this)

        this.playBtn = document.getElementById('start-btn')
        this.playBtn.onclick = this.playMidi.bind(this)

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
    }

    playMidi() {
        const now = Tone.now()
        let sequenceArray = this.midiNotes.slice(this.sequencePos, this.sequencePos + this.sequenceLength+1)
        let startTime = sequenceArray[0].time
        sequenceArray.forEach((event, index) => {
                this.emit('keyDown', event.note, event.time + now - startTime)
                this.emit('keyUp', event.note, event.time + event.duration * 0.9 + now - startTime)

                this.emit('aiKeyDown', event.note, event.time + now - startTime)
                this.emit('aiKeyUp', event.note, event.time + event.duration * 0.9 + now - startTime)
        })
        this.sequencePos += this.sequenceLength
        if (this.sequencePos >= this.midiNotes.length) {
            this.sequencePos = 0 // Start over if we go too far
        }
    }

    loadMidi(event) {
        this.midiNotes = []
        let filename = event.target.value
        let that = this
        MidiConvert.load("midi/" + filename, function(midi) {
            console.log("MIDI FILE LOADED", midi)

            Tone.Transport.bpm.value = midi.header.bpm
            Tone.Transport.timeSignature = midi.timeSignature

            let notes = midi.get(that.trackNames[filename]).notes
            notes.forEach(function(event) {
                that.midiNotes.push({note: event.midi, time: event.time, duration: event.duration})
            })
        })
    }

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }
}

