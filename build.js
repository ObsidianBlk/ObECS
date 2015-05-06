var fs = require('fs'),
    path = require('path'),
    package = require('./package.json'),
    browserify = require('browserify'),
    uglify = require('uglify-js');


function build(dest, outfile_base, options){
  options = options || {};

  console.log("Starting build...");
  var b = null;
  if (options.standalone){
    console.log("Using Standalone name '" + options.standalone + "'...");
    b = browserify({exports:['require']},{standalone:options.standalone});
  } else {
    b = browserify({exports:['require']});
  }

  if (b !== null){
    if (options.entry){
      console.log("Setting entry file to '" + options.entry + "'...");
      b.add(options.entry);
    } else {
      console.log("Setting entry file to './index.js'...");
      b.add('./index.js');
    }

    if (options.clean){
      files = fs.readdirSync(dest);
      console.log("Cleaning '" + dest + "' folder of pre-existing javascript.");
      for (var i = 0; i < files.length; i++){
        var fpath = path.join(dest, files[i]);
        if (fs.lstatSync(fpath).isFile() && path.extname(fpath).toLowerCase() === ".js"){
          fs.unlinkSync(fpath);
        }
      }
    }

    console.log("Bundling...");
    b.bundle(function(err, src){
      if (err){
        console.log(err);
      }
      var outfilename = path.join(dest, outfile_base + "-"+package["version"]+".js");
      console.log("Outputting bundled file '" + outfilename +"'...");
      fs.writeFileSync(outfilename, src.toString());
      if (options.uglify){
        outfilename = path.join(dest, outfile_base + "-"+package["version"]+".min.js");
        console.log("Outputting minified file '" + outfilename +"'...");
        var result = uglify.minify(src.toString(), {fromString: true});
        fs.writeFileSync(outfilename, JSON.stringify(result));
      }
      console.log("Success");
    });

  } else {
    console.log("Failed to obtain bundler.");
  }
}


build("./dist", package["name"], {standalone:package["name"], clean:true, uglify:true});
