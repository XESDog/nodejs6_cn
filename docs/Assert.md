#Assert(断言)

`assert`模块提供一个简单的断言测试。该模块在Node.js内部使用,也能够通过`require('assert')`在应用代码中使用。
`assert`并不是一个测试框架,也不打算成为一个通用的断言库。

该API是`Locked`级别。也就是说,此后不会有任何增加或者修改。

##assert(value\[,message])

`assert.ok()`的别名

```
const assert = require('assert');

assert(true);  // OK
assert(1);     // OK
assert(false);
  // throws "AssertionError: false == true"
assert(0);
  // throws "AssertionError: 0 == true"
assert(false, 'it\'s false');
  // throws "AssertionError: it's false" 

```

##assert.deepEqual(actual,expected\[,message])

对`actual`和`expected`参数做深度比较。使用==操作符做原始比较。

仅可枚举的"own"属性能够参与比较。`deppEqual()`不考虑对象的原型,附加符号,以及不可枚举的属性。
这有可能导致一些潜在的令人吃惊的结果,比如,以下的例子没有抛出`AssertionError`因为`Error`对象上的属性不可枚举。

```
// WARNING: This does not throw an AssertionError!
assert.deepEqual(Error('a'), Error('b')); 

````

`Deep`相等的意思是说它们的子对象的可枚举"own"属性也会被考虑到:

```
const assert = require('assert');

const obj1 = {
  a : {
    b : 1
  }
};
const obj2 = {
  a : {
    b : 2
  }
};
const obj3 = {
  a : {
    b : 1
  }
};
const obj4 = Object.create(obj1);

assert.deepEqual(obj1, obj1);
  // OK, object is equal to itself

assert.deepEqual(obj1, obj2);
  // AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }
  // values of b are different

assert.deepEqual(obj1, obj3);
  // OK, objects are equal

assert.deepEqual(obj1, obj4);
  // AssertionError: { a: { b: 1 } } deepEqual {}
  // Prototypes are ignored 

````

如果值不相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.deepStrictEqual(actual,expected\[,message])

大体上和`assert.deepEqual()`相同,但是有两点例外。首先,原始数据使用严格比较的操作符`===`进行比较。
第二,会比较他们的原型。

```
const assert = require('assert');

assert.deepEqual({a:1}, {a:'1'});
  // OK, because 1 == '1'

assert.deepStrictEqual({a:1}, {a:'1'});
  // AssertionError: { a: 1 } deepStrictEqual { a: '1' }
  // because 1 !== '1' using strict equality 

````

如果值不相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.doesNotThrow(block\[,error]\[,message])

断言方法`block`不会抛出任何错误。详细查看`assert.throws()`。

当`assert.doesNotThrow()`被调用,它将立刻调用`block`方法。

如果有错误抛出并且和`error`指定的错误类型相同,此时将抛出`AssertionError`。
如果错误类型和指定的不同,或者`error`参数未设定,该错误将被传回到它的调用者那里。

如下,将抛出`TypeError`,因为在断言中没有匹配上错误类型:

```
assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  SyntaxError
); 

````

以下将返回`AssertionError`类型的错误'Got unwanted exception (TypeError)..':

```
assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  TypeError
); 

````

如果`AssertionError`错误被抛出并且提供了`message`参数,该`message`将追加在`AssertionError`之后"

```
assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  TypeError,
  'Whoops'
);
// Throws: AssertionError: Got unwanted exception (TypeError). Whoops 

````

##assert.equal(actual,expected\[,message])

简单的测试,使用==运算符比较actual和expected参数。

```
const assert = require('assert');

assert.equal(1, 1);
  // OK, 1 == 1
assert.equal(1, '1');
  // OK, 1 == '1'

assert.equal(1, 2);
  // AssertionError: 1 == 2
assert.equal({a: {b: 1}}, {a: {b: 1}});
  //AssertionError: { a: { b: 1 } } == { a: { b: 1 } } 

````
如果值不相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.fail(actual,expected,message,operator)







