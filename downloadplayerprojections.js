
//includes
phantom.injectJs('./jquery.js');
phantom.injectJs('./underscore.js');
phantom.injectJs('./phantom_utility.js');

//globals
var configData = column_to_array('./info.config', 0);
username = configData[0];
myPassword = configData[1];
if (myPassword[0] === "*") {
    console.log("CHANGE PASSWORD IN info.config");
    phantom.exit();
}
remainingPointsURL = "http://football.fantasysports.yahoo.com/f1/91352/REPLACE_ME/team?_scrumb=BoJKhRvhQE5&stat1=P&stat2=PSR_2012";

processState = 'homepage';
page = require('webpage').create();
visitedPages = {};

//modular relevant functions
function do_login(){
  page.evaluate(function (uname, pw){
    jQuery('input#username').val(uname);
    jQuery('input#passwd').val(pw);
    jQuery('form#login_form').submit();
    }, username, myPassword);
}

function replace_all(replaceString, replacing, replaceWith){
    //replace fxn just replaces first instance...
    while (true){
        replaceStringAfter = replaceString.replace(replacing, replaceWith); 
        if (replaceStringAfter === replaceString){
            return replaceString;
        }
        else{
            replaceString = replaceStringAfter;
        }
    }
}

function grab_team_player_projections(){
     
    //have to wait because dynamic content must load
    setTimeout(function() {
        page.evaluate(function(replace_all) {
           
            var teamName = $('div#teaminfo em')[0].innerHTML;
            teamName = replace_all(teamName, " ", "_");

            //only rows that have players in them
            var rows = $('table.teamtable tr');
            var posRows = _.filter(rows, function(theRow) {
                var posCells = $(theRow).find('td.pos'); 
                return posCells.length;
                });

            //write player data to screen
            _.each(posRows, function (sampleRow) {
                var checkEmpty = $(sampleRow).find('td.player div.emptyplayer'); //these are for slots not filled
                if (checkEmpty.length === 0){
                    var pName = $(sampleRow).find('td.player a.name')[0].innerHTML;
                    pName = replace_all(pName, " ", "_");

                    var pPosition = $(sampleRow).find('td.player span')[0].innerHTML.split('-')[1];
                    pPosition = pPosition.replace(")", "").replace(" ", "").replace("/", ",");

                    var pPoints = $(sampleRow).find('td.pts')[0].innerHTML;

                    console.log("SCRAPED:" + teamName + "\t" + pName + "\t" + pPosition + "\t" + pPoints);
                }
                else {
                    //console.log('EMPTY');
                }
            });
        }, replace_all);
        phantom.exit(); //exit after one scrape completes
    }, 3000);
}

function py_range(startNum, endNum){
    //just for simple integer ranges
    var rangeArray = [];
    for (var i = startNum; i < endNum; i++){
        rangeArray.push(i);
    }
    return rangeArray;
}

page.onConsoleMessage = function (msg) { console.log(msg); };

page.onLoadFinished = function (status){

  if (status == 'success'){
    
    //add libraries to the page
    page.injectJs('./underscore.js');
    page.injectJs('./jquery.js');

    if (processState == 'homepage'){
        do_login();
        processState = 'teampage';
    }
    else if(processState == 'teampage'){
        //console.log('Attempting to get links');
        var currentLocation = get_location();
        if (! _.has(visitedPages, currentLocation)){
            grab_team_player_projections();
            visitedPages[currentLocation] = 1; //sets in js?
        }
    }
  } 
  else {
    console.log('failed to load page');
    phantom.exit();
  }
}


//HERE WE GO!
var system = require('system');
if (system.args.length === 1) {
    console.log('PASS TEAM NUMBER (ITS THE RANK IN THE DROP DOWN MENU)');
    phantom.exit();
}
else {
    var teamURL = remainingPointsURL.replace("REPLACE_ME", system.args[1]);
    console.log("CURRENT URL", teamURL);
    page.open(teamURL);
}
