const { Child } = require("./child")
const { Node } = require("./node")
const { up, down, last, log } = require('./rules')

function preserve(id) {
    try {
        let node = new Node(id)
        node.state = 0

        node.listen(id, (state, from) => {
            node.state = state
            let is_last = last(node)
            if (is_last) down(node)
            else if (parseInt(from) > parseInt(id)) down(node)
            else up(node)
            log(`id: ${id} | ${node.state}`)
        })
    } catch (error) {
        log(`preserve ${error}`)
    }
}

Child(preserve)