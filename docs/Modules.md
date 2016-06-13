#Modules

Node.js 有一个简单的模块加载系统。在Node.js,文件和模块是一对一的关系。比如,`foo.js`在同样的文件夹加载`circle.js`模块。

`foo.js`的内容:
```
const circle = require('./circle.js');
console.log( `The area of a circle of radius 4 is ${circle.area(4)}`);

```

`circle.js`的内容:

```
const PI = Math.PI;
exports.area = (r) => PI * r * r;
exports.circumference = (r) => 2 * PI * r;

```

模块`circle.js`导出了方法`area()`和`circumference()`。你能够将需要导出的方法和对象添加到专门的`exports`对象,以便能够在root层使用它们。

本地模块以私有化的形式存在,因为Node.js将模块包装在一个方法中。上例中,变量`PI`是私有对象。

如果你想在你的root模块中通过一次分配导出一个方法或者导出一个完整的对象而不是每次导出一个属性,你应该使用`module.exports`而不是`exports`。


下面,`bar.js`使用了`square`模版,导出一个构造函数:

```
const square = require('./square.js');
var mySquare = square(2);
console.log(`The area of my square is ${mySquare.area()}`);

```

`square`模版定义在`square.js`中:

```
// assigning to exports will not modify module, must use module.exports
module.exports = (width) => {
  return {
    area: () => width * width
  };
}

```

模版系统在`require("module")`模块中实现。


##访问主模块

```
console.log(require.main===module)

```
以上代码写在`foo.js`文件中,通过`node foo.js`运行是`true`,但是,通过`require('./foo')`运行则为`false`。第一种运行方式表明foo.js是主模块,
第二种方式表明foo.js不是主模块。也就是说,通过这种方式你能够决定文件以哪种方式云行。

因为`module`提供了一个`filename`属性,应用程序的入口可以通过`require.main.filename`获得。


##附录:包管理窍门

Node.js的`require()`被设计成能够支持大量合理的文件结构。
包管理工具,像`dpkg`,`rpm`,`npm`,都希望在不做任何修改的情况下通过Node.js构建本地模块。

以下,我们给出了一个建议文件结构:

`/usr/lib/node/<some-package>/<some-version>`

一个包可以依赖另外一个包。为了安装`foo`包,你可能需要安装指定版本的`bar`包,`bar`包可能还有自己的依赖,在一些情况,依赖关系甚至会出现冲突,或者出现环形依赖。


Node.js查阅了所有加载模块的`realpath`,并且找到它们之间的依赖关系,按照以下方法,非常简单的解决了以上问题。

- `/usr/lib/mode/foo/1.2.3`
- `/usr/lib/mode/bar/4.3.2` foo所依赖
- `/usr/lib/mode/foo/1.2.3/node_modules/bar` 连接到`/usr/lib/node/bar/4.3.2`
- `/usr/lib/mode/bar/4.3.2/node_modules/*` 连接到`bar`所依赖的包

由此,如果你遭遇到环形依赖,或者依赖冲突,模块都能够获得一个能够使用的依赖版本。

当`foo`包中代码执行`require('bar')`,你将连接到`/usr/lib/node/foo/1.2.3/node_modules/bar`。这是,当`bar`包中代码
执行`require('quux')`,它将连接到`/usr/lib/node/bar/4.3.2/node_modules/quux`获取版本。

此外,为了使得查找模块更加迅速,我们将模块放置在`/usr/lib/node_modules/<name>/<version>`,快过直接放置在`/usr/lib/node`。

为了使得模块在Node.js REPL中可用,我们通常将`/usr/lib/node_modules`文件夹添加到环境变量`$NODE_PATH`中。所有`node_modules`查阅都是相对的,
如果基于文件的实际路径通过`require()`来查找,那么包可以放置在任何位置。

##All Together










