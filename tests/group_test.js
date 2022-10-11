const { Node } = require("../main")
<<<<<<< HEAD
const node = new Node("test")
const node2 = new Node("test2")
node.debug = 'join'
node2.debug = 'join'

const test = message => {
    console.log("Passed:", typeof message === 'object' && Object.values(message)[0].groups[0] === 'test')
    if(process) process.exit() 
}

node.join("test").then(console.log)
node2.join("test").then(test)
=======

const node  = new Node()
const node2  = new Node()

const heard = message => console.log(`Heard: ${message}`)
node.listen("hello", heard)
node.listen("test", heard)
node.listen("alright", heard)

setTimeout(() => node2.listen("*", heard), 1000)

setInterval(() => {
    console.log("sending hello")
    node.send("hello", "world")
}, 2000)
//fails if we do not hear "world"
>>>>>>> basic-cote
