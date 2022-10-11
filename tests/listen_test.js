const { Node } = require("../main")
const node = new Node("test-listen")

node.debug = 'join'

<<<<<<< HEAD
// Run with `send_test` in separate process
node.listen("test", message => console.log(message))

node.joined("test").then(console.log)
=======
node.listen("test", message => {
    console.log('===========================================')
    console.log(message)
})
>>>>>>> basic-cote
