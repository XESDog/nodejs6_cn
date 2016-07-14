#Buffer

## Buffer.from(), Buffer.alloc(), and Buffer.allocUnsafe()

NodeJs6以前，Buffer实例是通过Buffer构造函数创建，传入的参数不同，Buffer分配的值也不一样：

- 第一个参数传递number(e.g. `new Buffer(10)`),创建一个参数指定尺寸的Buffer对象。Buffer实例内存没有经过初始化,
必须手动使用buf.fill(0)或直接写Buffer来完成初始化。虽然这么做是希望能够提升效率,但是经验告诉我们,我们必须明确
我们需要的是一个快而未初始化的创建方式,还是慢而安全的创建方式。

- 第一个参数如果传递的是string,array或者Buffer,那么,将copy参数的数据到Buffer中。

- 如果传递一个ArrayBuffer对象,那么返回的Buffer对象将和该对象共享内存。

使用`new Buffer()`第一个参数有多种可能性,如果没有正确验证参数,以及不恰当分配Buffer内容,都将导致代码出现安全问题。
使用`Buffer`创建对象更加可靠也更不容易出错,所以,不赞成使用`new Buffer()`的方式创建Buffer对象,可以用`Buffer.from()`,
`Buffer.alloc()`和`Buffer.allocUnsave()`方法代替。

开发者可以将`new Buffer()`创建对象的方式使用一下方式代替。

- `Buffer.from(array)`,返回一个新的Buffer对象,该对象复制`array`中的对象。

```
Buffer.from([1,2,3]);//<Buffer 01 02 03>

//使用英文和字符,不能够正确输出
Buffer.from(['a','b','c']);//<Buffer 00 00 00>
Buffer.from(['你','好','啊']);//<Buffer 00 00 00>

```

- `Buffer.from(arrayBuffer[, byteOffset [, length]])`,返回一个新的Buffer对象,该对象和提供的ArrayBuffer对象共享内存

- `Buffer.from(buffer)`,返回一个新的Buffer对象,该对象复制了参数`buffer`的内容。

- `Buffer.from(str[, encoding])`,返回一个新的Buffer对象,该对象复制了参数`str`。

- `Buffer.alloc(size[, fill[, encoding]])`,返回一个按照给定`size`填充之后的Buffer对象,该方法明显慢于`Buffer.allocUnsafe(size)`,
但是,通过该方法获取到的Buffer对象肯定不会保护敏感数据和旧数据。

- `Buffer.allocUnsafe(size)`and`Buffer.allocUnsafeSlow(size)`均能够返回一个指定`size`的Buffer对象,该Buffer对象
必须使用`buf.fill(0)`或手动写入数据来初始化。

使用`Buffer.allocUnsafe(size)`创建Buffer对象的时候,如果`size`小于或者等于`Buffer.poolSize`的一半,
那么,该对象将有可能分配到一个共享内存池(译者:被使用过,然后回收的内存)

### The --zero-fill-buffers command line option
Node.js使用`--zero-fill-buffers`命令行参数,能够强制所有通过`new Buffer(size)`,`Buffer.allocUnsafe(size)`,
`Buffer.allocUnsafeSlow(size)`,`new SlowBuffer(size)`创建的Buffer对象自动填充0,该命令参数能够改变这些方法的默认行为,
这对于性能有显著的影响。推荐使用`zero-fill-buffers`命令行参数,该命令行参数可以杜绝Buffer对象包含敏感数据的可能。

```
$ node --zero-fill-buffers
> Buffer.allocUnsafe(5);
<Buffer 00 00 00 00 00>
```

### 是什么导致`Buffer.allocUnsafe(size)`和`Buffer.allocUnsafeSlow(size)` "不安全"?
当调用`Buffer.allocUnsafe()`(和`Buffer.allocUnsafeSlow()`)创建Buffer对象时,分配到的内存并没有被初始化(归零),
这种设计会使得分配内存相当快,同时,也导致会有一些老的数据和敏感数据,如果在创建之后也没有在该内存上写入新的数据,那么,当读取该Buffer对象
的时候就有可能导致信息泄露。

你已经知道`Buffer.allocUnsafe()`会导致的问题,那么在使用的时候就得非常小心,避免出现安全问题。

## Buffers和字符编码
Buffers通常用来呈现一堆编译过的字符,这些字符可能使用了UTF8,UCS2,Base64甚至16进制编码。而且,通过一些方法,它们会在Buffers和普通的
JavaScript字符串对象间来回转换。

```
const buf = Buffer.from('hello world', 'ascii');
console.log(buf.toString('hex'));
  // prints: 68656c6c6f20776f726c64
console.log(buf.toString('base64'));
  // prints: aGVsbG8gd29ybGQ=

```
当前,Node.js支持的字符编码有:
- `ascii`
- `utf8`
- `utf16le`
- `ucs2` - `utf16le`的别名
- `base64`
- `binary`
- `hex`


## Buffers 和 TypedArray
Buffer对象就是`Uint8Array`的实例,`Unit8Array`是TypeArray的一个实现。在ECMAScript2015中,它们和TypedArray有点小小的不兼容。
比如,`ArrayBuffer#slice()`创建一个切片副本,`Buffer#slice`创建一个针对现有Buffer的一个视图,而不是副本,`Buffer#slice()`更有效率。

你通过使用一个Buffer对象来生成数据的时候,需要注意这些问题:

1. 这个Buffer对象的内存数据被copy到TypedArray中,不是共享。
2. 使用`new Uint32Array(Buffer.from([1,2,3,4]))`将创建一个由4各元素组成的`Uint32Array`,而不是1个元素组成的`Uint32Array`,
不是`[0x1020304]`,也不是`[0x4030201]`

你可以使用TypedArray的.buffer属性,来创建一个和TypedArray共享内存块的Buffer对象。

```
const arr = new Uint16Array(2);
arr[0] = 5000;
arr[1] = 4000;

const buf1 = Buffer.from(arr); // copies the buffer
const buf2 = Buffer.from(arr.buffer); // shares the memory with arr;

console.log(buf1);
  // Prints: <Buffer 88 a0>, copied buffer has only two elements
console.log(buf2);
  // Prints: <Buffer 88 13 a0 0f>

arr[1] = 6000;
console.log(buf1);
  // Prints: <Buffer 88 a0>
console.log(buf2);
  // Prints: <Buffer 88 13 70 17>

```

注意,当把一个TypedArray对象的buffer属性作为一个参数来创建Buffer对象的时候,可以通过`byteOffset`
和`length`参数来指定使用部分数据。

```
const arr = new Uint16Array(20);
const buf = Buffer.from(arr.buffer, 0, 16);
console.log(buf.length);
  // Prints: 16

```

`Buffer.from()` 和 `TypedArray.from()` (e.g.Uint8Array.from())`具有不同的签名和实现。具体的说,
TypedArray可以接受一个mapping函数作为第二个参数,该函数会将数组中的每个元素作为参数执行一次。

- `TypedArray.from(source[, mapFn[, thisArg]])`
`Buffer.from()`,不支持使用mapping函数:
- `Buffer.from(array)`
- `Buffer.from(buffer)`
- `Buffer.from(arrayBuffer[, byteOffset [, length]])`
- `Buffer.from(str[, encoding])`

##Buffer和ES6迭代器

ECMAScript2015(ES6)中,Buffer能够使用`for..of`来迭代:

```
const buf = Buffer.from([1, 2, 3]);

for (var b of buf)
  console.log(b)

// Prints:
//   1
//   2
//   3

```

另外,`buf.values()`,`buf.keys()`,`buf.entries()`能够用来创建迭代器。

## Buffer类


