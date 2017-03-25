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

import events from 'events'
import 'style/sequencer.css'
import 'pepjs'
import Tone from 'Tone/core/Tone'
import NexusUI from 'nexusui/dist/nexusUI'
import {Roll} from 'roll/Roll'
import {Note} from 'keyboard/Note'

const offsets = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6]

class SequencerElement extends events.EventEmitter {

	constructor(container, lowest=36, octaves=4){
		super()
		this._container = document.createElement('div')
		this._container.id = 'sequencer'
		container.setAttribute('touch-action', 'none')
		container.appendChild(this._container)

		//some default menu stuff
		container.addEventListener('pointerup', (e) => delete this._pointersDown[e.pointerId])
		container.addEventListener('contextmenu', this._absorbEvent.bind(this))

		this._keys = {}

		this._pointersDown = {}


		this.resize(lowest, octaves)

		//Roll.appendTo(container)

		this._aiNotes = {}
		this._notes = {}

		let head = document.getElementsByTagName("head")[0];
		let js = document.createElement("script");
		js.type = "text/javascript";
		js.src = 'http://localhost:8000/nexusUI/dist/nexusUI.js'
		head.appendChild(js);



		let canvas = document.createElement ('canvas');
		canvas.setAttribute('nx', 'dial');
		this._container.appendChild(canvas);

		console.log(window.nx);


	}

	resize(lowest, octaves){
		this._keys = {}

		const MATRIX_COLS = 16
		const MATRIX_ROWS = 12


		// clear the previous ones
		// this._container.innerHTML = '<canvas nx="matrix" id="matrix1" class="nx" height="500" width="2110" style="width: 1055px; height: 250px;"></canvas>'
		/*
		for(let x=0; x<MATRIX_COLS; x++){
			for(let y=0; y<MATRIX_ROWS; y++){
				let step = document.createElement('div')
				step.classList.add('step')
				this._container.appendChild(step)

				let xOffset = (x / MATRIX_COLS)
				let yOffset = (y / MATRIX_ROWS)
				step.style.left = `${xOffset * 100}%`
				step.style.height = `${100/MATRIX_ROWS}%`
				step.style.top = `${yOffset * 100}%`

				step.id = (y * MATRIX_COLS) + x
				step.setAttribute('touch-action', 'none')

				const fill = document.createElement('div')
				fill.id = 'fill'
				step.appendChild(fill)

				this._bindKeyEvents(step)
				this._keys[(y * MATRIX_COLS) + x] = step
			}
		}
		*/


		//const keyWidth = (1 / 7) / octaves
		/*
		const keyWidth = 1
			let i = 60

			let key = document.createElement('div')
			key.classList.add('key')
			let isSharp = ([1, 3, 6, 8, 10].indexOf(i % 12) !== -1)
			key.classList.add(isSharp ? 'black' : 'white')
			this._container.appendChild(key)
			// position the element
			
			let noteOctave = Math.floor(i / 12) - Math.floor(lowest / 12)
			//let offset = offsets[i % 12] + noteOctave * 7
			let offset = 0
			key.style.width = `${keyWidth * 100}%`
			key.style.left = `${offset * keyWidth * 100}%`
			key.id = i.toString()
			key.setAttribute('touch-action', 'none')

			const fill = document.createElement('div')
			fill.id = 'fill'
			key.appendChild(fill)
			
			this._bindKeyEvents(key)
			this._keys[i] = key
		*/
		/*
		const keyWidth = (1 / 7) / octaves
		for (let i = lowest; i < lowest + octaves * 12; i++){
			let key = document.createElement('div')
			key.classList.add('key')
			let isSharp = ([1, 3, 6, 8, 10].indexOf(i % 12) !== -1)
			key.classList.add(isSharp ? 'black' : 'white')
			this._container.appendChild(key)
			// position the element
			
			let noteOctave = Math.floor(i / 12) - Math.floor(lowest / 12)
			let offset = offsets[i % 12] + noteOctave * 7
			key.style.width = `${keyWidth * 100}%`
			key.style.left = `${offset * keyWidth * 100}%`
			key.id = i.toString()
			key.setAttribute('touch-action', 'none')

			const fill = document.createElement('div')
			fill.id = 'fill'
			key.appendChild(fill)
			
			this._bindKeyEvents(key)
			this._keys[i] = key

		}
		*/
	}

	_absorbEvent(event) {
		const e = event || window.event;
		e.preventDefault && e.preventDefault();
		e.stopPropagation && e.stopPropagation();
		e.cancelBubble = true;
		e.returnValue = false;
		return false;
	}

	_bindKeyEvents(key){

		key.addEventListener('pointerover', (e) => {
			if (this._pointersDown[e.pointerId]){
				const noteNum = parseInt(e.target.id)
				this.emit('keyDown', noteNum)
			} else {
				key.classList.add('hover')
			}
		})
		key.addEventListener('pointerout', (e) => {
			if (this._pointersDown[e.pointerId]){
				const noteNum = parseInt(e.target.id)
				this.emit('keyUp', noteNum)
			} else {
				key.classList.remove('hover')
			}
		})
		key.addEventListener('pointerdown', (e) => {
			const noteNum = parseInt(e.target.id)
			// this.keyDown(noteNum, false)
			this.emit('keyDown', noteNum)
			this._pointersDown[e.pointerId] = true
		})
		key.addEventListener('pointerup', (e) => {
			const noteNum = parseInt(e.target.id)
			// this.keyUp(noteNum, false)
			this.emit('keyUp', noteNum)
			delete this._pointersDown[e.pointerId]
		})

		// cancel all the pointer events to prevent context menu which keeps the key stuck
		key.addEventListener('touchstart', this._absorbEvent.bind(this))
		key.addEventListener('touchend', this._absorbEvent.bind(this))
		key.addEventListener('touchmove', this._absorbEvent.bind(this))
		key.addEventListener('touchcancel', this._absorbEvent.bind(this))
	}

	keyDown(noteNum, ai=false){
		// console.log('down', noteNum, ai)
		if (this._keys.hasOwnProperty(noteNum)){
			const key = this._keys[noteNum]
			key.classList.remove('hover')

			const note = new Note(key.querySelector('#fill'), ai)

			const noteArray = ai ? this._aiNotes : this._notes
			if (!noteArray[noteNum]){
				noteArray[noteNum] = []
			}
			noteArray[noteNum].push(note)
		}
	}

	keyUp(noteNum, ai=false){
		// console.log('up', noteNum, ai)
		if (this._keys.hasOwnProperty(noteNum)){
			const noteArray = ai ? this._aiNotes : this._notes
			if (!(noteArray[noteNum] && noteArray[noteNum].length)){
				// throw new Error('note off without note on')
				// setTimeout(() => this.keyUp.bind(this, noteNum, ai), 100)
				console.warn('note off before note on')
			} else {
				noteArray[noteNum].shift().noteOff()
			}
		}	
	}
}

export {SequencerElement}
