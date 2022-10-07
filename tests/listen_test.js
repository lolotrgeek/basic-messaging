const { Node } = require("../main")
const node = new Node("test-listen")

// Run with `send_test` in separate process
node.listen("test", message => console.log(message))

