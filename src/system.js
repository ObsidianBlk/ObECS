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
var World = require('./world');

var System = module.exports = Class.extend({
  /** 
   * Contructor for the System class.
   *  
   * @param world         [Optional] The World object to assign to this system.
   * @param listener_list [Optional] An array of the following format: [[<event_name_string>, <callback_function>], ...]
   */
  init:function(world, listener_list){
    this._world = null;
    if (world !== null){
      this.assignWorld(world, listener_list);
    }
  },

  /** 
   * Assigns the given world object to this system and sets up event listeners (if given) if no world object is already defined.
   * NOTE: All callback functions given in the listener_list is assumed to be a function within THIS system's prototype.
   *
   * @param world         The World object to assign to this system.
   * @param listener_list [Optional] An array of the following format: [[<event_name_string>, <callback_function>], ...]
   */ 
  assignWorld:function(world, listener_list){
    if (world instanceof World && this._world === null){
      this._world = world;
      if (typeof(listener_list) !== 'undefined'){
        for (var i=0; i < listener_list.length; i++){
          this._world.event().listen(listener_list[i][0], listener_list[i][1], this);
        }
      }
    }
  },

  /** 
   * Returns the World object assigned to this System object.
   *  
   * @return The World object assigned to this System object.
   */ 
  world:function(){
    return this._world;
  }
});
