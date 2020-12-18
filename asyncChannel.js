const {
        TaskManager, Task, Feeder, Chimney, FeedArray, SimplePile
} = require('./goneBackToNext.js')
let ney = new Chimney((x)=>{
        console.info(x)
        return x
})
let feeder = new Feeder([], ()=>{
        let arr = []
        let i = 0
        while(i<90) {
                i++
                arr.push(Math.random())
        }
        return [0, arr]
})
let TM = new TaskManager(feeder,ney, (res, rej, dat, task)=>{
        let d = dat()
        console.log((d+1).toString())
        res(d+1)
})

while(true) {
        console.info('a:', ney.next())
}
