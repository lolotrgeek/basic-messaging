const { Node } = require("../main")
const node = new Node("test")
const node2 = new Node("test2")


const test = message => {
    console.log("Passed:", typeof message === 'object' && Object.values(message)[0].groups[0] === 'test')
    if(process) process.exit() 
}

node.join("test").then(console.log)
node2.join("test").then(test)