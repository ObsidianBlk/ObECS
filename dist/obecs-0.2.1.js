(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.obecs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  Class : require('./src/class'),
  Signal : require('./src/signal'),
  Event: require('./src/event'),
  Factory: require('./src/factory'),
  System: require('./src/system'),
  World: require('./src/world')
};

},{"./src/class":2,"./src/event":3,"./src/factory":4,"./src/signal":5,"./src/system":6,"./src/world":7}],2:[function(require,module,exports){
/*
* JavaScript Class Inheritance system.
* Written by: John Resig (http://ejohn.org/blog/simple-javascript-inheritance/)
* MIT Licensed.
*
* Slight Modification By: Bryan "ObsidianBlk" Miller
*/

var initializing = false;
var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

var Class = module.exports = function(){}

Class.extend = function(prop){
  var _super = this.prototype;

  initializing = true;
  var prototype = new this();
  initializing = false;

  for (name in prop){
    prototype[name] = (typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])) ?
      (function(name, fn){
        return function(){
          var tmp = this._super;
          this._super = _super[name];
          var ret = fn.apply(this, arguments);
          this._super = tmp;
          return ret;
        };
      })(name, prop[name]) : prop[name];
  }

  function Class(){
    if (!initializing && this.init){
      this.init.apply(this, arguments);
    }
  }

  Class.prototype = prototype;
  Class.prototype.contructor = Class;
  Class.extend = arguments.callee;

  return Class;
}

},{}],3:[function(require,module,exports){
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

},{"./class":2,"./signal":5}],4:[function(require,module,exports){
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

function _GenerateUUID(){
  // This method's operations are from StackOverflow response by...
  // broofa ... ( http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript )
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}



var Factory = module.exports = Class.extend({
  Assembler:(function(){
    return Class.extend({
      init:function(factory){
        this._factory = factory;
        this._entity = this._factory.createEntity();
      },

      c:function(component_name){
        this._factory.addComponent(this._entity, component_name);
        return this;
      },

      finish:function(eid){
        var e = this._entity;
        this._entity = this._factory.createEntity();
        if (eid !== undefined){
          this._entity.id = eid;
        }
        return e;
      }
    });
  })(),


  init:function(default_component_value){
    default_component_value = default_component_value || null;
    this._components = {};
    this._assembleges = {};
    if (typeof(default_component_value) === 'object'){
      this._default_component_value = [true, JSON.stringify(default_component_value)];
    } else {
      this._default_component_value = [false, default_component_value];
    }
  },

  /*
  * If component_name is not already defined for this factory, converts cobj to a JSON string and stores that string as a component of the factory.
  * NOTE: This method will convert the given object into a JSON string. Therefore, it is assumed all components are pure data without any methods associated with them.
  * Any object given that contains methods will most likely loose those methods via this process.
  */
  defineComponent:function(component_name, component_value){
    if (component_name in this._components){return;}
    if (typeof(component_value) === 'object'){
      this._components[component_name] = [true, JSON.stringify(component_value)]; // Store it as a JSON string if we're given an object.
    } else {
      this._components[component_name] = [false, component_value]; // Store it as a default value if it's NOT an object.
    }
  },

  /*
  * Adds component_name to the given entity if entity doesn't already have a propery with the same name.
  * If no component was defined in this Factory with the given component_name, then entity[component_name] is constructed with a default value,
  * otherwise, entity[component_name] will be set to the object defined in the Factory by component_name.
  *
  * NOTE: The Factory stores object components as JSON strings. The creation of a defined object component is the result of JSON.parse(component_string) where
  * component_string is stored in the Factory.
  */
  addComponent:function(entity, component_name){
    if (component_name in entity){return;}

    var val = this._default_component_value;
    if (component_name in this._components){
      val = this._components[component_name];
    }

    if (val[0]){
      entity[component_name] = JSON.parse(val[1]);
    } else {
      entity[component_name] = val[1];
    }
  },

  defineAssemblege:function(assemblege_name, def){
    if (assemblege_name in this._assembleges){return;}

    if (!def || def === null){return;}

    if (typeof(def) === 'object'){
      var e = def;
      if (def.constructor === Array){
        var a = new Factory.prototype.Assembler(this);
        for (var i = 0; i < def.length; i++){
          a.c(def[i]);
        }
        e = a.finish();
        delete e.id; // We don't need the ID to register the assemblage.
      }
      this._assembleges[assemblege_name] = JSON.stringify(e);
    }
  },

  createAssembler:function(){
    return new Factory.prototype.Assembler(this);
  },

  createEntity:function(assemblege_name, eid){
    assemblege_name = assemblege_name | "";
    var e = {};
    if (assemblege_name in this._assembleges){
      e = JSON.parse(this._assembleges[assemblege_name]);
    }
    if (eid !== undefined){
      e.id = eid;
    } else {
      e.id = _GenerateUUID();
    }
    return e;
  },

  cloneEntity:function(entity, eid){
    var e = this._clone(entity);
    if (eid !== undefined){
      e.id = eid;
    } else {
      e.id = _GenerateUUID();
    }
    return e;
  },


  // -------------------------------------------------------------------------------------
  // PRIVATE METHODS...
  // -------------------------------------------------------------------------------------

  _clone:function(obj){
    if (obj === null || typeof(obj) !== 'object'){
      return obj;
    }

    temp = obj.constructor();
    for (var key in obj){
      if (key !== 'id'){
        temp[key] = this._clone(obj[key]);
      }
    }
    return temp;
  }
});


},{"./class":2}],5:[function(require,module,exports){
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

},{"./class":2}],6:[function(require,module,exports){
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

},{"./class":2,"./world":7}],7:[function(require,module,exports){
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
var Event = require('./event');
var Factory = require('./factory');
var System = require('./system');


var World = module.exports = Class.extend({
  /** 
   * Default constructor for the World Class.
   *
   * An optional options argument can be passed which allows to definition of alternate Event and Factor classes (derived from the default Event and Factory classes).
   * This object is defined as:
   *
   * {
   *   factory_class:<factory_class_function>, // [Optional]
   *   event_class:<event_class_function> // [Optional]
   * }
   *  
   * @param options [Optional] Object containing one or more options to be used by the World class.
   */ 
  init:function(options){
    if (typeof(options) === 'undefined'){options = {};}

    this._factory = (options.factory_class) ? new options.factory_class() : new Factory();
    this._event = (options.event_class) ? new options.event_class() : new Event();

    this._entities = {};
  },

  /** 
   * Returns the Factory object of this World.
   *  
   * @return Factory object.
   */ 
  factory:function(){
    return this._factory;
  },

  /** 
   * Returns the event object of this World.
   *  
   * @return Event object
   */ 
  event:function(){
    return this._event;
  },

  /** 
   * Assigns the given entity object to the world.
   *
   * Entities are not a defined object. As long as an object with an .id property is passed, that object is considered an entity by the system.
   * Entity.id must be unique for each entity.
   *
   * Emits "assign_entity" signal, passing the given entity object as an event value. Any system that wants to pick up entities should listen for this event and
   * test all passed entities for their own validity within the system.
   *  
   * @param entity Any object {} with a unique .id property value.
   */ 
  assignEntity:function(entity){
    if (typeof(entity) === 'object' && typeof(entity.id) !== 'undefined'){
      if (!(entity.id in this._entities)){
        this._entities[entity.id] = entity;
        this._event.signal("assign_entity", entity);
      }
    }
  },

  /** 
   * Removes the given entity from the world.
   *
   * The given entity must be a valid object as discussed in the assignEntity() function.
   * Nothing occurs if...
   *   The entity is not an object
   *   The given entity does not have a public .id property
   *   No entity with the same .id value is stored in the world object.
   *
   * Emits "remove_entity" signal, passing the given entity object as an event value. Any system containing entities should listen to this event.
   *  
   * @param entity An object {} with a unique .id propery value.
   */ 
  removeEntity:function(entity){
    if (entity && entity.id){
      if (entity.id in this._entities){
        delete this._entities[entity.id];
        this._event.signal("remove_entity", entity);
      }
    }
  },

  /** 
   * Removes an entity from the world who's ID matches the eid given.
   *
   * NOTE: This function will call removeEntity(entity) if eid is found in the world object.
   * 
   * @param eid String id value of an entity.
   */ 
  removeEntityByID:function(eid){
    if (eid in this._entities){
      this.removeEntity(this._entities[eid]);
    }
  },

  /** 
   * Returns an entity object with the given eid ID value, or null if no entity with given eid is stored.
   *  
   * @param eid String id value of an entity
   * @return The entity object with the given id value or null is there is no such entity.
   */ 
  getEntityByID:function(eid){
    if (eid in this._entities){
      return this._entities[eid];
    }
    return null;
  },

  /** 
   * A simple helper function for emitting an "update" signal to any System (or object) that may be listening for that event.
   *  
   * @param info [Optional] Any data that is used by update handlers listening for this event.
   */ 
  update:function(info){
    info = (typeof(info) === 'undefined') ? null : info;
    this._event.signal("update", info);
  }
});

},{"./class":2,"./event":3,"./factory":4,"./system":6}]},{},[1])(1)
});