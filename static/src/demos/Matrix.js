import {MatrixInterface} from 'keyboard/MatrixInterface'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'

export class Matrix {
    constructor(container) {
        this.ai = new AI()
        this.keyboard = new MatrixInterface(container)
        this.sound = new Sound()
        this.sound.load()
        this.glow = new Glow(container)
        
        var demoTitle = "Matrix"
        var infoText = "Matrix demo is based on visualizing musical expression in different formats.  Using a 2D matrix to help understand ai note playback in relation to user input.  With the matrix you can easily select non sequential notes together to get a much more interesting ai feedback both musically and visually.  Half notes are mapped out vertically, with each octave of the note mapped out horizontally.  All other functions are similar to default demo."

        var demoTemplate = require("templates/matrix.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: demoTitle});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        document.getElementById("info-title").innerHTML = demoTitle
        document.getElementById("info-body").innerHTML = infoText
    }
    start() {
        this.keyboard.activate()

        var interruptSelect = document.getElementById("change-interrupt")
        interruptSelect.addEventListener("change", this.changeInterrupt.bind(this))

        var waitSelect = document.getElementById("change-wait")
        waitSelect.addEventListener("change", this.changeWait.bind(this))


        // Start listening
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

     changeInterrupt(event) {
        this.ai.setInterrupt(parseInt(event.target.value))
     }

     changeWait(event) {
        this.ai.setWait(parseInt(event.target.value))
     }
    }
