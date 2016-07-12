/**
 * Created by work on 16/7/12.
 */

var http=require('http');
var querystring = require('querystring');
var option={
    protocol:'http:',
    host:'localhost',
    port:'8000',
    method:'GET',
    path:'/',
    header:{

    },

}
var req=http.request(option,(res)=>{

    res.on('data',(chunk)=>{
        console.log(chunk);
    });
    res.on('end',()=>{
        console.log('end');
    })
})
req.on('error',(e)=>{
    console.log(e);
})
req.write(querystring.stringify({"msg":"hello world!"}));
req.end();
