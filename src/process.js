const { fork } = require('child_process')

class Node {
    constructor(name) {
        this.children = []
        this.file = './child.js'
    }

    start() {
        let child = fork(this.file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
        this.children.push(child)
    }

    listen(child) {
        child.on('message', message => {
            console.log(message)
            // relay message???
        })
        child.on("close", code => {
            console.log("child process exited with code " + code)
        })
    }

    send(message) {
        this.children.map(child => {
            child.send(message)
            return child
        })
    }

    child(){

    }

}


module.exports = { Node }