const { Node } = require("../main")
const node = new Node("test-listen")

node.debug = 'join'
let last_message
node.listen("test", message => {last_message === Date.now(); console.log(message)})

function isTooOld(time) {
    return Date.now() - time > 10000
}

const listens = async () => {
    if(!last_message || isTooOld(last_message)) {
        await node.send("test", "ready")
    }
    return setTimeout( listens, 5000)
}

listens()