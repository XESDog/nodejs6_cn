#Readline

Readline模块允许你一行一行的处理流,在代码中通过`require('readline')`使用该模块。

注意,一旦你使用了该模块,Node.js程序将不能终止,直到你关闭该接口。

以下是如何让你的程序能够优雅的退出。

```
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log('Thank you for your valuable feedback:', answer);

  rl.close();
});


```

##类:接口

该类展示了一个带有`input`和`output`流的`readline`接口。

### rl.close()

关闭接口实例,放弃控制`input`和`output`流。`close`事件随之发送。

###rl.pause()

暂停`readline`的`input`流,在必要的时候允许它继续。

注意,并不会立即执行暂停流的事件。还有其他的事件可能会在触发`pause`之后一并触发,比如`line`。

###rl.prompt(\[preserveCursor])

准备`readline`的输入流,将当前`setPrompt`操作指向新的行,给用户提供一个新的写入地方。设置`preserverCursor`为`true`来阻止
光标位置重置为0。

如果已经暂停,该操作将继续输入流对`createInterface`的使用。

如果调用`createInferface`时`output`设置为`null`或`undefined`,该方法不可写。

###rl.question(query,callback)
预查询和用户callback回复。向用户显示查询,并在用户的响应被输出之后调用回调函数。

如果输入流已经被暂停,它将通过`createInterface`恢复。

如果调用`createInterface`的时候`output`被设置为`null`或`undefined`,什么都不会显示。

例:

```
rl.question('What is your favorite food?', (answer) => {
  console.log(`Oh, so your favorite food is ${answer}`);
});


```

###rl.resume()

恢复`readline`输入流

###rl.setPrompt(prompt)

设置提示,比如,在你在命令行运行`node`的时候,看到`>`,这个就是Node.js的提示。


###rl.write(data\[,key])

写入数据到输出流,除非在调用`createInterface`时`output`被设置为`null`或`undefined`。
`key`是一个用来展示顺序的对象,如果终端是TTY则可用。

这将恢复input流,如果此前它被暂停。

例:

```
rl.write('Delete me!');
// Simulate ctrl+u to delete the line written previously
rl.write(null, {ctrl: true, name: 'u'});

```


##事件

###Event:'close'

`function(){}`

当执行`close()`时调用。









