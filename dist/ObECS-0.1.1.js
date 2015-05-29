(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ObECS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./class":2,"./signal":5}],4:[function(require,module,exports){
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

},{"./class":2}],6:[function(require,module,exports){
var Class = require('./class');

var System = module.exports = Class.extend({
  init:function(){
    this._world = null;
  },

  world:function(){
    return this._world;
  },

  /*
  * Called when this System is assigned to a World object.
  */
  assignedWorld:function(world){
    if (this._world === null){
      this._world = world;
      this._world.event().listen("assign_entity", this.onAssignEntity, this);
    }
  },


  /*
  * Handler for notifying System of possible entity for assignment.
  * NOTE: Not all entities passed are intended for this System. It's expected that each System checks in the entity is one it tracks. Multiple Systems can track the same entity.
  */
  onAssignEntity:function(event, entity){},
});

},{"./class":2}],7:[function(require,module,exports){
var Class = require('./class');
var Event = require('./event');
var Factory = require('./factory');
var System = require('./system');


var World = module.exports = Class.extend({
  init:function(options){
    if (typeof(options) === 'undefined'){options = {};}

    this._factory = (options.factory_class) ? new options.factory_class() : new Factory();
    this._event = (options.event_class) ? new options.event_class() : new Event();

    this._systems = [];
    this._entities = {};
  },

  factory:function(){
    return this._factory;
  },

  event:function(){
    return this._event;
  },

  assignSystem:function(system){
    if (system && ( system instanceof System )){
      system.assignedWorld(this);
      this._systems.push(system);
    }
    return system;
  },

  assignEntity:function(entity){
    if (entity && entity.id){
      if (!(entity.id in this._entities)){
        this._entities[entity.id] = entity;
        this._event.signal("assign_entity", entity);
      }
    }
  },

  removeEntity:function(entity){
    if (entity && entity.id){
      if (entity.id in this._entities){
        delete this._entities[entity.id];
        this._event.signal("remove_entity", entity);
      }
    }
  },

  removeEntityByID:function(eid){
    if (eid in this._entities){
      this.removeEntity(this._entities[eid]);
    }
  },

  getEntityByID:function(eid){
    if (eid in this._entities){
      return this._entities[eid];
    }
    return undefined;
  },

  update:function(info){
    info = info | {};
    this._event.signal("update", info);
  },
});

},{"./class":2,"./event":3,"./factory":4,"./system":6}]},{},[1])(1)
});