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

想要获取待加载模块的精确文件名,需要等`require()`执行之后,通过`require.resolve()`方法获取。

以下是`require.resolve()`方法执行的伪代码

```
require(X) from module at path Y
从Y文件夹中请求模块X

1. If X is a core module, 如果X是核心模块
   a. return the core module   返回核心模块
   b. STOP
2. If X begins with './' or '/' or '../'    如果X由'./' or '/' or '../'开始
   a. LOAD_AS_FILE(Y + X)   通过Y+X加载文件,详细参考下面针对该方法的描述
   b. LOAD_AS_DIRECTORY(Y + X)  通过Y+X加载文件夹,详细参考下面针对该方法的描述
3. LOAD_NODE_MODULES(X, dirname(Y))
4. THROW "not found" 抛出异常

LOAD_AS_FILE(X)
// X是文件,像js文件一样加载,stop
1. If X is a file, load X as JavaScript text.  STOP
// X.js是文件,像加载js文件一样加载,stop
2. If X.js is a file, load X.js as JavaScript text.  STOP
//X.json是一个文件,将X.json解析成一个js对象,stop
3. If X.json is a file, parse X.json to a JavaScript Object.  STOP
//X.node是一个文件,以二进制的形式加载X.node,stop
4. If X.node is a file, load X.node as binary addon.  STOP

LOAD_AS_DIRECTORY(X)

// 如果X/package.json是一个文件
1. If X/package.json is a file,
    //解析X/package.json,查找"主"域
   a. Parse X/package.json, and look for "main" field.
   b. let M = X + (json main field)
   c. LOAD_AS_FILE(M)
2. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
3. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
4. If X/index.node is a file, load X/index.node as binary addon.  STOP

LOAD_NODE_MODULES(X, START)
1. let DIRS=NODE_MODULES_PATHS(START)
2. for each DIR in DIRS:
   a. LOAD_AS_FILE(DIR/X)
   b. LOAD_AS_DIRECTORY(DIR/X)

NODE_MODULES_PATHS(START)
1. let PARTS = path split(START)
2. let I = count of PARTS - 1
3. let DIRS = []
4. while I >= 0,
   a. if PARTS[I] = "node_modules" CONTINUE
   c. DIR = path join(PARTS[0 .. I] + "node_modules")
   b. DIRS = DIRS + DIR
   c. let I = I - 1
5. return DIRS


```

##缓存

在第一次加载之后模块就被缓存了,也就是说,只要加载过一次,以后的每次加载都能够快速且精准的被找到。

多次执行`require('foo')`,不会导致模块被多次执行。这是非常重要的特征。

//不会翻译
With it, "partially done" objects can be returned, thus allowing transitive dependencies to be loaded even when they would cause cycles.

如果你想多次执行同一个模块,将它导出为一个方法,然后多次执行该方法。

##模块缓存注意事项

模块缓存是基于解析出来的文件名,由于模块能够根据存放的位置不同导致最终解析成不同的文件名,因此,如果你在不同的位置调用`require('foo')`,不能够保证总是能够获取同样的对象。

另外,对于不区分大小写的文件系统或者操作系统,不同的文件名最后对于的可能是同一个文件,但是,缓存依然会将他们当成不同的模块多次加载。
比如:`require('./foo')`和`require(./FOO)`返回两个不同的对象,而不管`./foo`和`./FOO`实际上是同一个文件。

##核心模块
Node.js有好几个模块编译成二进制数据。这些模块在本文档的其他地方有更详尽的描述。

核心模块被定义在Node.js的源文件下面的`lib/`文件夹下。

核心模块总是优先加载,比如,request('http')总是返回HTTP模块,即使有一个文件跟这个名字一样。


##环

当`require()`请求形成了一个环,有可能会有模块最终未被执行。
比如以下这种情况:

`a.js`

```
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('a done');

```

`b.js`

```
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');

```

`main.js`

```
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done=%j, b.done=%j', a.done, b.done);


```

当`main.js`加载`a.js`,`a.js`转而加载`b.js`,此时,`b.js`又试图加载`a.js`,为了避免形成无限循环,将一个未完成copy的`a.js`返回给`b.js`模块。
待`b.js`完成加载之后,再将`b.js`导出并提供给`a.js`模块。

这时`main.js`加载这两个模块,都能够完成,输出结果如下:

```
$ node main.js
main starting
a starting
b starting
in b, a.done = false
b done
in a, b.done = true
a done
in main, a.done=true, b.done=true

```

如果你的项目中出现了环形依赖,请按照上面的来。


##文件模块

如果文件未被找到,Node.js将试图在文件名后面添加扩展名来查找,比如:`.js`,`.json`,`.node`。

`.js`文件被解释为js文件,`.json`文件被解释成Json文件,`.node`文件被解释成通过`dlopen`编译过的文件。

模块请求前缀为`/`是绝对路径,比如:`require('/home/marco/foo.js')`将加载文件`/home/marco/foo.js`。

模块请求前缀为`./`是相对路径,比如,`circle.js`必须和`foo.js`在同一个文件夹,才能够在`foo.js`中通过`require('./circle.js')`找到。

如果没有`/`,`./`,`../`,那么该木块必须是核心模块,或者在`node_modules`文件夹中。

