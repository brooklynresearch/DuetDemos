export class BlankDemo {
    constructor(container) {
        var demoTemplate = require("templates/blankdemo.hbs");
        this.element = document.createElement('div')
        this.element.innerHTML = demoTemplate({title: "Blank Demo: A Demo of a Demo"});
        this.element.id = 'tutorial'
        container.appendChild(this.element)
    }

    start() { }
}
