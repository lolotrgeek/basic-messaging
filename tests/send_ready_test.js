const { Node } = require("../main")
const node_send = new Node("test")
const node_listen = new Node("listen")

node_listen.debug = 'join'
node_send.debug = 'join'

setTimeout(() => node_send.join("test"), 1000)

const test = message => {
    console.log("Passed:", message === "hello!")
    if(process) process.exit() 
}

node_listen.listen("test", test).then(ready => {
    console.log(ready)
    node_send.send("test", "hello!")
})

