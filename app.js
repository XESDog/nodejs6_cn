/**
 * Created by work on 16/7/12.
 */

var p1 = new Promise((resolve, reject)=> {
        if (true) {
            resolve();
        } else {
            reject();
        }
    }
);


p1 = p1.then(()=> {
    return 1
})
for (var i = 0; i < 10; i++) {
    p1=p1.then(value=>value+1);
}
p1.then(value=>console.log(value));





