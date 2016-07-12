#Http
使用Http,必须通过`require('http)`。

Node.js中的Http接口支持很多以前难以使用的特性。
特别是大的,块编码,消息。该接口非常小心的从不缓冲整个请求/回复————用户能够处理数据流。

Http头信息格式如下:

```
{ 'content-length': '123',
  'content-type': 'text/plain',
  'connection': 'keep-alive',
  'host': 'mysite.com',
  'accept': '*/*' }

```

key是小写,value未被修改。

为了能够尽可能多的支持更多的特性,Node.js的Http API是非常底层的。仅仅处理流和消息解析。
它解析一个消息到header和body中,但它不解析实际的header或body。

关于如何处理重复header,请看[message.headers](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_message_headers)


我们接收到的未处理的headers保存在`rawHeaders`属性里面,格式`[key,value,key2,value2,...]`。
例如,之前的header对象可能有一个`rawHeaders`如下:

```
[ 'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*' ]

```

##http.Agent类

`Agent`用于管理Http客户端请求中的socket对象池。

默认情况下`Agent`使用`Connection:keep-alive`。如果socket处于空闲状态,socket就会被关闭。
意思是说,`Node.js`池设为`keep-alive`有很多好处,使用`KeepAlive`即使负载的情况下,也不用开发者通过手动来关闭Http客户端。

如果你选择使用`HTTP keepAlive`,你能够创建一个Agent对象,设置`flag`为`true`。(看[构造函数选项](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_new_agent_options))
该Agent将未使用的socket存储在池中以便以后使用。
这将被明确标记以便于不妨碍Node.js进程运行。无论如何,当你不再使用它的时候请执行`destroy()`,这时该socket将被关闭。

当socket发送`close`事件或`agentRemove`事件该socket将从agent的池中移除。
也就是说,如果你想保持一个Http请求处于open状态一段时间,并且,不希望该请求待在池中,你可以按照下面的做法:

```
http.get(options, (res) => {
  // Do stuff
}).on('socket', (socket) => {
  socket.emit('agentRemove');
});

```

或者,你可以选择设置`agent:false`来使对象不会被存储到池中。

```
http.get({
  hostname: 'localhost',
  port: 80,
  path: '/',
  agent: false  // 为该请求创建一个新的agent
}, (res) => {
  // Do stuff with response
})

```

### new Agent([options])

- `options` \<Object\> 设置agent的可配置选项。有以下字段:

   - `keepAlive` \<Boolean\> 保持socket在对象池中,以便未来被其他请求使用,默认=`false`。
   - `keepAliveMsecs` \<Integer\> 当使用`HTTP KeepAlive`的时候将以怎样的频率发送`TCP KeepAlive`数据包来保持活动状态,默认=`1000`,仅在`keepAlive`
   设置为`true`时有用。
   - `maxSockets` \<Number\> 每台主机允许socket的最大数量。默认=`Infinity`。
   - `maxFressSockets` \<Number\> 空闲状态下打开的socket最大数量,仅`keepAlive`设置为`true`时有用。

被`http.request()`使用的`http.globalAgent`,将所有的值设置为各自的默认值。
想要配置它们,你必须创建你自己的http.Agent对象。

```
const http = require('http');
var keepAliveAgent = new http.Agent({ keepAlive: true });
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);

```

### agent.createConnection(options[, callback])

生成一个被用于HTTP请求的socket/stream。

默认情况下,该方法和`net.createConnection()`是一样的,不过通常为了获取较大的灵活性一般会使用Agent来重写该方法。

一个socket/stream可以通过两种方法获得:通过该方法返回,或传递socket/stream给`callback`。

`callback`的方法签名为`(err,stream)`。

### agent.destroy()

通过agent销毁当前正使用的socket。

通常不必这么做,如果你正在使用agent且KeepAlive=`true`,当你知道agent不再被使用时最好直接关闭它。否则,服务器结束它们之前socket将会挂起很长一段时间。

### agent.freeSockets

当`HTTP KeepAlive`被使用,一个包含socket数组的对象正等待该Agent使用。不要修改。

### agent.getName(options)

获取一组`options`表示的唯一name,来决定是否连接被重用。在http agent中,返回`host:post:localAddress`。
在https agent中, 名字包括`CA`,`cert`,`ciphers`,以及其他`HTTPS/TLS-specific`选项决定socket的可重用性。

