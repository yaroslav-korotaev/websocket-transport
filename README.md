# websocket-transport

Transport implementation over websockets using JSON serialization. For using both in Node.js and Browser environment.

> Read about the Transport concept [here](https://github.com/yaroslav-korotaev/socket-transport#concept).

## Usage

```bash
npm install -s websocket-transport
```

### Server

```js
const ws = require('ws');
const WebsocketTransport = require('websocket-transport');

const server = new ws.Server({ port: 8080 });
server.on('connection', websocket => {
  console.log('incoming connection');
  const transport = new WebsocketTransport(websocket);
  transport.on('message', message => {
    console.log('message: %j', message);
  });
  transport.on('close', err => {
    console.log('connection closed');
  });
  transport.send({
    foo: 'bar',
  });
});
```

### Client (Node.js)

```js
const ws = require('ws');
const WebsocketTransport = require('websocket-transport');

WebsocketTransport.connect({
  WebSocket: ws,
  url: 'ws://localhost:8080'
}, (err, transport) => {
  if (err)
    return console.log(err.message);
  console.log('connected');
  transport.on('message', message => {
    console.log('message: %j', message);
  });
  transport.on('close', err => {
    console.log('connection closed');
  });
  transport.send({
    cat: 'meow',
  });
});
```

### Client (Browser)

```js
const WebsocketTransport = require('websocket-transport');

WebsocketTransport.connect({
  WebSocket, // native WebSocket from global namespace
  url: 'ws://localhost:8080'
}, (err, transport) => {
  if (err)
    return console.log(err.message);
  console.log('connected');
  transport.on('message', message => {
    console.log('message: %j', message);
  });
  transport.on('close', err => {
    console.log('connection closed');
  });
  transport.send({
    cat: 'meow',
  });
});
```

### WebsocketTransport API

> For details and other methods see [common transport interface](https://github.com/yaroslav-korotaev/socket-transport#concept)

```js
const WebsocketTransport = require('websocket-transport');
```

#### Properties

##### websocket

Reference to the WebSocket instance passed to the constructor.

#### Methods

##### constructor(websocket)

Takes WebSocket instance to attach on. In browser it is the standard [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), and in Node.js it's something compatible with the [ws](https://github.com/websockets/ws) library interface.

##### send(message, callback)

In Node.js implementation `callback` will be called after the message has been writed to underlying socket. However, it is impossible to do that in browser, so callback will be called immediately.

#### Static

##### WebsocketTransport.connect(options, callback)

`options.WebSocket` - WebSocket class constructor (native WebSocket in browser or compatible with [ws](https://github.com/websockets/ws) class in Node.js)  
`options.url` - where to connect to  
`options.protocols` - protocols, optional, string or array (see [this](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) or [that](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options))  
`options.options` - options for Node.js implementation, optional, see [ws](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options))  
