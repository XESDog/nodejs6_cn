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

抛出一个`AssertionError`,如果`message`未设置,则错误信息显示为`actual`和`exceped`通过`operator`分割的字符,
否则,错误信息显示为`message`。


***这里有点没搞明白,设置assert.fail(2,1,undefined,'>')返回的依然是AssertionError***

```
const assert = require('assert');

assert.fail(1, 2, undefined, '>');
  // AssertionError: 1 > 2

assert.fail(1, 2, 'whoops', '>');
  // AssertionError: whoops 
  

````

##assert.ifError(value)

如果`value`是真,则抛出该值。当要测试回调函数中的`error`参数时非常有用。

```
const assert = require('assert');

assert.ifError(0); // OK
assert.ifError(1); // Throws 1
assert.ifError('error'); // Throws 'error'
assert.ifError(new Error()); // Throws Error 

````

##assert.notDeepEqual(actual,expected\[,message])

深度测试不相等的情况,和`assert.deepEqual()`相反。

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
}
const obj4 = Object.create(obj1);

assert.notDeepEqual(obj1, obj1);
  // AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
  // OK, obj1 and obj2 are not deeply equal

assert.notDeepEqual(obj1, obj3);
  // AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
  // OK, obj1 and obj2 are not deeply equal 

````

如果值深度比较之后相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.noDeepStrictEqual(actual,expected\[,message])

深度严格测试其不相等的情况,和`assert.deepStrictEqual()`相反。
```
const assert = require('assert');

assert.notDeepEqual({a:1}, {a:'1'});
  // AssertionError: { a: 1 } notDeepEqual { a: '1' }

assert.notDeepStrictEqual({a:1}, {a:'1'});
  // OK 

````

如果值深度严格不相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.noEqual(actual,expected\[,message])

简单的测试,使用不等符!==来检查结果

```
const assert = require('assert');

assert.notEqual(1, 2);
  // OK

assert.notEqual(1, 1);
  // AssertionError: 1 != 1

assert.notEqual(1, '1');
  // AssertionError: 1 != '1' 

````

如果值相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.notStrictEqual(actual,expected\[,message])

通过!==符号测试严格不等。

```
const assert = require('assert');

assert.notStrictEqual(1, 2);
  // OK

assert.notStrictEqual(1, 1);
  // AssertionError: 1 != 1

assert.notStrictEqual(1, '1');
  // OK 

````
如果值是严格不等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.ok(value\[,message])

测试是否value为真,等价于`assert.equal(!!value,true,message)`。

如果值不为真,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

```
const assert = require('assert');

assert.ok(true);  // OK
assert.ok(1);     // OK
assert.ok(false);
  // throws "AssertionError: false == true"
assert.ok(0);
  // throws "AssertionError: 0 == true"
assert.ok(false, 'it\'s false');
  // throws "AssertionError: it's false"
   

````

##assert.strictEqual(actual,expected\[,message])

使用`===`测试严格相等
```
const assert = require('assert');

assert.strictEqual(1, 2);
  // AssertionError: 1 === 2

assert.strictEqual(1, 1);
  // OK

assert.strictEqual(1, '1');
  // AssertionError: 1 === '1' 

````

如果值不是严格相等,`AssertionError`将传入的参数`message`一起抛出。如果`messaeg`未定义,将输出默认的错误信息。

##assert.throws(block\[,error]\[,message])

期望block抛出错误。

如果指定error,error可以是一个构造函数,RegExp,或者验证方法。

如果指定message,block抛出失败的时候讲输出一个携带message的`AssertionError`对象。


使用构造函数验证:

```
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  Error
);
 

````

使用正则验证错误信息

```
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  /value/
); 

````

自定义错误验证:

```
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  function(err) {
    if ( (err instanceof Error) && /value/.test(err) ) {
      return true;
    }
  },
  'unexpected error'
); 

````

注意,error不能是一个string。如果第二个参数提供的是一个string,error会被忽略并且string将被message代替,这会导致简单的错误:
```
    // THIS IS A MISTAKE! DO NOT DO THIS!
    assert.throws(myFunction, 'missing foo', 'did not throw with expected message');
    
    // Do this instead.
    assert.throws(myFunction, /missing foo/, 'did not throw with expected message'); 

````





