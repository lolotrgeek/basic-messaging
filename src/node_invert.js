const { Child } = require("./child")
const { Node } = require("./node")
const { up, start, log } = require('./rules')

function invert(id) {
    try {
        let node = new Node(id)
        node.state = 0
        start(node)

        const invert_state = state => {
            if(state === 0) return 1
            else return 0
        }

        node.listen(id, state => {
            node.state = invert_state(parseInt(state))
            up(node)
            log(`id: ${id} | ${node.state}`)
        })
    } catch (error) {
        log(`invert ${error}`)
    }

}

Child(invert)