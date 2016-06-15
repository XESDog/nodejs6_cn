#Timers

所有timer的方法都是全局的。你不必使用`require()`就能使用它们。

##clearImmediate(immediateObject)
停止一个`immediateObject`,该对象通过`setImmediate`创建。

##clearInterval(intervalObject)
停止一个`intervalObject`,该对象通过`setInterval`创建。

##clearTimeout(timeoutObject)
阻止一个`timeoutObject`,该对象通过`setTimeout`创建。

##ref()
如果此前执行过unref(),此时ref()被调用来明确请求timer保持程序打开。如果已经执行了`ref`,再次执行不会有任何效果。

##setImmediate(callback\[,arg]\[,...])
I/O事件调用之前和timer通过setTimeout和setInterval触发之后,安排一个'立即'执行回调。
返回一个immediateObject,后期可能会被clearImmediate使用。额外的可选参数也可能被传递到回调函数中。

立即执行的回调函数根据他们被创建的顺序,被存放在一个队列中。
在每个循环迭代中所有的回调队列都要被处理。
如果一个新的`immediate`在执行回调的时候被添加到队列,那么在下一个loop之前,它是不会被执行的。

如果callback不是一个function,setImmediate()将立刻抛出异常。

##setInterval(callback,delay\[,arg]\[,...])

安排一个每delay毫秒执行一次的callback。返回一个intervalObject,该对象在clearInterval()的时候回被使用。
额外的可选项会被添加到callback中。

如果callback不是方法,setInterval()将立刻抛出异常。

##setTimeout(callback,delay\[,arg]\[,...])

安排一个delay毫秒之后执行一次的callback。



