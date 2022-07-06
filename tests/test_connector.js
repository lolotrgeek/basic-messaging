const { Connector } = require("../src/connector")

let connector = new Connector("world")
connector.listen(data => connector.core.log(message))



setTimeout(() => {
    console.log(connector.core.server)
    // connector.send(connector.name, "hello!")
}, 1500)