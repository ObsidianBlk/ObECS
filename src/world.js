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
