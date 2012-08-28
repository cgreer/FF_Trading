//GET PLAYER POSITION POINTS from projected page
//(http://football.fantasysports.yahoo.com/f1/91352/4/team?stat1=P&stat2=PS_2012)
//meant to be ran from the console after injecting underscore and jquery (bookmarklet)


//team name
var teamName = $('div#teaminfo em')[0].innerHTML.replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_");

//only rows that have players in them
var rows = $('table.teamtable tr');
var posRows = _.filter(rows, function(theRow) { var posCells = $(theRow).find('td.pos'); return posCells.length });

//
_.each(posRows, function (sampleRow) {
    var checkEmpty = $(sampleRow).find('td.player div.emptyplayer');
    if (checkEmpty.length === 0){
        var pName = $(sampleRow).find('td.player a.name')[0].innerHTML.replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_");
        var pPosition = $(sampleRow).find('td.player span')[0].innerHTML.split('-')[1].replace(")", "").replace(" ", "").replace("/", ",");
        var pPoints = $(sampleRow).find('td.pts')[0].innerHTML;

        console.log(teamName + "\t" + pName + "\t" + pPosition + "\t" + pPoints);
    }
    else {
        //console.log('EMPTY');
    }
});
