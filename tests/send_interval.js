const { Node } = require("../main")
const node = new Node("send-interval")


node.debug = 'join'

// node.core.on("join", (id, name, group) => {
//     console.log("Welcoming, ", name, id)
// })

const shouldSend = peer => {
    if (typeof peer !== 'object') return false
    if (typeof peer.evasive !== 'boolean') return false
    if (peer.evasive === true) return false
    return true

}

const sender = async () => {
    console.clear()
    let joined_peers = await node.join("test")
    if (typeof joined_peers === 'object' && Object.values(joined_peers).length > 0) {
        let values = Object.values(joined_peers)
        let isFalse = false
        for (var i = 0; i < values.length; i++) {
            if (shouldSend(values[i]) === false) {
                isFalse = true
                break
            }
        }
        if (isFalse === true) return setTimeout(await sender, 2000)
        else await node.send("test", "hello...")
    }
    else await node.send("test", "hello...")
    return setTimeout(await sender, 2000)
}

sender()


// case 1 - start send node, then start listen node --> works
// case 2 - start listen node, start send node --> works
// case 3 - send node running, stop listen node, restart listen node --> listener does not receive message
// case 4 - listen node running, stop send node, restart send node --> works

// Investigation - after case 3 occurs, all other cases break well... unless waiting for send node to resolve all evasive peers and re-enter joining loop


