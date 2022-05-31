// spawn lots of nodes, they ping for neighbors and each build a neighbor graph
const path = require('path')
const fs = require('fs')
const { fork } = require('child_process')

const file = "/ping_test.js"
const directoryPath = path.join(__dirname)
const nodes = 10
let count = 0
while (count < nodes) {
    if (count >= nodes) break
    let child = fork(directoryPath + file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    // console.log(child)
    console.log(count)
    count++
}
