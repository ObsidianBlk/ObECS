var Class = require('./class');

var System = module.exports = Class.extend({
  init:function(){
    this._world = null;
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
