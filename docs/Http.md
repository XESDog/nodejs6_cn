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






