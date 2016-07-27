#HTTPS

HTTPS是基于TLS/SSL的HTTP协议,在Node.js中通过一个独立的模块实现。

##Class:https.Agent

HTTPS的Agent对象类似`http.Agent`。更多信息请参考`https.request()`。

##Class:https.Server

该类是`tls.Server`的子类,触发和`http.Server`一样的事件。更多信息请参考`http.Server`。

###server.setTimeout(msecs,callback)

参考`http.Server#setTimeout()`。

###server.timeout

参考`http.Server#timeout`

##https.createServer(options\[,requestListener])

返回一个新的HTTPS web服务器对象。`options`类似`tls.createServer()`。
`requestListener`方法被自动添加为`request`事件的处理函数。

例:

```
// curl -k https://localhost:8000/
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);

```
Or

```

const https = require('https');
const fs = require('fs');

const options = {
  pfx: fs.readFileSync('server.pfx')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000); 

````

###server.close(\[callback])

参考`http.close()`

###server.listen(handle\[,callback])
###server.listen(path\[,callback])
###server.listen(port\[,host]\[,backlog]\[,callback])
参考`http.listen()`

##https.get(options,callback)
