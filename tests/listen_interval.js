const { Node } = require("../main")
const node = new Node("test-listen")

node.debug = 'join'

node.listen("test", message => {console.log(message)})

// function isTooOld(time) {
//     return Date.now() - time > 10000
// }

// const listens = async () => {
//     if(!last_message || isTooOld(last_message)) {
//         await node.send("test", "ready")
//     }
//     return setTimeout( listens, 5000)
// }

// listens()