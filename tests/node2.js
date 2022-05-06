const { Node } = require("../src/network")

const node2 = new Node(message => console.log("received", message))
setInterval( () => node2.send("World!"), 1000)