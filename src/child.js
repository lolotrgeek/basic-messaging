
/**
 * Convert a function into a subprocess
 * @param {function} service the function to be converted
 */
 function Service(service) {
    if (process.send) process.send({ starting: service.name })
    try {
        service()
    } catch (error) {
        process.send(error)
        process.exit()
    }

    process.on('message', message => {
        
    })
}