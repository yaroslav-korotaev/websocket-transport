const EventEmitter = require('events');

function econn() {
  return new Error('connection error');
}

class WebsocketTransport extends EventEmitter {
  constructor(websocket) {
    super();
    
    let message;
    
    this.onMessage = e => {
      try {
        message = JSON.parse(e.data);
      } catch (err) {
        return this.close(err);
      }
      this.emit('message', message);
    };
    this.onError = () => this.close(econn());
    this.onClose = () => this.close();
    
    websocket.addEventListener('message', this.onMessage);
    websocket.addEventListener('error', this.onError);
    websocket.addEventListener('close', this.onClose);
    this.websocket = websocket;
    this.open = true;
  }
  
  detach() {
    const websocket = this.websocket;
    websocket.removeEventListener('message', this.onMessage);
    websocket.removeEventListener('error', this.onError);
    websocket.removeEventListener('close', this.onClose);
    this.websocket = null;
    return websocket;
  }
  
  send(message, callback) {
    this.websocket.send(JSON.stringify(message));
    if (callback)
      return callback();
  }
  
  close(err) {
    if (!this.open)
      return;
    
    this.websocket.close();
    this.open = false;
    
    this.emit('close', err);
  }
}

WebsocketTransport.connect = function connect(options, callback) {
  const websocket = new options.WebSocket(options.url, options.protocols, options.options);
  let fail = null;
  
  function open() {
    websocket.removeEventListener('open', open);
    websocket.removeEventListener('error', error);
    websocket.removeEventListener('close', close);
    callback(null, new WebsocketTransport(websocket));
  }
  
  function error() {
    fail = econn();
  }
  
  function close() {
    callback(fail || econn());
  }
  
  websocket.addEventListener('open', open);
  websocket.addEventListener('error', error);
  websocket.addEventListener('close', close);
  return websocket;
};

module.exports = WebsocketTransport;
