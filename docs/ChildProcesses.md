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

