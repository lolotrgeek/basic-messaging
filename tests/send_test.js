const { Node } = require("../main")
const node = new Node("test-send")
node.debug = 'join'
// Run with `listen_test` in separate process
node.send("test", "Hello!")

