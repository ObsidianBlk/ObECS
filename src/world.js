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
