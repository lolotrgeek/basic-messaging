const { Node } = require("../main")
const node = new Node("test-listen")

node.debug = 'join'

node.listen("test", message => {
    console.log('===========================================')
    console.log(message)
})