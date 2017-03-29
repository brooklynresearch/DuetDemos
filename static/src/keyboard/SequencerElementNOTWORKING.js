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

	constructor(container, lowest=36, octaves=4){
		super()
		
		window.$ = window.jQuery = require("jquery");

		this._container = document.createElement('div')
		this._container.id = 'sequencer'
		container.setAttribute('touch-action', 'none')
		container.appendChild(this._container)

		//some default menu stuff
		container.addEventListener('pointerup', (e) => delete this._pointersDown[e.pointerId])
		container.addEventListener('contextmenu', this._absorbEvent.bind(this))

		this._keys = {}

		this._pointersDown = {}


		this._aiNotes = {}
		this._notes = {}
		
		this._canvas = document.createElement ('canvas');
		let canvas = this._canvas;
		
		this._ctx = canvas.getContext('2d');
		canvas.setAttribute('class', 'inteface');
				
		canvas.style.backgroundColor = 'none';
		var rows = 12
		var columns = 16
		
		var stepHeight = (document.getElementById("sequencer").offsetHeight / rows);
		var stepWidth = ((document.getElementById("sequencer").offsetWidth * .8) / columns);
		var slotSize = { width: stepWidth, height: stepHeight }
		canvas.width = columns * slotSize.width;
		canvas.height = rows * slotSize.height;

		document.getElementById('sequencer').appendChild(canvas);

		this._grid = []; 

		for (var i=0; i<= columns-1; i++){
		  for(var j=0; j<= rows-1; j++){
		    var cell = {
		      column: i, 
		      row: j, 
		      width: slotSize.width-4, 
		      height: slotSize.height-4, 
		      x: i * slotSize.width, 
		      y: j * slotSize.height, 
		      enabled: false,
		      hovering: false,
		    }
		    this._grid.push(cell);
			
		  }
		}
		
		for(var i=0; i<this._grid.length; i++){
			let step = document.createElement('div')
			step.classList.add('step')

			step.id = i.toString();
			step.style.width = `${this._grid[i].width}px`;
			step.style.height = `${this._grid[i].height}px`;
			step.style.top = `${this._grid[i].y}px`;
			step.style.left = `${this._grid[i].x}px`;

			this._container.appendChild(step);

			//console.log(step.id + " WIDTH: " + grid[i].width + ", HEIGHT: " + grid[i].height);
			//console.log(step.id + " WIDTH: " + step.style.width + ", HEIGHT: " + step.style.height);
			step.setAttribute('touch-action', 'none');

		}
		


		// function renderCells() {
		//   for (var i=0; i<=grid.length-1; i++) {
		//   	let step = document.getElementById(i);
		//   	console.log(step);
		//     if (grid[i].enabled === false){
		//     	//step.classList.add('stepOn');
		//     	//console.log("Goodbye: " + step.id);
		//     	//step.style.backgroundColor = "rgba(255,255,255,1)";
		//       	//ctx.fillStyle="rgba(255, 255, 255, 1)";
		//     } 
		//     else {
		//     	//step.classList.remove('stepOn');
		//     	//console.log("Hello: " + step.id);
		//       	//ctx.fillStyle="rgba(249, 187, 45, 1)";
		//     }
		//     //ctx.fillRect(grid[i].x,grid[i].y,grid[i].width,grid[i].height);
		//   }
		// }

		// renderCells();

		// function enableCell(cell){
		//   for(var i=0; i<=grid.length-1; i++) {
		//   	//let step = document.getElementById(i);
		//   	//console.log(step);
		//     if(cell.row == grid[i].row && cell.column == grid[i].column){
		//       if (grid[i].enabled === true){
		//         grid[i].enabled = false;
		//         //step.classList.add('stepOn');
		//         console.log("Goodbye: " + cell.row);
		//       }
		//       else {
		//          grid[i].enabled = true;
		//          //step.classList.remove('stepOn');
		//        	 console.log("We Are In: " + cell.row);
		//       }
		//     }
		//   }
		//   renderCells();
		// };

		// function enableHoveringCell(cell){
		//   for(var i=0; i<=grid.length-1; i++) {
		//     if(cell.row == grid[i].row && cell.column == grid[i].column){
		//         ctx.classList.add('hover');
		//     } else {
		//     	ctx.classList.remove('hover');
		//     }
		//   }
		//   renderCells();
		// };



		// var touchStarted = false; 
		// var touchX = 0; 
		// var touchY = 0;

		// function handleDown(e){
		//   //touchX = e.changedTouches[0].clientX;
		//   //touchY = e.changedTouches[0].clientY;
		//   var rect = canvas.getBoundingClientRect()
		//   touchX = e.x;
		//   touchY = e.y;
		//   touchStarted = true
		//   var cell = (getCell({ x: touchX-rect.left, y: touchY-rect.top}));
		//   enableCell(cell);
		//   console.log(cell);
		// }


		// function getCell(tap){
		//   for (i=0; i<=grid.length; i++){
		//     if (tap.x >= grid[i].x && tap.x <=grid[i].x + grid[i].width) {
		//       if(tap.y >= grid[i].y && tap.y <= grid[i].y + grid[i].height){
		//         return({row: grid[i].row, column:grid[i].column});
		//       }
		//     }
		//   }
		 
		// }


		// function CheckTap() {
		//      if (touchStarted === false) {
		//          var t = { x: touchX, y: touchY}
		//           getCell(t);
		//       }
		// }

		// function handleUp(e){
		// //   touchStarted = false
		// //   touchX = e.x;
		// //   touchY = e.y;
		  
		// //   //touchX = e.changedTouches[0].clientX;
		// //   //touchY = e.changedTouches[0].clientY;
		// //   setTimeout(CheckTap, 100); 
		// }


		// canvas.addEventListener('mousedown', handleDown);
		// //canvas.addEventListener('mousemove', handleDown);
		// canvas.addEventListener('mouseup', handleUp);
		// canvas.addEventListener('touchstart', handleDown);
		// //canvas.addEventListener('touchmove', handleMove);
		// canvas.addEventListener('touchend', handleUp);
		// canvas.addEventListener('touchcancel', handleUp);


	}



	resize(lowest, octaves){
		this._keys = {}

		const MATRIX_COLS = 16
		const MATRIX_ROWS = 12

		

		// clear the previous ones
		//this._container.innerHTML = '<div class="seqButton"></div>'
		
		// for(let x=0; x<MATRIX_COLS; x++){
		// 	for(let y=0; y<MATRIX_ROWS; y++){
		// 		let step = document.createElement('div')
		// 		step.classList.add('seqButton')
		// 		this._container.appendChild(step)

		// 		let xOffset = (x / MATRIX_COLS)
		// 		let yOffset = (y / MATRIX_ROWS)
		// 		step.style.left = `${xOffset * 100}%`
		// 		step.style.height = `${100/MATRIX_ROWS}%`
		// 		step.style.top = `${yOffset * 100}%`

		// 		step.id = (y * MATRIX_COLS) + x
		// 		step.setAttribute('touch-action', 'none')

		// 		/*
		// 		const fill = document.createElement('div')
		// 		fill.id = 'fill'
		// 		step.appendChild(fill)
		// 		*/

		// 		this._bindKeyEvents(step)
		// 		this._keys[(y * MATRIX_COLS) + x] = step
		// 	}
		// }
		


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
