var Class = require('./class');
var Signal = require('./signal');


module.exports = Class.extend({
  init:function(){
    this._events = {};
  },

  listen:function(event_name, func, func_owner){
    if (typeof(func_owner) === 'undefined'){func_owner = null;}
    if (!(event_name in this._events)){
      this._events[event_name] = new Signal();
    }
    this._events[event_name].listen(func, func_owner);
  },

  signal:function(event_name, data){
    if (!(event_name in this._events)){
      this._events[event_name] = new Signal();
      // NOTE: There's no point in emitting this event NOW... we just created it!
    } else {
      this._events[event_name].signal(event_name, data);
    }
  },
});