如果通过以上方法都没有找到对应的文件,`require()`将抛出一个Error,且`code`属性被设置为`MODULE_NOT_FOUND`。


##文件夹模块

我非常方便的组织程序和库到自己的文件夹中,并且为库提供一个独立的入口。这里有3种方法能够将文件夹传递到`require()`。

第一个方法就是在跟目录创建`package.json`,用它指定一个`main`模块。想这样:

```
{ "name" : "some-library",
  "main" : "./lib/some-library.js" }

```

如果该文件在 `./some-library` 文件夹,`require('./some-library')`将试图去加载`./some-library/lib/some-library.js`。

package.json文件是Node.js意志的扩展。

注意:如果通过`package.json`指定的`main`入口文件失效或者不能够解析。Node.js将抛出一个错误:

`Error:Cannot find module 'some-library'`

如果没有package.json文件在文件夹中,Node.js会试着去加载文件夹下的`index.js`或`index.node`文件。
比如:如果没有package.json文件,require('./some-library')将试图加载:

- `./some-library/index.js`
- `./some-library/index.node`


##从node_modules文件夹加载
如果`require()`的不是本地模块,也没有`/`,`./`,`../`开始,Node.js会在模块的当前文件夹中创建一个`/node_modules`文件夹,
并从其他位置加载模块。Node不会在`node_modules`的文件夹后面追加`node_modules`文件夹。

例:如果文件`/home/ry/projects/foo.js`执行`require('bar.js)`,Node.js将按照以下顺序查找本地文件。

- `/home/ry/projects/node_modules/bar.js`
- `/home/ry/node_modules/bar.js`
- `/home/node_modules/bar.js`
- `/node_modules/bar.js`

允许程序本地化依赖,解决冲突问题。

你能够require指定文件或者模块,它们和模块一起分布,分布方式为,模块名+路径后缀。比如,`require('example-module/path/to/file')`
会解析和本地路径`example-module`相对的路径`path/to/file`。后缀路径遵循同样的模块语义规则。


## 从全局文件夹加载

如果`NODE_PATH`环境变量设置了,如果该模块在其他地方都没有找到,Node.js将从环境变量中定义的路径开始查找。


## 模块打包

模块中的代码被执行之前,Node.js将用一个方法打包他们,看起来像下面这个样子:

```

(function (exports, require, module, __filename, __dirname) {
// Your module code actually lives in here
});

```
Node.js干了以下的事情:

- 保留模版顶级变量作用域,而不是使用全局对象
- 提供全局变量,实际上是具体的模块,比如

    -  `module`和`export`对象的实现者,能够从模块中导出值
    - `__filename`和`__dirname`变量,表示模块的绝对文件名和文件路径

## 模块对象

- \<Object>

每个模块,`module`变量表示当前模块。为了方便,`module.exports`也能够通过`exports`访问,`module`虽然在每个模块都有该对象,但是他并不是全局变量,
只是在每个模块中都对其做了设置。

### module.children
- \<Array>

该模块所需的对象

###module.exports
- \<Object>

`module.exports`对象通过模块系统创建。有时候它也是不被接受的。
你可能想将模块定义为一个类的对象,你可以这么做,用`module.exports`来导出你希望使用的对象。
注意,为`exports`分配你希望导出的对象会简单的重新绑定本地`export`变量,可能这并不是你想要的。

比如,假设我们写了这样一个文件`a.js`


```
const EventEmitter = require('events');

module.exports = new EventEmitter();

// Do some work, and after some time emit
// the 'ready' event from the module itself.
setTimeout(() => {
  module.exports.emit('ready');
}, 1000);


```

另外一个文件可以这么干

```
const a = require('./a');
a.on('ready', () => {
  console.log('module a is ready');
});

```


注意:分配`module.exports`会立即执行,但是像下面这么干,是不能得到你想要的结果滴。

x.js

```
setTimeout(() => {
  module.exports = { a: 'hello' };
}, 0);



```

y.js

```
const x = require('./x');
console.log(x.a);

```

###导出化名

在模块开始的时候,`exports`作为`module.exports`的引用是可用的。就想其他的变量一样,如果分配了一个新的值,它将不会再绑定到以前的值。

请看下面的代码,简单的阐述了一下`require()`的实现:

```
function require(...) {
  // ...
  ((module, exports) => {
    // Your module code here
    exports = some_func;        // re-assigns exports, exports is no longer
                                // a shortcut, and nothing is exported.
    module.exports = some_func; // makes your module export 0
  })(module, module.exports);
  return module;
}

```

`exports`和`module.exports`的关系就像互相镜像,你可以忽略`exports`仅使用`module.exports`。

###module.filename

- \<String>

模块的全名

###module.id
- \<String>
模块标识,通常这是模块的全名

###module.loaded
- \<Boolean>

是否模块完成了加载,还是正在加载中。


###module.parent
- \<Object> Module对象

第一次请求该模块的对象

### module.require(id)
- id\<String>
- Return:\<Object> `module.exports` 解析之后的模块

`module.require`提供了加载模块的方法,就像使用`require()`一样。

注意,想要做到这点,你必须获取该`module`对象的引用,由于`require()`返回`module.exports`,
并且,`module`仅在指定模块代码中可用,它必须被明确的导出。



























