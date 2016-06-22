#process

##process.nextTick(callback\[,arg]\[,...])
- callback \<Function>
- \[,arg]\[,...] \<any> 调用callback时传递的额外参数

`process.nextTick()`添加`callback`到 'next tick队列'。一旦当前时间循环转完,所有'next tick 队列'中的回调函数都将被执行。

它不是setTimeout(fn,0)的简单别名,它更有效。在随后的时间循环中它运行在所有I/O事件之前(包括timer)。

```
console.log('start');
process.nextTick(() => {
  console.log('nextTick callback');
});
console.log('scheduled');
// Output:
// start
// scheduled
// nextTick callback

```

在I/O发生之前,一个对象被创建之后,使用该API让用户来分配事件处理,是非常重要的。

```
function MyThing(options) {
  this.setupOptions(options);

  process.nextTick(() => {
    this.startDoingStuff();
  });
}

var thing = new MyThing();
thing.getReadyForStuff();

// thing.startDoingStuff() 将会在这里执行,而不是在创建对象的时候执行。

````
API将100%同步还是100%异步是非常重要的。看以下例子:

```
// 警告!不要这么干!这是非常不安全的!

function maybeSync(arg, cb) {
  if (arg) {
    cb();
    return;
  }

  fs.stat('file', cb);
}

````

该API在下面的情况下会非常危险:

```
maybeSync(true, () => {
  foo();
});
bar();

````

你搞不清楚foo()和bar()哪个会先执行。

下面的方法就好多了:

```
function definitelyAsync(arg, cb) {
  if (arg) {
    process.nextTick(cb);
    return;
  }

  fs.stat('file', cb);
}


````

注意:I/O被处理之前,每次通过时间循环都会将'next tick queue'中的方法全部执行完。结果,递归调用nextTick将在开始就阻断所有I/O,
像`while(true);`循环一样。




