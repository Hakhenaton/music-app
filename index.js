let i = 0

function increment(i){
    i++
}

increment(i)
// console.log(i)

let aggr = {}

let obj = { foo: 1 }

aggr.subObj = obj

delete aggr.subObj.foo

console.log(obj)