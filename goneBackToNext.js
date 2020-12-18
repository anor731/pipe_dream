class FeedStackArray {
// Array that is stacking on pile, until certain value is reached, that is periodically cleaned. 
// By using correct argument, we can create not or, but xor here.
        constructor(args={
                water: 42,
                callback: (aggregate)=>{
                        return aggregate
                },
                timeOut: 231
        }) {
                this.args = args
                this.arr = []
                this.timeout = setTimeout(()=>{
                        callback(this.prepare())
                })
                this.counter=[0,0]               
        }
        put(val) {
                this.counter[0]++
                if(this.arr.length>this.water) {
                        this.callback(this.prepare())
                }
        }
        tick() {
                this.callback(this.prepare())
        }
        affectTimeout(fn) {
                this.timeout = fn(this.timeout)
        }
        changeWater(n) {
                this.water = n
        }
        prepare() {
                this.counter[1]++
                let x
                let ar = []
                while(x=this.arr.shift()) {
                        ar.push(x)
                }
                return ar                
        }
        
}


const Pour = (x, amount = 1024**5)=>{
        let i = 0
        let b
        let arr
        while(b=x.shift()&&i<amount) {
                i++
                arr.push(b)
        }
        return arr
}


class SimplePile {
        constructor(tm) {
                this.tm = tm
                this.arr = []
        }
        put(val) {
                this.arr.push(val) 
                tm.tick()
        }
        createFeeder() {
                return ()=>{
                        let ar = this.getABunch()
                        return [(this.arr.length===0), ar]
                }
        }
        getABunch() {
                return Pour(this.arr, this.feeded)
        }
        setFeeded(n) {
                this.feeded=n
        }
}

class Feeder {
        constructor(arr, fill = (n)=>{return [1, []]}, water = [42, 84], tm) {
                this.arr = arr
                this.i = 0
                this.ii = 0
                this.lowWater = water[0]
                this.highWater = water[1]
                this.fill = fill
                this.flushFn = ()=>{tm.tick()}
                this.toBeDone = 0
                this.donex = false
                
        }
        get water() {
                this.arr.length
        }
        changeWater(n) {
                this.lowWater = n[0]
                this.highWater = n[1]
        }
        put(...vals) {
                if(vals.length+this.arr.length>this.water[1]) {
                        this.flushFn()
                }
                this.arr = this.arr.concat(vals)
        }
        setFlushFn(fn) {
                this.flushFn = fn
        }
        xfill() {
                let fill = this.fill(this.highWater[1]-this.arr.length)
                
                this.toBeDone = fill[0]
                let b 
                while(b=fill[1].shift()) {
                        this.arr.push(b)
                }
        }
        next() {
                this.i++
                if(this.i%(2**31)==0) {
                        this.i = 0
                        this.ii++
                }
                if(this.toBeDone>0&&this.arr.length===1) {
                        this.donex = true
                }
                if(this.arr.length<=this.lowWater) {this.xfill()}
                return this.arr.shift()
        }
        getFunctionalIterator() {
                return ()=>{
                        return this.next()
                }
        }
}

class Chimney {
        constructor(fn=(x)=>{return x}, water=[54, 84, 64]) {
                this.water = water
                this.fn = fn
                this.arr = []
                this.open = true
        }
        setTM(val) {
                this.tm = val
        }
        setStop(fn) {
                this.stopFn = fn
        }
        setNext(fn) {
                this.nextFn = fn
        }
        setFlushFn(fn) {
                this.flushFn = fn
        }
        next() {
        
                if(((this.water[0])>this.arr.length)&&(this.tm.feed.toBeDone==0)) {
                        this.nextFn()
                }
                if(this.arr.length>0) {
                        let ver = this.arr.pop()
                        return this.fn(ver)               
                }
                
        }
        blow(val) {
                if(this.water[2]<=this.arr.length) {
                        this.flushFn()
                }
                if(this.water[1]<=this.arr.length) {
                        this.stopFn()
                }
                this.arr.unshift(val)
        }
}

class Task {
        constructor(tm, fn, counter, finalize = ()=>{}, reso=()=>{}, reje=()=>{} ) {
                this.counter = counter
                this.reso = reso
                this.reje = reje
                this.finalize = finalize
                this.tm = tm
                this.fn = fn
                this.donex = false
                this.promise = 0
                this.result = null
        }
        destroy() {
                delete this
        }       
        launchPromise() {
                let fn = this.fn    
                this.promise = new Promise((res, rej)=>{
                                let f = (x)=>{
                                        this.finalize(this,this.reso(x), x)
                                        this.tm.oneGone()    
                                        this.done()
                                        res(x)
                                }
                                let r = (x)=>{
                                        this.finalize(this,this.reje(x), x)
                                        this.tm.oneGone()
                                        this.done()
                                        rej(x)
                                }
                                fn(f, r, this.tm.feed.getFunctionalIterator(), this)
                 }).then(
                        (res)=>{                                
                                this.result = res
                                return res
                        },
                        (rej)=>{
                                this.result = rej
                                return rej
                        }
                 ).finally((r)=>{
                        this.tm.next()
                 })
        }
        correct(bo) {
                this.correct = bo
        }        
        done() {
                this.donex = true
        }
}

class TaskManager {
        constructor(feed, out, fn, args) {
                let Args = { maxTasks:23, finalize:()=>{}, reso:()=>{}, reje:()=>{}, returnPromise:false, raw:true, id: 0}
                Object.assign(Args, args)
                args = Args
                this.feed = feed
                this.args = args
                this.couter = 0
                this.setTask(fn)   
                this.out = out
                this.fullExhaust=false
                this.out.setStop(()=>{this.fullExhaust=true})   
                this.out.setNext(()=>{this.tick()})
                this.out.setTM(this) 
                this.tasks = 0 
                this.taskPool = []
        }
        setMaxTask(n) {
                this.args.maxTasks = 23
        }
        setTask(fn) {
                this.fn = fn
        }
        createTask() {
                return new Task(this, this.fn, this.counter, this.args.finalize, this.args.reso, this.args.reje)
        }
        next() {
                this.tick()
        }
        oneGone() {
                this.tasks = this.tasks - 1
        }
        tick() {
                if(this.tasks<this.args.maxTasks) {
                        return this.nextExhaust()
                } else { 
                        return -1 
                }
        }
        nextExhaust() {        
                let task = this.nextReal()
                let result = task.result
                task.destroy()
                if(!this.fullExhaust) return result 
        }
        nextReal() {
                let task
                this.counter++
                if(typeof this.args.fnFeed!=='undefined') {
                        this.fn = this.args.fnFeed()
                }
                if(!this.feed.donex){
                        this.tasks = this.tasks + 1
                        task = this.createTask()
                        task.launchPromise()
                        this.taskPool.push(task)
                        this.taskPool = this.taskPool.filter((task)=>{
                                return task.donex?false:true
                        })
                }
                return task
        }
}

module.exports = {
        TaskManager, Task, Feeder, Chimney, SimplePile
}
