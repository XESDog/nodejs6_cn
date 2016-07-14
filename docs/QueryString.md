#Query String

`querystring`模块提供一些方法,用来解析、格式化URL查询串,它能够这样被访问

```
const querystring = require('querystring');

````


##querystring.escape(str)
- str \<String>

`querystring.escape()`方法在提供的`str`上执行百分号编码,这种编码方式被用来优化及调整一些特殊的查询串。

`querystring.escape()`方法通过`querystring.stringify()`调用,通常不要直接使用。
如果必须填充`querystring.eacape`到另外一个方法,它主要用于提供一个应用程序代码替代百分号编码的实现方式。

## querystring.parse(str[,sep[,eq[,options]]])

- str <String> 要解析的URL查询串
- sep <String> 用来分割查询串键值对的字符串,默认为`&`。
- eq <String> 用来分家键和值的字符串,默认`=`。
- options <Object>
    + decodeURIComponent <Function>  解码查询串中的百分号编码的方法,默认使用`querystring,unescape()`。
    + maxKeys <number> 指定用于解析的键的最大值,默认为1000,如果指定为0,则将移除个数限制。

方法`querystring.parse`解析URL查询串`str`到一个集合里面。

例如,查询串`foo=bar&abc=xyz&abc=123`被解析到:
```
{
  foo: 'bar',
  abc: ['xyz', '123']
}

````

注意,通过`querystring.parse()`方法返回的对象并不是典型的JavaScript对象。意思是说,一般`Object`使用的方法,如:
`obj.toString`、`obj.hashOwnProperty()`、以及其他的方法都没有定义,也都不会工作。

默认,百分号编码之后的查询串将假定使用的UTF-8编码。如果另一个字符编码被使用,则另一个选项`decodeURLComponent`将必须被指定:

```
// 假设 gbkDecodeURIComponent 方法存在...
querystring.parse('w=%D6%D0%CE%C4&foo=bar', null, null,
  { decodeURIComponent: gbkDecodeURIComponent })

````

##querystring.stringify(obj[,sep[,eq[,options]]])
- str <String> 要解析的URL查询串
- sep <String> 用来分割查询串键值对的字符串,默认为`&`。
- eq <String> 用来分家键和值的字符串,默认`=`。
- options <Object>
    + encodeURIComponent <Function>  当转换URL安全字符到百分号编码查询串的时候使用该方法,默认为`querystring.escape()`

`querystring.stringify()`方法从一个给定的`obj`通过该对象的`own properties`迭代生成一个URL查询串。例如:

```
querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' })
// returns 'foo=bar&baz=qux&baz=quux&corge='

querystring.stringify({foo: 'bar', baz: 'qux'}, ';', ':')
// returns 'foo:bar;baz:qux'


````

默认,查询串中的百分号编码字符使用UTF-8编码。如果需要另一种编码方式,那么另一个`encodeURLComponent`选项将需要按照以下方式指定:

```
// 假定 gbkEncodeURIComponent 方法已经存在

querystring.stringify({ w: '中文', foo: 'bar' }, null, null,
  { encodeURIComponent: gbkEncodeURIComponent })

````

##querystring.unescape(str)

- str <String>

`querystring.unescape()`方法为提供的str执行百分号编码。


`querystring.unescape()`通过`querystring.parse()`方法使用,通常不直接使用。



