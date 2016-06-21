#Child Process

`child_process`模块提供一种能力,不一样,但近似的方式来执行子进程,该能力主要通过`child_process.spawn()`方法提供。


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

默认,`stdin`,`stdout`,`stderr`管道在父Node.js进程和子进程之间建立。它能够通过一种无阻塞的方法传输数据。注意,
一些程序使用另外的方式,比如,line-bufferedI/O internally。不过,这并不影响Node.js,它意味着发送给子进程的数据
不会立即耗尽。

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