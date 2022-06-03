const path = require('path')
const { fork } = require('child_process')

const debug = false
let nodes = []

function set_node(id) {
    let dir = path.join(__dirname)
    let file = dir+"/node_preserve.js"
    if(id === 1) file = dir+"/node_invert.js"
    return {file, id}
}

function start_node({file, id}) {
    let node = fork(file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    node.on('message', message => console.log(message))
    node.on("close", code => console.log(`child node ${id} process exited with code ${code}`))
    node.send({ id })
    nodes.push(node)
}

function spawn_node(number) {
    if(debug) console.log(`Starting node ${nodes.length + 1}/${number}`)
    start_node(set_node(nodes.length + 1))
    if(nodes.length < number) setTimeout(() => spawn_node(number), 500)
    
}

module.exports = { spawn_node }