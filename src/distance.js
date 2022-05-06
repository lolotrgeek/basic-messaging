
function run () {
    let start = Date.now()
    let end
    setTimeout(() => {
        end = Date.now()
        console.log(end - start)
    },1000)
    
}

let x = true
while(x === true) {
    run()
}