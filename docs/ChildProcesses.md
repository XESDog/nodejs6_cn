#Child Process

[TOC]

`child_process`能够以一种近似但不同于[popen(3)](http://man7.org/linux/man-pages/man3/popen.3.html)的方式来生成子进程,
该功能主要由`child_process.spawn()`提供。

译者:popen(3)是linux中的命令。popen通过创建一个管道,forking,以及invoking shell来打开一个进程.
管道定义为单向的,参数type表明是读还是写,不能两者兼有。响应的产生的流也是只读或者只写。


```
const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

```

默认,`stdin`,`stdout`,`stderr`管道在父Node.js进程和生成的子进程之间建立。它能够通过一种无阻塞的方法传输数据。注意,
一些程序使用内部的 line-bufferedI/O。然而这并不影响Node.js,它意味着发送给子进程的数据不会立即销毁。

`child_process.spawn()`方法生成异步子进程,不会阻断Node.js事件循环。
`child_process.spawnSync()`方法提供一个一样的方法,只不过该方法是同步的,它能够阻断事件循环,直到生成的进程退出或者被终止。

为了方便,`child_process`模块提供少量的同步和异步方法来替代`child_process.spawn()`和`child_process.spawnSync()`。
注意它们的每个替代方法都是在`child_process.spawn()`和`child_process.spawnSync()`基础上实现的。

- `child_process.exec()`:生成一个shell并在该shell中运行一个命令,执行完成时传递`stdout`和`stderr`给回调函数。
- `child_process.execFile()`:类似`child_process.exec()`,区别在它在没有首先生成一个shell而是直接生成命令。
- `child_process.fork()`:生成一个新的Node.js进程,并调用指定模块与IPC通信信道建立允许父级和子级之间发送信息。
- `child_process.execSync()`:同步版的`child_process.exec()`,将会阻断Node.js事件循环。
- `child_process.execFileSync()`:同步版的`child_process.execFile()`,将会阻断Node.js事件循环。

在某些使用情况,像自动执行shell脚本,同步执行可能更加方便。大多数情况,当生成进程完成时,同步方法阻塞事件循环会对性能产生巨大影响。


## 异步进程创建

`child_process.spawn()` `child_process.fork` `child_process.exec()` `child_process.exeFile()` 这些方法跟其他Node.js API一样,符合典型的异步编程模式。

每个方法返回一个`ChildProcess`实例。该对象实现Node.js `EventEmitter` API。允许父进程注册侦听方法,当某个事件在子进程生命周期触发的时候执行。

`child_process.exec()` `child_process.execFile()`方法允许指定一个明确的`callback`方法,当子进程终止的时候执行。

### Windows中生成 `.bat` 和 `.cmd`文件

`child_process.exec()`和`child_proces.execFile()`的重要区别是基于平台的改变。在Unix类型的操作系统`child_process.exeFile()`更有效率,
因为它没有生成shell。在Windows平台,`.bat`和`.cmd`文件不能有在没有终端的情况下执行,因此使用`child_process.execFile()`将不能被执行,通常使用
`child_process.spawn()`加上`shell` option设置,使用`child_process.exec()`,或者生成`cmd.exe`并传递`.bat` `.cmd`文件和参数。

```
// On Windows Only ...
const spawn = require('child_process').spawn;
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data);
});

bat.stderr.on('data', (data) => {
  console.log(data);
});

bat.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});

// OR...
const exec = require('child_process').exec;
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

```

###child_process.exec(command\[,option]\[,callback])

- command \<String> 运行的命令,参数使用空格分开
- options \<Object>
    - `cwd` \<String> 子进程当前工作目录
    - `env` \<Object> 环境变量的键值对
    - `encoding` \<String> 默认为`utf8`
    - `shell` \<String> 要执行的命令(默认:UNIX下为`/bin/sh`,Windows下为`cmd.exe`)
    - `timeout` \<Number> 默认为0
    - `maxBuffer` \<Number> 允许stdout或stderr的最大数据量(单位:byte),超出的部分将被kill(默认:200*1024)
    - `killSIgnal` \<String> (默认:`SIGTERM`)
    - `uid` \<Number> 设置进程的用户标识
    - `gid` \<Number> 设置进程的组标识
- callback \<Function> 当进程终止时被执行并输出
    - error \<Error>
    - stdout \<String>|\<Buffer>
    - stderr \<String>|\<Buffer>
- Return:\<ChildProcess>


当执行的命令在shell里面的时候生成一个shell,缓存任何生成的输出。

```
const exec = require('child_process').exec;
exec('cat *.js bad_file | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

```

如果提供了callback。它将和参数(error,stdout,stderr)一起执行。执行成功error将为null。如果错误,error将是一个Error对象。
error.code属性为子进程的退出码,而error.signal将被设置为终止进程的信号。任何非0得退出码都将被认为是错误。

传递给callback的参数stdout和stderr将包括子进程的stdout和stderr。默认,Node.js将以utf8的方式解码输出并传递给callback。
encoding选项被用来指定解码stdout和stderr输出的字符编码。如果encoding是`buffer`,一个Buffer对象将被传递到callback。

options参数作为第二个参数,用来定义如何生成进程。默认选项为:

```
{
  encoding: 'utf8',
  timeout: 0,
  maxBuffer: 200*1024,
  killSignal: 'SIGTERM',
  cwd: null,
  env: null
}

```
如果设置timeout大于0,单子进程运行超过timeout毫秒之后,父进程将发送`killSignal`属性的信号标识(默认为`SIGTERM`)。

注意:不像POSIX系统调用,`child_process.exec()`没有代替已经存在的进程,而是使用一个shell来执行命令。



### child_process.execFile(file\[,arg]\[,options]\[,callback])

- file \<String> 可执行文件的名称,或运行的地址
- args \<Array> string参数列表
- options \<Object>
    - `cwd` \<String> 子进程当前工作目录
    - `env` \<Object> 环境变量的键值对
    - `encoding` \<String> 默认为`utf8`
    - `shell` \<String> 要执行的命令(默认:UNIX下为`/bin/sh`,Windows下为`cmd.exe`)
    - `timeout` \<Number> 默认为0
    - `maxBuffer` \<Number> 允许stdout或stderr的最大数据量(单位:byte),超出的部分将被kill(默认:200*1024)
    - `killSIgnal` \<String> (默认:`SIGTERM`)
    - `uid` \<Number> 设置进程的用户标识
    - `gid` \<Number> 设置进程的组标识
- callback \<Function> 当进程终止时被执行并输出
    - error \<Error>
    - stdout \<String>|\<Buffer>
    - stderr \<String>|\<Buffer>
- Return:\<ChildProcess>

child_process.execFile()方法类似child_process.exec(),区别在它不生成一个shell。当然,指定的可执行文件像一个新进程被直接生成,
使得相比child_process.exec()更加有效率一点。

同样也支持options参数。由于没有生成一个shell,一些行为像I/O重定向以及文件通配符都不被支持。

```
const execFile = require('child_process').execFile;
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});

```

传递给callback的参数stdout和stderr将包括子进程的stdout和stderr。默认,Node.js将以utf8的方式解码输出并传递给callback。
encoding选项被用来指定解码stdout和stderr输出的字符编码。如果encoding是`buffer`,一个Buffer对象将被传递到callback。

###child_process.fork(modulePath\[,arg]\[,options])

- modulePath \<String> 该模版在子进程中运行
- args \<Array> string参数列表
- options \<Object>
    - `cwd` \<String> 子进程当前工作目录
    - `env` \<Object> 环境变量的键值对
    - `execPath` \<String> 用来创建可执行的子进程
    - `execArgv` \<Array> 传递给可执行子进程的string参数列表(默认:process.execArgv)
    - `silent` \<Boolean> 如果为true,stdin,stdout,stderr将建立子进程到父进程的管道,否则将从父进程继承,
    参考child_process.spawn()的`stdio`的`pipe`和`inherit`参数来了解更多(默认:false)
    - `uid` \<Number> 设置进程的用户标识
    - `gid` \<Number> 设置进程的组标识
- callback \<Function> 当进程终止时被执行并输出
    - error \<Error>
    - stdout \<String>|\<Buffer>
    - stderr \<String>|\<Buffer>
- Return:\<ChildProcess>

`child_process.fork()`方法是`child_process.spawn()`的一个特殊情况,用来明确的创建一个新的Node.js进程。
`child_process.spawn()`将返回一个ChildProcess对象。该返回对象将构建子和父之间的双向通信信道。查看`child.send()`了解更多。

需要记住,生成Node.js子进程不依赖父进程,除非IPC通信信道简历在两者之间。每个进程有其自己的内存,和他们自己的V8实例。
由于额外的资源分配请求,不推荐生成多个Node.js子进程。

默认,child_process.fork()将生成新的Node.js实例,使用父进程的process.execPath。options里面的execPath属性允许使用另外的执行路径。

通过自定义execPath执行得到的Node.js进程,将和父进程使用子进程的环境变量NODE_CHANNEL_FD定义的标识进行通讯。
fd上的输入和输出被期望行分(line delimited)JSON对象。

注意:不同于fork POSIX 系统调用,child_process.fork()不clone当前进程。

###child_process.spawn(command,\[,arg]\[,options])

- command \<String> 运行的命令
- args \<Array> string参数列表
- options \<Object>
    - cwd \<String> 当前子进程的工作目录
    - env \<Object> 环境变量的键值对
    - stdio \<Array> | \<String> 子进程的 stdio 配置. (See options.stdio)
    - detached \<Boolean> 预备将子进程独立于父进程运行. 具体行为区别于平台, (see options.detached)
    - uid \<Number> 设置进程的用户标识 (See setuid(2).)
    - gid \<Number> 设置进程的组标识 (See setgid(2).)
    - shell \<Boolean> | \<String> 如果为true,在shell中运行命令,UNIX使用`/bin/sh`,Windows使用`cmd.exe`。
    一个不同的shell使用字符串来指定。shell应该明白UNIX中的-c,或Windows中的/s /c。默认为false(没有shell)
- return:\<ChildProcess>

child_process.spawn()方法使用提供的命令生成一个新的进程,参数在args中指出。如果忽略,args默认为空数组。

第三个参数被用来指定额外的选项,默认为:
```
{
    cwd:undefined,
    env:process.env
}

```

使用cwd指定工作目录