Options:
- `host`: 请求到某服务器的域名和IP地址
- `port`: 远程服务器的端口号
- `localAddress`: 当请求发送的时候,绑定到网络连接的本地接口

### agent.maxFreeSockets

默认设置为256,Agent支持`HTTPKeepAlive`时,将该值设置为自由状态下能够打开的最大值。

### agent.maxSockets

默认情况下为无限。能同时开多少socket取决于服务器。

### agent.requests

一个还未被分配到socket的请求队列,不可修改。

### agent.sockets
一个当前被agent使用的socket数组,不可修改。

## http.ClientRequest 类

该对象通过`http.request()`内部创建并返回。它表示一个正在进行中的请求,该请求头已经进入队列。
这个header依然可以通过 `setHeader(name,value)`,`getHeader(name)`,`removeHeader(name)`API来做修改。
真是的header将沿着第一个数据块或者链接关闭的时候发送。

要想获取response,为request对象添加的`response`侦听事件。`response`事件将在response头信息被收到的时候通过request对象发送。
`response`事件被执行的时候带一个`http.IncomingMessage`类型的参数。

在`response`事件期间,你可以为response对象添加侦听事件,特别是侦听`data`事件。


如果没有`response`事件被添加,该response将被完全丢弃。
不过,如果你添加了`response`事件处理,你必须从response对象中处理这些数据,既可以在`readable`事件时执行`response.read()`,
也可以添加一个`data`处理,还可以执行`.resume()`方法。
直到所有数据都被取出之后才会触发`end`事件。如果有数据没有读取完,将导致内存出错。

注意:Node.js不会去检测是否`Content-Length`以及被发送的body的长度是否相等。

该请求实现[Writable Stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_class_stream_writable)
接口。
以下是相关事件:

###Event:'abort'
`function (){}`
当请求被客户端忽略的时候发送。该事件仅仅在第一次call abort()的时候发送。

###Event:'checkExpectation'
`function (request,response){}`
每次发送一个请求,都有一个Expect头被收到。如果该事件未被侦听,服务端将自动回复一个417 Expectation Failed。

注意,当这个事件被发送并被处理,`request`事件将不会发送。

###Event:'connect'
`function (response,socket,head){}`
每次服务端回复一个method为`CONNECT`请求的时候都会触发该事件。如果这个事件没有被侦听,接收`CONNECT`method的客户端将关闭他们的连接。

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
每当服务端回复一个带upgrade的请求的时候触发。如果该事件未被侦听,客户端收到upgrade头信息的时候关闭连接。

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

`handle`能够被设置为一个`server`或`socket`对象。
这将导致server在指定的handle上接受一个连接,但是,它被假设该文件描述符或handle已经被绑定到一个端口或者域socket。

侦听文件描述符在windows中不被支持。

该方法是一步的,最后的参数callback将被作为一个侦听器添加到`listening`事件。see `net.Server.listen()`。

返回 `server`。


###server.listen(path,\[,callback])
为给出的`path`上建立的连接启动一个UNIX socket server 侦听。

该方法是一步的。最后的参数callback将被作为一个侦听器添加到`listenling`事件。see `net.Server.listen(path)`。

###server.listen(port\[,hostname]\[,backlog]\[,callback])
在指定的port,hostname上开始接收连接。如果hostname被忽略,且IPv6可用的时候,服务器将接受任何IPv6地址(`::`)的连接,
或者除开IPv4地址(`0.0.0.0`)的任何连接。port值如果为0,则随机分配一个端口号。

侦听一个UNIX socket,提供一个filename而不是端口号和主机名。

Backlog是排列等待连接的极限长度,实际长度由系统决定,在linux中则通过`tcp_max_syn_backlog`和`somaxconn`决定。
默认值是511(不是512)

该方法是一步的,最后的参数callback将被作为一个侦听器添加到`listenling`事件。see `net.Server.listen(port)`。

###server.listening
一个布尔值,表示是否服务器处于侦听状态。

###server.maxHeadersCount
最大的传入header的数量,默认等于1000,如果设置为0,则被设置为无限。

###server.setTimeout(msecs,callback)
- `msecs` \<Number>
- `callback` \<Function>

