const EventEmitter = require('events');

const SEND_OPTIONS = {
  compress: false,
  binary: false,
  mask: false,
  fin: true,
};

class WebsocketTransport extends EventEmitter {
  constructor(websocket) {
    super();
    
    let message;
    
    this.onMessage = data => {
      if (typeof data != 'string')
        return this.close(new Error('binary data not supported'));
      try {
        message = JSON.parse(data);
      } catch (err) {
        return this.close(err);
      }
      this.emit('message', message);
    };
    this.onError = err => this.close(err);
    this.onClose = () => this.close();
    
    websocket.on('message', this.onMessage);
    websocket.on('error', this.onError);
    websocket.on('close', this.onClose);
    this.websocket = websocket;
    this.open = true;
  }
  
  detach() {
    const websocket = this.websocket;
    websocket.removeListener('message', this.onMessage);
    websocket.removeListener('error', this.onError);
    websocket.removeListener('close', this.onClose);
    this.websocket = null;
    return websocket;
  }
  
  send(message, callback) {
    this.websocket.send(JSON.stringify(message), SEND_OPTIONS, callback);
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
    websocket.removeListener('open', open);
    websocket.removeListener('error', error);
    websocket.removeListener('close', close);
    callback(null, new WebsocketTransport(websocket));
  }
  
  function error(err) {
    fail = err;
  }
  
  function close(core, reason) {
    callback(fail || new Error('connection failed'));
  }
  
  websocket.on('open', open);
  websocket.on('error', error);
  websocket.on('close', close);
  return websocket;
};

module.exports = WebsocketTransport;
