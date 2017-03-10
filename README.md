# DuetDemos
Demonstrations of explored AI musical concepts using Magenta/Tensorflow that draws from the AI Duet experiment

## General Dev Stuff
+ If you need to install a new node package for the frontend, make sure to use the --save flag so it gets added
to the package.js file for the rest of the team
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
## Creating a new Demo
+ Create new js file with demo name in static/src/demos
    - Ex: `static/src/demos/SecondDemo.js`

+ The js file needs to export a class and define a constructor for it

+ If the new demo needs to change the default appearance, also create a
handlebars template file in static/src/templates
    - Ex: `static/src/templates/seconddemo.hbs`
    - [Handlebars usage][http://handlebarsjs.com/]

+ If using a custom template, follow the example in the FirstDemo.js constructor
function to pass data to the template and add it to the page
    - Ex: from `demos/Firstdemo.js`
```javascript
    constructor(container){
        super()
        var demoTemplate = require("templates/firstdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "DEMO #1: PentaChronic"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)

// Note that the result of calling 'require' on the template file
// is a *function* which outputs HTML when given data to bind.
// In this case, the template only needs one piece of data, the 'title'.
```

+ App 'routes' are accessed using "/#{route name}"
    - Ex: `localhost:8080/#firstdemo`

+ The new demo class need to be imported in Main.js so we can call its constructor
and any methods from the Controller
    - Ex: `import {FirstDemo} from 'demos/FirstDemo'`

+ In the Controller class in Main.js, there needs to be a check for the new
demo's route in the Controller's start function, which is called on every page load
In `Main.js`
```javascript
        switch(this.route) {
            // ...

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
            //...
        }
```

+ The original app was implemented using keyDown and keyUp listeners in
Main.js. I have kept it this way but maybe we can decouple things more so there
is less need to change Main.js for every demo

+ Ideally, the Controller would only need to instantiate the right demo class and
call its start method
