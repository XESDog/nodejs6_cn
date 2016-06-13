#Console
`console`模块提供了简单的debug控制台,类似于web浏览器提供的JavaScript控制台。

该模块导出两个特殊的组件:

- `Console`类,有这些方法,`console.log()`,`console.error()`,`console.warn()`能够用来写出任何的Node.js流

- 一个全局的`console`实例,设定写`stdout`,`stderr`。因为对象是全局的,你不必执行`require('console')`。

以下是使用`console`的例子:

```
console.log('hello world');
  // Prints: hello world, to stdout
console.log('hello %s', 'world');
  // Prints: hello world, to stdout
console.error(new Error('Whoops, something bad happened'));
  // Prints: [Error: Whoops, something bad happened], to stderr

const name = 'Will Robinson';
console.warn(`Danger ${name}! Danger!`);
  // Prints: Danger Will Robinson! Danger!, to stderr

```

使用`Console`类的例子:

```
const out = getStreamSomehow();
const err = getStreamSomehow();
const myConsole = new console.Console(out, err);

myConsole.log('hello world');
  // Prints: hello world, to out
myConsole.log('hello %s', 'world');
  // Prints: hello world, to out
myConsole.error(new Error('Whoops, something bad happened'));
  // Prints: [Error: Whoops, something bad happened], to err

const name = 'Will Robinson';
myConsole.warn(`Danger ${name}! Danger!`);
  // Prints: Danger Will Robinson! Danger!, to err

```

Console类从根本上是围绕浏览器的console对象设计的,但是,Node.js没打算精确的复制浏览器中console的所有方法。


##同步 vs 异步 Console

`console`方法是异步的,除非目标是一个文件。磁盘很快速,并且操作系统通常会使用write-back缓存。大块文件写入是比较罕见的,但是,也不是不可能。

##`Console`类

###new Console(stdout\[,stderr\])

###console.assert(value\[,messages\]\[,...\])

###console.dir(obj\[,options\])

###console.error(\[data\]\[,...\])

###console.info(\[data\]\[,...\])

###console.log(\[data\]\[,...\])

###console.time(label)

###console.warn(\[data\]\[,...\])

###console.timeEnd(label)

###console.trace(message\[,...\])

