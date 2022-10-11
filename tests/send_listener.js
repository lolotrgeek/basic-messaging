const { Node } = require("../main")
const node = new Node("send-listener")

node.debug = 'join'

node.listen("test", message => { console.log(message) })

function sender() {
    node.send("test", "hello World!")
    setTimeout(sender, 2000)
}

sender()
