const StringToMath=require('./StringToMath.js');

function integral(f_string, from=0, to=1, steps = 100) {
    let f = new StringToMath(f_string).result;
    let stepLength = (to - from) / steps;
    let s = 0;
    for (let i = 0; i < steps; i++) {
        s += f(from + stepLength * i) * stepLength;
    }
    return s;
}

module.exports=integral;
// console.log(integral("sin(x)").toFixed(2));
