#Http
使用Http,必须通过`require('http)`。

Http接口在Node.js中被设计成支持多功能协议,这些协议是以前很难以使用的。
特别是大的消息数据,该接口非常小心,从不缓冲请求和恢复————用户能够处理数据流。

Http头信息通过对象的形式呈现如下:

```
{ 'content-length': '123',
  'content-type': 'text/plain',
  'connection': 'keep-alive',
  'host': 'mysite.com',
  'accept': '*/*' }

```

key都是小写,value未被修改。(嘛意思?)

为了能够尽可能多的支持跟多的特性,Node.js的Http API是非常底层的。仅仅处理流和信息解析。
它解析消息到headers和body中,但是,它不解析实际的headers或body。

我们接收到的未处理的headers,被存在`rawHeaders`属性里面,格式`[key,value,key2,value2,...]`。
比如:

```
[ 'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*' ]

```

##http.Agent类

Http Agent被用来管理Http客户端请求的socket。

默认情况下Http Agent使用Connection:keep-alive。如果socket处于空闲状态,socket就会被关闭。
意思是说,Node.js对象池在keep-alive情况下好处多多,即使负载的情况下,也不用开发者通过手动来关闭Http clients。

如果你选择使用HTTP keepAlive,你能够创建一个Agent对象,并设置`flag`为`true`,该Agent对象保持未使用的socket在对象池中,
这将明确标记不保持Node.js进程运行。不管怎么样,当你不再使用它的时候明确的`destroy()`是非常好的选择,这时Socket将被关闭。


当socket发送`close`事件或`agentRemove`事件Socket将从agent的对象池中移除。
也就是说,如果你想保持一个Http请求处于open状态一段时间,并且,不希望该请求待在对象池中,你可以按照下面的做法:

```
http.get(options, (res) => {
  // Do stuff
}).on('socket', (socket) => {
  socket.emit('agentRemove');
});

```

或者,你可以选择设置`agent:false`来使对象不会被存储到对象池。

```
http.get({
  hostname: 'localhost',
  port: 80,
  path: '/',
  agent: false  // create a new agent just for this one request
}, (res) => {
  // Do stuff with response
})

```

### new Agent([options])

- `options` \<Object\> 设置agent的可配置选项:

   - `keepAlive` \<Boolean\> 保持socket在对象池中,以便未来被其他请求使用,Default=false。
   - `keepAliveMsecs` \<Integer\> 当使用HTTP KeepAlive,会经常发送TCP KeepAlive数据包来保持活动状态,Default=1000,仅在`keepAlive`
   设置为`true`时有用。
   - `maxSockets` \<Number\> 每台主机允许socket的最大数量。Default=Infinity。
   - `maxFressSockets` \<Number\> 自由状态下打开的socket最大数量,仅`keepAlive`设置为`true`时有用。

http.globalAgent用来设置http.request()的默认值。
想要配置他们,你必须创建你自己的http.Agent对象。

```
const http = require('http');
var keepAliveAgent = new http.Agent({ keepAlive: true });
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);

```

### agent.createConnection(options[, callback])

使用Http请求来生成一个socket/stream。

默认情况下,该方法和`net.createConnection()`是一样的,通常考虑灵活性一般会使用Agent来重写该方法。

一个socket/stream可以通过两种方法获得:通过该方法返回,或传递socket/stream给`callback`。

`callback`签名:`(err,stream)`。

### agent.destroy()

通过agent销毁当前正使用的socket。

通常不必这么做,如果你正在使用agent且KeepAlive=true,当你知道agent不再被使用时,你最好明确的关闭它。否则,服务器结束它们之前,socket将会挂起很长一段时间。

### agent.freeSockets

当HTTPKeepAlive被使用,一个包含socket数组的对象正等在Agent使用。不可修改。

### agent.getName(options)

获取一组`options`表示的唯一name,来决定是否连接被重用。在http agent中,返回`host:post:localAddress`。
在http agent中, CA,cert,ciphers,以及其他HTTPS/TLS-specific选项决定socket的可重用性。

Options:
- `host`: 请求到某服务器的域名和IP地址
- `port`: 远程服务器的端口号
- `localAddress`: 当请求发送的时候,绑定到网络连接的本地接口

### agent.maxFreeSockets

默认设置为256,Agent支持HTTPKeepAlive时,将该值设置为自由状态下能够打开的最大值。

### agent.maxSockets

默认情况下为无限。能同时开多少socket取决于服务器。

### agent.requests

一个还未被分配到socket的请求队列,不可修改。

### agent.sockets
一个当前被agent使用的socket数组,不可修改。

## http.ClientRequest 类

该对象通过`http.request()`内部创建并返回。它表示一个header已经进入队列了的正在进行的请求。
这个header依然可以通过 `setHeader(name,value)`,`getHeader(name)`,`removeHeader(name)`来做修改。
真是的header将沿着第一个数据块,或者链接关闭的时候发送。

要想获取response,添加request对象的`response`侦听事件。`response`事件将在response头信息被收到的时候通过request对象发送。
`response`事件被执行的``时候带一个`http.IncomingMessage`类型的参数。

在`response`事件期间,你可以为response对象添加侦听事件,特别是`data`事件。


如果你侦听了`response`事件,你必须将response对象的数据完全取出。你可以通过 `response.read()`当触发`readable`事件的时候。
你还可以添加 `data`处理函数,也可以执行`.resume()`方法。知道所有数据都被取出,执行`end`事件。如果有数据没有读取完,将导致内存出错。

注意:Node.js不会去检测是否Content-Length以及被发送的body的长度是否相等。

###Event:'abort'









