
var fs = require('fs');

function get_content_from_local_file(filePath){
    var pageContent = fs.read(filePath); 
    return pageContent;
}

function column_to_array(fileName, column, sep){
    //return a column of data as an array
    var sep = sep || "\t";

    var fileContents = fs.open(fileName, 'r').read().split("\n");
    var returnArray = [];
    for (var i = 0; i < fileContents.length; i++) {
        var fileLine = fileContents[i];
        if (fileLine !== "") {
            returnArray.push(fileLine.split(sep)[Number(column)]); 
        }
    };
    
    return returnArray;
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

