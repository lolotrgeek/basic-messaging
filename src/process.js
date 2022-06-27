const path = require('path')
const { fork } = require('child_process')
const { table } = require('table')

const debug = false
let nodes = []
let boards = []

function set_node() {
    let dir = path.join(__dirname)
    let file = dir + "/oscillate.js"
    return { file }
}

// board [[['name']]]

const col_config = {
    drawVerticalLine: (lineIndex, columnCount) => {
        return lineIndex === 0 || lineIndex === columnCount
      }    
}

function dashboard(message) {
    if (Array.isArray(message)) {
        let found = boards.findIndex(board => board[0][0][0] && board[0][0][0] === message[0][0][0])
        if (found > -1) boards[found] = message
        console.log(message)
        boards.push(message)
        let dash = boards.map(board => [table(board[0], col_config), table(board[1], col_config), table(board[2], col_config)])
        console.clear()
        console.log(table(dash))
    } else {
        console.log(message)
    }
}

function start_node({ file }) {
    let node = fork(file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    node.on('message', dashboard)
    node.on("close", code => console.log(`child node process exited with code ${code}`))
    node.send({ start: true })
    nodes.push(node)
}

function spawn_node(number) {
    if (debug) console.log(`Starting node ${nodes.length + 1}/${number}`)
    start_node(set_node())
    if (nodes.length < number) setTimeout(() => spawn_node(number), 500)

}

module.exports = { spawn_node }