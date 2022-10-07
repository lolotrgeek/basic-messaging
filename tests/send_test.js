const { Node } = require("../main")
const node = new Node("test-send")

// Run with `listen_test` in separate process
node.send("test", "Hello!")

