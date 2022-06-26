const { Node } = require("../main")


let node = new Node()
console.log("name:", node.core._name)
console.log("id:", node.core.getIdentity())