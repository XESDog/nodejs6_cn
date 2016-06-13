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
`function (){}`
当请求被客户端忽略的时候发送。该事件仅仅在第一次call abort()的时候发送。

###Event:'checkExpectation'
`function (request,response){}`
每次发送一个请求,都有一个Expect头被收到。如果该事件未被侦听,服务端将自动回复一个417 Expectation Failed。

注意,当这个事件被发送并被处理,`request`事件将不会发送。

###Event:'connect'
`function (response,socket,head){}`
每次服务端回复一个请求的时候都会发送一个`CONNECT`事件。如果这个事件没有被侦听,客户接收`CONNECT`事件时,他们的连接就已经关闭了。

以下例子告诉你如何侦听`connenct`事件。

```
const http = require('http');
const net = require('net');
const url = require('url');

// Create an HTTP tunneling proxy
var proxy = http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});
proxy.on('connect', (req, cltSocket, head) => {
  // connect to an origin server
  var srvUrl = url.parse(`http://${req.url}`);
  var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
});

// now that proxy is running
proxy.listen(1337, '127.0.0.1', () => {

  // make a request to a tunneling proxy
  var options = {
    port: 1337,
    hostname: '127.0.0.1',
    method: 'CONNECT',
    path: 'www.google.com:80'
  };

  var req = http.request(options);
  req.end();

  req.on('connect', (res, socket, head) => {
    console.log('got connected!');

    // make a request over an HTTP tunnel
    socket.write('GET / HTTP/1.1\r\n' +
                 'Host: www.google.com:80\r\n' +
                 'Connection: close\r\n' +
                 '\r\n');
    socket.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    socket.on('end', () => {
      proxy.close();
    });
  });
});

```

### Event:'continue'
`function(){}`
当服务端发送了一个'100 continue'Http回复的时候触发该事件,通常是因为request包含'Expect:100-continue'。这是一条客户端request body中的指令。

### Event:'response'
`function (response){}`
当回复被request收到的时候触发。该事件仅触发一次。`response`参数是一个`http.IncomingMessage`对象。

### Event:'socket'
`function (socket){}`
一个socket分配给request之后触发。

###Event:'upgrade'
`function (response,socket,head){}`
服务端有更新回复request的时候触发。如果该事件未被侦听,客户端收到更新事件头信息的时候连接就关闭了。

下面代码展示如何侦听`upgrade`事件

```
const http = require('http');

// Create an HTTP server
var srv = http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});
srv.on('upgrade', (req, socket, head) => {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket); // echo back
});

// now that server is running
srv.listen(1337, '127.0.0.1', () => {

  // make a request
  var options = {
    port: 1337,
    hostname: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  var req = http.request(options);
  req.end();

  req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('got upgraded!');
    socket.end();
    process.exit(0);
  });
});

