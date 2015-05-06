var Class = require('./class');
var Signal = require('./signals');
var Factory = require('./factory');

var System = module.exports = Class.extend({
  init:function(factory){
    this._factory = null;
    if (factory){
      this.setFactory(factory);
    }
  },


  setFactory:function(factory){
    if (factory && ( factory instanceof Factory ) && this._factory != null){
      this._factory = factory;
      this._factory.signalEntityRegistered.add(this.onEntityRegistered, this);
      this._factory.signalEntityRemoved.add(this.onEntityRemoved, this);
    }
  },

  /*
  * This method is called by any World object this System is attached to.
  * The argument "info", when defined, is intended to be an object containing any data the app developer required during an update call.
  */
  update:function(info){},

  /*
  * Called when this System is assigned to a World object. This method can be used for system setup operations.
  * world is the World object which this System was assigned to.
  */
  assignedWorld:function(world){},

  /*
  * Called when a new entity has been assigned to the World object this System is assigned to.
  * It is up to the System whether the given entity needs to be tracked.
  */
  assignEntity:function(entity){},

  onEntityRegistered:function(entity){},
  onEntityRemoved:function(entity){},
});
