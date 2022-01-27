const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn){
    // 当前promise的执行状态
    var state = PENDING;

    // value变量存储执行成功后的返回值，或执行失败的错误提示
    var value = null;
    // 存储将来用.then()函数传入的一个或多个后续任务
    var handlers = []
    doResolve(fn, resolve, reject)

    function fullfill(result){
        state = FULFILLED
        value = result
        // 执行fullfilled相关的处理函数
        handlers.forEach(handler=>handle(handler))
    }

    function reject(error){
        state = REJECTED
        value = error
        // 执行rejected相关的处理函数
        handlers.forEach(handler=>handle(handler))
    }
    function resolve(result){
        try {
            var then = getThen(result)
            if(then){
                doResolve(then.bind(result), resolve, reject)
                return 
            }
            fullfill(result)
        } catch (error) {
            reject(error)
        }
    }

    function doResolve(fn, onFullfilled, onRejected){
        var done = false
        try {
            fn(
                function(value){
                    if(done){return}
                    done = true;
                    onFullfilled(value)
                },
                function(reason){
                    if(done){return;}
                    done = true;
                    onRejected(reason)
                }
            )
        } catch (error) {
            if(done){return}
            done = true;
            onRejected(error)
        }
    }

    function getThen(value){
        var t = typeof value
        if(value&&(t==='object'||t==='function')){
            var then = value.then;
            if(typeof then ==='function'){
                return then;
            }
        }
        return null
    }
    function handle(handler){
        if(state === PENDING){
            handlers.push(handler)
        }else{
            if(state===FULFILLED&&typeof handler.onFullfilled==='function'){
                handler.onFullfilled(value)
            }
            if(state===REJECTED&&typeof handler.onRejected==='function'){
                handler.onRejected(value)
            }
        }
    }
    this.done = function(onFullfilled, onRejected){
        setTimeout(function(){
            handle({
                onFullfilled,
                onRejected
            })
        },0)
    }
    this.then = function(onFullfilled, onRejected){
        var self = this;
        return new Promise(function(resolve, reject){
            return self.done(
                function(result){
                    if(typeof onFullfilled==='function'){
                        try {
                            return resolve(onFullfilled(result))
                        } catch (error) {
                            return reject(error)
                        }
                    }
                },
                function(error){
                    if(typeof onRejected === 'function'){
                        try {
                            return resolve(onRejected(error))
                        } catch (error) {
                            return reject(error)
                        }
                    }else{
                        return reject(error)
                    }
                }
            )
        })
    }
}

console.log('start')
new Promise((resolve, reject)=>{
    setTimeout(()=>{
        console.log('promise')
        // resolve(111)
        reject('出错了')
    },5000)
}).then(
    res=>{
        console.log(res)
    },
    error=>{
        console.log(error)
    }
)
console.log('end')