设置socket超时的值。如果超时发生,通过server对象发送`timeout`事件,将socket作为参数传递。

默认,server超时值为2分钟,如果曹氏,socket将被销毁。无论如何,如果你分配给server一个超时事件,那么你需要自己负责处理好超时事件。

返回server。

###server.timeout
- \<Number> 默认=120000(2分钟)
socket超时未发生的时候,该值是不变的。

注意,socket的逻辑是在连接的时候设置的。因此,修改这个值仅能影响新的server连接,不会对已经存在的连接产生任何影响。

设置为0将在禁止任何种类的超时行为。

##http.ServerResponse类

该对象通过HTTP server在内部创建——不是通过用户创建的。它被当成第二个参数传递到`request`事件中。

response实现但不继承Writable Stream接口。

###Event:'close'
`function(){}`
表明底层连接被在response.end()被执行之前被中断,或者能够flush。

###Event:'finish'
`function(){}`
response被发送的时候触发。更具体的说,该事件在最后一段head和body被移交到操作系统做网络传输的时候触发。
这并不表示客户端移交收到什么了。

该事件之后,跟多的事件将通过response对象发送。

###response.addTrailer(header)

该方法为response添加HTTP头信息的尾部

trailer在response中仅用作块编码。如果不是,它将默默的被丢弃。

注意,trailer部分会跟header信息的其他值一起发送,你不必单独对他做什么。

```
response.writeHead(200, { 'Content-Type': 'text/plain',
                          'Trailer': 'Content-MD5' });
response.write(fileData);
response.addTrailers({'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667'});
response.end();

```

试图设置一个包含无效字符的header属性的名称或值返回`TypeError`异常。


###response.end(\[data]\[,encoding]\[,callback])

向服务端发出信号,response的header和body已经被发送。server应该考虑完成的情况
response.end()必须在每次回复的时候发送。

if `data` 被指定,其实相当于先调用response.write(data,encoding),然后执行 response.end(callback)

if  `callback`被指定,它将在response stream完成的时候执行。

###response.finished

布尔型,申明是否回复完成。开始是`false`。执行response.end()之后,值变为true。

###response.getHeader(name)

读取已经在排队当是还没有发送的header。注意,名字不区分大小写。该方法仅在header得到隐式刷新之后被调用。


例:

```
var contentType = response.getHeader('content-type');

```

###response.headersSent

只读,布尔型,header被发送为true,否则为false

###response.removeHeader(name)

删除队列中隐式发送的header

```
response.removeHeader('Content-Encoding');

```

###response.sendDate
当值为true,如果不准备在header中呈现,
该Date头将自动生成,并在response中发送。
默认为true。

这应该仅在测试中被禁用;HTTP需要response中的Date头。


###response.setHeader(name,value)

为隐式头设置一个单独的头。
如果这个头已经存在于要发送的头中,它的值将被替换。
如果你希望使用同样的名称发送多个头,你可以在这里使用一个string数组。

例如:

```
response.setHeader('Content-Type','text/html');

````
或者
```
response.setHeader('Set-Cookie',['type=ninja','language=javascript']);

````

设置name和value遇到无效字符时将导致抛出TypeError。

当header通过response.setHeader()设置之后,
它将跟其他header头合并之后传递到response.writeHead(),
合并之后的header优先传递给response.writeHead()。

```
// returns content-type = text/plain
const server = http.createServer((req,res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
});

````




##类:http.IncomingMessage
一个`IncomingMessage`对象通过`http.Server`或`http.ClientRequest`创建,并且作为第一个参数传递给`request`和`response`事件处理。
它被用来访问response状态,header和data。

它实现[Readable Stream](https://nodejs.org/dist/latest-v6.x/docs/api/stream.html#stream_class_stream_readable)接口,
以及添加了以下的事件,方法和属性。

###Event:'aborted'
`function(){}`
当请求被客户端忽略并且网络socket关闭的时候触发。

###Event:'close'
`function(){}`

表示底层连接被关闭,像`end`一样,这个事件每次回复仅发生一次。

###message.destroy(\[error])
- error \<Error>

当socket收到`IncomingMessage`时调用`destory()`。如果提供了`error`,一个`error`事件被触发并且`error`被作为一个参数传递到该事件的任何侦听器。



