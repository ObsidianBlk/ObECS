var Class = require('./class');
var Signal = require('./signals');
var Factory = require('./factory');
var System = require('./system');


var World = module.exports = Class.extend({
  init:function(){
    this._factory = new Factory();
    this._systems = [];
    this._entities = {};
  },

  factory:function(){
    return this._factory;
  },

  assignSystem:function(system){
    if (system && ( system instanceof System )){
      if (system.setFactory){
        system.setFactory(this._factory);
      }
      if (system.update){
        this.signalUpdate.add(system.update, system);
      }
      if (system.assignEntity){
        this.signalAssignEntity.add(system.assignEntity, system);
      }
      if (system.removeEntity){
        this.signalRemoveEntity.add(system.removeEntity, system);
      }
      if (system.assignedWorld){
        system.assignedWorld(this);
      }
      this._systems.push(system);
    }
    return system;
  },

  assignEntity:function(entity){
    if (entity && entity.id){
      if (!(entity.id in this._entities)){
        this._entities[entity.id] = entity;
        this.signalAssignEntity.emit(entity);
      }
    }
  },

  removeEntity:function(entity){
    if (entity && entity.id){
      if (entity.id in this._entities){
        delete this._entities[entity.id];
        this.signalRemoveEntity.emit(entity);
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
    this.signalUpdate.emit(info);
  },


  // -------------------------------------------------------------------------------------
  // SIGNALS...
  // -------------------------------------------------------------------------------------

  signalUpdate:new Signal(),
  signalAssignEntity:new Signal(),
  signalRemoveEntity:new Signal(),
});
