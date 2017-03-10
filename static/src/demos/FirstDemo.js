import events from 'events'
import Tone from 'Tone/core/Tone'

export class FirstDemo extends events.EventEmitter{
    constructor(container){
        super()
        var demoTemplate = require("templates/firstdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "DEMO #1: PentaChronic"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

        this.pentaNotes = [0,12,24,36,48,60,72,84,96,108,120,    // C
                           2,14,26,38,50,62,74,86,98,110,122,    // D
                           4,16,28,40,52,64,76,88,100,112,124,   // E
                           7,19,31,43,55,67,79,91,103,115,127,   // G
                           9,21,33,45,57,69,81,93,105,117,129];  // A
    }

    start(){}

    makePenta(note, callback) {
        if (this.pentaNotes.indexOf(note) === -1) {
            var closest = this.pentaNotes[0]
            var i = 0;
            this.pentaNotes.forEach((pNote) => {
                if (Math.abs(pNote - note) < Math.abs(closest-note)) {
                    closest = pNote
                }
                if (i === this.pentaNotes.length-1) {
                    console.log("NEW NOTE", closest)
                    callback(closest)
                }
                i++;
            })
        } else {
            console.log("SAME NOTE", note)
            callback(note)
        }
    }
}
