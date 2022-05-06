const { Node } = require("../src/network")

const node1 = new Node(message => console.log("received", message))
setInterval( () => node1.send("Hello"), 1000)