```

###request.abort()
标记request终止中。执行该方法将导致response中剩下的数据被丢弃,并且,socket被销毁。

###request.end(\[data\]\[,encoding\]\[,callback\])
结束正在发送的请求,还有任何部分的数据没有发送,都将缓冲到stream中。如果request被分割成块了,将发送`0\r\n\r\n`来表示终结。

如果`data`被指定,则相当于调用`response.write(data,encoding)`,再执行`request.end(callback)`。

如果`callback`被指定,当request流被结束之后执行。

###request.flushHeaders()
flush request头信息
考虑到效率问题,Node.js通常缓存request头信息,知道`request.end()`,或者写入第一块请求数据。它试图打包request头信息和数据到一个独立的TCP包中。

通常你希望能够将数据保持在一个TCP请求的来回期间,可是一般在晚一些的时间,第一次数据才会被发送到。`request.flushHeaders()`让你避开了优化启动请求。

###request.setNoDelay(\[noDelay\])
当一个socket被分配到某个request并断开的时候,将执行`socket.setNoDelay()`。

###request.setSocketKeepALive(\[enable\]\[,initialDelay\])
当一个socket被分配到某个request并断开的时候,将执行`socket.setKeepAlive()`。

###request.setTimeout(timeout\[,callback\])
当一个socket被分配到某个request并断开的时候,将执行`socket.setTimeout()`。
- `timeout`\<Number\> 一个请求被超时xxx毫秒。
- `callback`\<Function\> 当超时指定的时间到了之后执行的方法。相当于绑定`timeout`事件。

###request.write(chunk\[,encoding\]\[,callback\])
发送数据,调用这个方法的时候,用户能够直接控制请求中的数据。也就是说,当创建这种请求的时候,用户可能正在使用`[Transter-Encoding,'chunked']`头信息。

`chunk`参数必须是`Buffer`对象或者一个string。

`encoding`参数仅当`chunk`是string的情况下可选,默认为`utf8`。

`callback`参数可选,当大块数据被flush的时候调用。

返回`reqeust`。

##http.Server类

继承至`net.Server`类,并且增加额外的事件:


###Event:'checkContinue'
`function(request,response){}`
Expect:100-continue 被接收到的时候发送一个请求。如果没有侦听该事件,服务端将酌情自动回复100 Continue。

如果客户端继续发送request body部分,那么处理事件的同时调用`response.writeContinue()`。如果客户端不继续发送request body部分,那么生成一个恰当的HTTP恢复(e.g.,400 Bad Request)

注意:当该事件被触发并处理,`request`事件将不被触发。

###Event:'clientError'
`function(exception,socket){}`

如果客户端触发`error`事件,它将在这里被转发。侦听器负责关闭或销毁底层socket。比如,你希望通过更加优雅的方式关闭socket,给用户返回一个`400 Bad Request`,而不是突然关闭。

默认,当遇到异常请求会立即销毁socket。

错误来源于`socket`,是一个`net.Socket`对象。
```
const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);

```

当`clientError`事件发生,回调函数中不会有`request`和`response`对象,因此所有Http响应请求,包括响应头和有效载荷,必须直接的写入`socket`对象。
必须确保按照正确的格式来响应信息。


###Event:'close'

`function (){}`

当服务端`close`的时候触发。


###Event:'connect'
`function (request,socket,head){}`

一个客户端请求一个http `CONNECT`方法时发送,如果事件未被侦听,当客户端请求`CONNECT`方法的时候讲关闭该链接。

- `request` http请求参数,就像在request事件中一样。
- `socket`  客户端和服务端之间的socket链接。
- `head`    Buffer的一个实例,数据流的第一个包,有可能为空。

事件发送之后,request's socket不会存在`data`事件处理,也就是说,你需要绑定处理函数,来处理通过socket发送到服务端的数据。

###Event:'connection'
`function (socket){}`

当新的TCP流被建立,通常用户不需要处理该事件。特别的,协议解析器绑定socket时采用的方式使得socket不会发送`readable`事件。socket也可以在`request.connection`中被访问。

###Event:'request'
`function (request,response){}`

每次请求都会触发事件。注意,每个链接都可能有大量的请求(在keep-alive链接的情况下)。`request`是`http.IncomingMessage`实例,`response`是`http.ServerResponse`实例。

###Event:'upgrade'

`function (request,socket,head){}`

每次客户端请求一个http upgrade的时候触发。如果该事件未被侦听,客户端请求upgrade的时候就会被关闭。

- `request` http request 参数,就像request事件中一样。
- `socket`  服务端和客户端之间的socket链接
- `head`    Buffer实例,upgrade流中的第一个包,可能为空。

事件发送之后,request's socket不会存在`data`事件处理,也就是说,你需要绑定处理函数,来处理通过socket发送到服务端的数据。

###server.close(\[callback\])
停止接受新的连接,查看 `net.Server.close()`

###server.listen(handle,\[,callback\])

- `handle` \<Object\>
- `callback` \<Function\>







































