const { Node } = require("../main")
const node = new Node("test")

node.started.then(() => console.log("Passed:", true)).catch(error => console.log("Passed:", false))

