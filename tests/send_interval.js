const { Node } = require("../main")
const node = new Node("send-interval")

node.debug = 'join'


function sender() {
    node.send("test", `${node.core.getIdentity()}`).then(() => setTimeout(sender, 2000))
}

sender()


