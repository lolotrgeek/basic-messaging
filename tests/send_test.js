const { Node } = require("../main")
<<<<<<< HEAD
const node = new Node("test-send")
node.debug = 'join'
// Run with `listen_test` in separate process
node.send("test", "Hello!")

=======
const node = new Node("send-interval")

node.debug = 'join'


function sender() {
    node.send("test", `hello!`)
    setTimeout(sender, 2000)
}

sender()
>>>>>>> basic-cote
