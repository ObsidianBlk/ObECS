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

var Signal = module.exports = Class.extend({
  init:function(){
    this._listeners = [];
    this._signal_id = 0;
  },

  listen:function(callback, callback_owner){
    callback_owner = (typeof(callback_owner) === 'undefined') ? null : callback_owner;
    for(var i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][1] == callback){
        return this._listeners[i][0];
      }
    }

    var idx = this._signal_id;
    this._listeners.push([idx, callback, callback_owner]);
    this._signal_id += 1;
    return idx;
  },

  removeListener:function(callback, callback_owner){
    callback_owner = (typeof(callback_owner) === 'undefined') ? null : callback_owner;
    for(var i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][1] === callback && this._listeners[i][2] === callback_owner){
        this._listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  removeListenerByID:function(callback_id){
    for(var i = 0; i < this._listeners.length; i++){
      if (this._listeners[i][0] == callback_id){
        this._listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  signal:function(/* arguments */){
    var messages = arguments;

    for (var i = 0; i < this._listeners.length; ++i) {
      this._listeners[i][1].apply(this._listeners[i][2], messages);
    }
  }
});
