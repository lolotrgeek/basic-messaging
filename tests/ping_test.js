const { Node } = require("../main")

let pinger = new Node()
setInterval(() => pinger.ping_all() ,5000)
