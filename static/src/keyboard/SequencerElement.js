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
import 'jquery'
import Tone from 'Tone/core/Tone'
import {Roll} from 'roll/Roll'
import {Note} from 'keyboard/Note'

const offsets = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6]

class SequencerElement extends events.EventEmitter {

	constructor(container, lowest=36, octaves=4, matrix) {

		super()
		
		// window.$ = window.jQuery = require("jquery");
		this._container = document.createElement('div')
		this._container.id = 'sequencer'
		container.setAttribute('touch-action', 'none')
		container.appendChild(this._container)

		this._canvas = document.createElement ('canvas');
		this._ctx = this._canvas.getContext('2d');
		const rows = matrix.rows
		const columns = matrix.columns
		const stepWidth  = (document.getElementById('sequencer').offsetWidth / columns);
		const stepHeight = (document.getElementById('sequencer').offsetHeight / rows);
		const slotSize = { width: stepWidth, height: stepHeight };
		this._canvas.width = columns * slotSize.width;
		this._canvas.height = rows * slotSize.height;

		this._container.appendChild(this._canvas);

		this._matrix = []; 
		this._beatIndicator = [];

		for( let i=0; i<columns; i++ ) {
		  for( let j=0; j<rows; j++ ) {
		    let cell = {
		      id: i * rows + j,
		      column: i,
		      row: j, 
		      width: slotSize.width-4, 
		      height: slotSize.height-4, 
		      x: i * slotSize.width, 
		      y: j * slotSize.height, 
		      enabled: false,
		      hovering: false
		    }
		    this._matrix.push(cell);
		  }
		}
		this._renderMatrix(this._matrix);

		this._canvas.addEventListener('mousedown', this._handleDown.bind(this));
		this._canvas.addEventListener('mouseup',  this._handleUp.bind(this));
		this._canvas.addEventListener('touchstart', this._handleDown.bind(this));
		this._canvas.addEventListener('touchend', this._handleUp.bind(this));
		this._canvas.addEventListener('touchcancel', this._handleUp.bind(this));

 
	}


	_renderMatrix(matrix) {
	  this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

	  for( var i=0; i<matrix.length; i++ ) {
	    
	    if (matrix[i].enabled === false){
	    	//var noteNum = (i + 48);
	    	//this.emit('keyUp', noteNum)
	      	this._ctx.fillStyle="rgba(255, 255, 255, 0.2)";
	    } 
	    else {
	    	//var noteNum = (i + 48);
	    	//this.emit('keyDown', noteNum)
	      	this._ctx.fillStyle="rgba(249, 187, 45, 1)";
	    }
	    this._ctx.fillRect(matrix[i].x,matrix[i].y,matrix[i].width,matrix[i].height);
	  }
	}

	_tapLocation(tap){
		for (var i=0; i<=this._matrix.length; i++ ) {
		    if( tap.x >= this._matrix[i].x && tap.x <=this._matrix[i].x + this._matrix[i].width ) {
		     	if( tap.y >= this._matrix[i].y && tap.y <= this._matrix[i].y + this._matrix[i].height ) {
		    		return(this._matrix[i].id);
		    	}
		    }
		}
	}

	_handleDown(event) {
		let rect = this._canvas.getBoundingClientRect()
		let tap = {x: event.x - rect.left, y: event.y-rect.top}
		let currentStep = this._tapLocation(tap);
		this._enableCell(currentStep)
		
	}

	_enableCell(cell){
		if(this._matrix[cell].enabled === true){
	  		this._matrix[cell].enabled = false;
	  	} else {
	  		this._matrix[cell].enabled = true;
	  	}
	  	this._renderMatrix(this._matrix);

	}


	_handleUp(event) {

	}

	resize(lowest, octaves){
		this._keys = {}
		const MATRIX_COLS = 16
		const MATRIX_ROWS = 12

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
