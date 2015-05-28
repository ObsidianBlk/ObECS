
var Class = require('./class');

_Signal_ID = 0;

var Signal = module.exports = Class.extend({
  init:function(){
    this._listeners = [];
  },

  listen:function(callback, cbthis){
    if (typeof(cbthis) !== 'object'){cbthis = null;}
    for(i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][1] == callback){
        return this._listeners[i][0];
      }
    }

    var idx = _Signal_ID;
    this._listeners.push([idx, callback, cbthis]);
    _Signal_ID += 1;
    return idx;
  },

  removeListener:function(callback){
    for(i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][1] == callback){
        this._listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  removeListenerByID:function(callback_id){
    for(i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][0] == callback_id){
        this._listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  signal:function(/* arguments */){
    var messages = arguments;

    for (i = 0; i < this._listeners.length; ++i) {
      if (this._listeners[i][2] !== null){
        this._listeners[i][1].apply(this._listeners[i][2], messages);
      } else {
        this._listeners[i][1].apply(null, messages);
      }
    }
  }
});
