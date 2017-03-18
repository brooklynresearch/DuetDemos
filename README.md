# DuetDemos
Demonstrations of explored AI musical concepts using Magenta/Tensorflow that draws from the AI Duet experiment

## Demo Status (Friday 3/17)
+ I just merged the Quantizer and Arpeggiator demos into master so everyone can try them out.

+ Pentatonic (still called 'firstdemo', need to change) and Arpeggiator demos are functioning.

+ Might be nice for those two to have something in the interface to change scales. Maybe just major/minor to keep it simple.

+ There is an example here of how the Arpeggiator could work with a grid-based UI for selecting the note-pattern:
    - [https://github.com/Tonejs/Tone.js/blob/master/examples/stepSequencer.html]

+ Quantizer Demo is nearly there, I think? It **is** quantizing, but it always delays notes, even if you're playing along with the beat.
So if you match the drum track, the output will be on the off beats or the up beats or whatever.
If anyone wants to work on this here are the resources I've been basing things on so far:
    - [https://tonejs.github.io/docs/#Time]
    - [https://github.com/Tonejs/Tone.js/blob/master/examples/quantization.html]

+ One thought I had was that quantizing may work better if we try using Tone's own sampler instead of the one included with the ai demo.
    - [https://tonejs.github.io/docs/#Sampler]

+ If anyone wants to try using custom samples instead of the included piano sounds, there are tons of royalty-free ones here:
    - [http://www.musicradar.com/news/tech/free-music-samples-download-loops-hits-and-multis-627820]

## General Dev Stuff
+ If you need to install a new node package for the frontend, make sure to use the --save flag so it gets added
to the package.js file for the rest of the team.
    - `npm install { some package } --save`

+ When you make changes to the frontend, Webpack will need to compile everything again.
While developing, **do not use the '-p' flag** as shown in the original app instructions.
'-p' stands for 'Production' and it is very slow due to all the optimization it tries to do.
Try using `webpack --watch` in its own terminal session. This will re-pack everything when
any files are changed and is pretty quick.

+ General Javascript thing I always forget:
```javascript
/* Whenever you want to do something like this */
function someFunction(param) {
    return param * param
}
var result = someFunction(param) // save a result to a variable
otherFunction(result) // Use it "afterwards." Result var may still have no value

/* Do this instead */
function betterFunction(param, callback) {
    callback(param * param)
}

betterFunction(param, (result) => {
    otherFunction(result)
})
```
## Creating Demos
### I made a blank demo class to demonstrate. It behaves exactly like the default demo. Have a look at these files:
+ src/demos/BlankDemo.js
+ src/templates/blankdemo.hbs
+ src/Main.js

+ You can see this demo in the browser at [localhost:8080/].

### Steps to make a New Demo
+ Create new js file with demo name in static/src/demos
    - Ex: `static/src/demos/BlankDemo.js`

This file needs import statements for all of the classes it uses. To implement the
standart duet demo these are:
```javascript
import events from 'events'
import Tone from 'Tone/core/Tone'
import {Keyboard} from 'keyboard/Keyboard'
import {AI} from 'ai/AI'
import {Sound} from 'sound/Sound'
import {Glow} from 'interface/Glow'
```

+ The js file needs to export a class with a constructor

+ If the new demo needs to change the default appearance, also create a
handlebars template file in static/src/templates
    - Ex: `static/src/templates/blankdemo.hbs`
    - [Handlebars usage][http://handlebarsjs.com/]

+ If using a custom template, follow the example in the FirstDemo.js constructor
function to pass data to the template and add it to the page
    - Ex: from `demos/BlankDemo.js`
```javascript
    constructor(container){
        var demoTemplate = require("templates/blankdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "BLANK DEMO: A Demo of a Demo"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

// Note that the result of calling 'require' on the template file
// is a *function* which outputs HTML when given data to bind.
// In this case, the template only needs one piece of data, the 'title'.
// Also I kept the id 'tutorial' so it would use those CSS rules
```

+ The demo class should also define a `start()` function that will start listeners
for key press and release and send note data to the Sound and AI objects.
In `demo/BlankDemo.js`:
```javascript
     start() {
        this.keyboard.activate()
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
// The Glow object is the background color that changes to yellow when the AI
// is playing
```

+ App 'routes' are accessed in the browser using "/#{route name}".
    - Ex: `localhost:8080/#blankdemo`

+ The new demo class needs to be imported in Main.js so we can call its constructor
and any methods from the Controller.
    - Ex: `import {BlankDemo} from 'demos/BlankDemo'`

+ In the Controller class in Main.js, there needs to be a check for the new
demo's route in the Controller's start function, which is called on every page load.
In `Main.js`
```javascript
        switch(this.route) {
            case "#tutorial": // TUTORIAL
                const tutorial = new Tutorial(this.container)
                tutorial.start()
                break;

            case "#firstdemo": // FIRST DEMO
                const firstDemo = new FirstDemo(this.container)
                firstDemo.start()
               break;

            default:
                const blankDemo = new BlankDemo(this.container)
                blankDemo.start()
                break;
        }
```

+ Ideally, the Controller will only need to instantiate a demo class and
call its start method.
