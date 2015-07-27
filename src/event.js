/********************************************************************************
* The MIT License (MIT)
*
* Copyright (c) 2015 Bryan J. Miller
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
********************************************************************************/


var Class = require('./class');
var Signal = require('./signal');


module.exports = Class.extend({
  /** 
   * Default constructor.
   */ 
  init:function(){
    this._events = {};
  },

  /** 
   * Stores the given callback (and owner) in a Signal object of the given event_name.
   *  
   * @param event_name     String name of the signal in which to store the callback.
   * @param callback       Function to call when the signal is emitted
   * @param callback_owner [Optional] The object in which the callback function is defined.
   */ 
  listen:function(event_name, callback, callback_owner){
    if (typeof(callback_owner) === 'undefined'){callback_owner = null;}
    if (!(event_name in this._events)){
      this._events[event_name] = new Signal();
    }
    this._events[event_name].listen(callback, callback_owner);
  },

  /** 
   * Removes the given callback from the given event_name.
   *  
   * @param event_name     String name of the signal in which to store the callback.
   * @param callback       Function to call when the signal is emitted
   * @param callback_owner [Optional] The object in which the callback function is defined.
   */ 
  unlisten:function(event_name, callback, callback_owner){
    if (event_name in this._events){
      this._events[event_name].removeListener(callback, callback_owner);
    }
  },

  /** 
   * Signals the event of the given event_name and passes the given data along to all of the callbacks listening to this signal.
   *  
   * @param event_name  String name of the signal in which to store the callback.
   * @param data        [Optional] The data to pass to all callbacks listening for this signal.
   */ 
  signal:function(event_name, data){
    if (!(event_name in this._events)){
      this._events[event_name] = new Signal();
      // NOTE: There's no point in emitting this event NOW... we just created it!
    } else {
      this._events[event_name].signal(event_name, data);
    }
  }
});
