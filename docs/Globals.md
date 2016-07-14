#Global Objects

这些对象在所有的模版中可见。一些对象并不是真的在全局范围但在模版范围,这点需要注意到。

这里列出的对象具体在Node.js。这里还有大量JavaScript语言自己本身就能使用的全局内置对象。

##Class:Buffer
- <Function>

用于处理二进制数据,具体见[buffer章节](Buffer.md)

##__dirname

- <String>

当前执行中的script文件所在的文件夹名

##__filename
- <String>

执行代码的文件名。将解析代码文件的绝对路径。对于主程序,这不必和命令行中使用一样的文件名。模块内部中该值是该模块的路径。



