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
        var tmp = this._super;
        this._super = _super[name];
        var ret = fn.apply(this, arguments);
        this._super = tmp;
        return ret;
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
