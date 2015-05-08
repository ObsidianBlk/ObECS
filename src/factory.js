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

