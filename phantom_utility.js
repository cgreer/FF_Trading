
var fs = require('fs');

function get_content_from_local_file(filePath){
    var pageContent = fs.read(filePath); 
    return pageContent;
}

function get_epoch_time(){
    return new Date()/1;
}

function inject_JQuery(){
  page.injectJs('./jquery.js');
  page.evaluate(function(){jQuery.noConflict()});
}

function inject_underscore(){
  page.injectJs('./underscore.js');
}

function get_location(){
  var address = page.evaluate(function (){
    return location.href;
    });
  return address;
}

