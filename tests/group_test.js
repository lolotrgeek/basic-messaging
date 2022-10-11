const { Node } = require("../main")

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
