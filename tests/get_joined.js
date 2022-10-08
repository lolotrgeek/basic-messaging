const { Node } = require("../main")
const node = new Node("send-interval")

const get_joined = async () => {
    console.clear()
    await node.join("test")
    let joined = await node.joined("test")
    console.log(Object.values(joined))
    // console.log(Object.values(joined).map(peer => typeof peer ==='object' && typeof peer.evasive === 'boolean' ? peer.evasive : {}))
    return setTimeout(get_joined, 2000)
}

get_joined()