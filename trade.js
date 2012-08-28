
//includes
phantom.injectJs('./underscore.js');
phantom.injectJs('./jquery.js');
phantom.injectJs('./phantom_utility.js');

//globals
yourTeamName="Darren_U_2_Lock_Me";
injectionPositions =        ["QB", "QB", "WR", "WR", "WR", "WR", "RB", "RB", "TE", "RB", "WR", "K", "K", "DEF", "DEF", "S", "CB", "DE"];
startingPositionInjections = [137, 137,   73,   67,   67,   67,   107,  87,   60,   87,   67,   65, 65,   190,   190,   20,  20,   30];

teamStartingPositions = ["QB", "QB", "WR", "WR", "WR", "WR", "RB", "RB", "TE", "W/R", "W/T"];
//teamStartingPositions = ["QB", "QB", "WR", "WR", "WR", "WR", "RB", "RB", "TE", "W/R", "W/T", "K", "K", "DEF", "DEF", "DB", "DL", "D"];
position_acceptablePlayerType = { "QB" : ["QB"],
                                  "WR" : ["WR"],
                                  "RB" : ["RB"],
                                  "TE" : ["TE"],
                                  "W/R" : ["WR", "RB"],
                                  "W/T" : ["WR", "TE"],
                                  "K" : ["K"],
                                  "DEF" : ["DEF"],
                                  "D" : ["S", "CB", "DE", "DT", "LB"],
                                  "DB" : ["S", "CB"],
                                  "DL" : ["DT", "DE"]};


function player (id, name, positions, points){
    this.id = id || "NA";
    this.name = name || "NONE";
    this.positions = positions || ["NONE"];
    this.points = points || 0;

    this.inspect = function(){
        console.log('id' + 'name' + 'positions' + 'points');
    }
}

function team (id, name){
    this.id = id || "NA";
    this.name = name || "NONE";
    this.id_player = {};
    
    this.trade_player_to = function(teamTo, playerID){

        //trade a player
        teamTo.add_player(this, playerID);
        this.remove_player(playerID);
    }

    this.add_player = function(fromTeam, playerID){
        //add from another team, not from data
        var playerToAdd = fromTeam.id_player[playerID];
        this.id_player[playerID] = fromTeam.id_player[playerID];
    }
    
    this.remove_player = function(playerID){
        delete this.id_player[playerID];
    }

    this.create_player = function(id, name, positions, points){
        this.id_player[id] = new player(id, name, positions, Number(points));
    }

    this.inspect = function (){
    _.each(_.values(this.id_player), function (p){log_sep(p.id, p.name, p.positions, p.points)});

    //total points
    var allPoints = _.map(_.values(this.id_player), function(p) {return p.points});
    console.log(_.reduce( allPoints, function(a,b) {return Number(a) + Number(b)}));
}
}

function select_best_starting_players(team){

    //sort teams players based on points
    var playersByPoints = _.sortBy( _.values(team.id_player), function (x){return x.points});
    playersByPoints.reverse();
    ////_.each(playersByPoints, function (x){console.log(x.name + " " + x.positions)});

    //Fill each position with highest scoring player
    //TODO is filling WR first and then WR/TE better?
    var bestTeam = [];
    _.each(teamStartingPositions, function(sPosition){

            //only get players at this position that PLAY that position (one player --> multiple positions is possible)
            //log_sep("OPTIMIZING", sPosition);            
            var possiblePositions = position_acceptablePlayerType[sPosition];
            //log_sep(" POSSIBLE POSITIONS", possiblePositions);
            var thoseBestAtPosition = _.filter(playersByPoints, function(p){ return (_.intersection(p.positions, possiblePositions).length > 0 )}); 
            //log_sep(" POSSIBLE PLAYERS:", _.pluck(thoseBestAtPosition, "name"));

            //add player to the team @ this position IF THERE ARE ANY
            if ( ! _.isEmpty(thoseBestAtPosition) ){
                //log_sep("  PICKED:", thoseBestAtPosition[0].name, thoseBestAtPosition[0].points);
                bestTeam.push(thoseBestAtPosition[0]);
                playersByPoints = _.without(playersByPoints, thoseBestAtPosition[0]);

            }

            });
   
    return bestTeam;

}

function python_range(startNum, endNum){
    //just for simple integer ranges
    var rangeArray = [];
    for (var i = startNum; i < endNum; i++){
        rangeArray.push(i);
    }
    return rangeArray;
}

function py_join(sep){
    //join an array of strings with a seperator
    //other arguments are strings to be joined
    var seperatedString = "";
    for (var i = 1; i < arguments.length; i++){
        if (i === arguments.length - 1){
            seperatedString = seperatedString + arguments[i];
        }
        else {
            seperatedString = seperatedString + arguments[i] + sep;
        }
    }

    return seperatedString;
}
    //var tradeIDPairs = [];
    //generateCombinations(idCombinations1, idCombinations2, function(com){tradeIDPairs.push(com);});

    //console.log(JSON.stringify(tradeIDPairs));

function log_sep(){
    //just print out stuff with tabs in between so I don't have to type out console.log(py_join("\t", blah)) everytime
    //TODO FINISH
    //apparently console.log does this by default with multiple arguments....whooops
    var sep = "\t";
    var seperatedString = "";
    for (var i = 0; i < arguments.length; i++){
        if (i === arguments.length - 1){
            seperatedString = seperatedString + arguments[i];
        }
        else {
            seperatedString = seperatedString + arguments[i] + sep;
        }
    }

    console.log(seperatedString);
}

function create_player_from_tab_data(id, tabData){
    //assumes data is in NAME POSITIONS POINTS format
    var t = tabData.split('\t');
    var positions = t[2].split(',');
    var newPlayer = new player(id, t[1], positions, Number(t[3]));

    return newPlayer;

}


function inspect_best_configuration(t){
    _.each(t, function (p){log_sep(p.id, p.name, p.positions, p.points)});

    //total points
    var allPoints = _.map(t, function(p) {return p.points});
    console.log(_.reduce( allPoints, function(a,b) {return Number(a) + Number(b)}));
}

function sum_team_points(t){
    var allPoints = _.map(t, function(p) {return p.points});
    return _.reduce( allPoints, function(a,b) {return Number(a) + Number(b)});

}

function generateCombinations(array, r, callback) {
    //from internet...
    function equal(a, b) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] != b[i]) return false;
        }
        return true;
    }
    function values(i, a) {
        var ret = [];
        for (var j = 0; j < i.length; j++) ret.push(a[i[j]]);
        return ret;
    }
    var n = array.length;
    var indices = [];
    for (var i = 0; i < r; i++) indices.push(i);
    var final = [];
    for (var i = n - r; i < n; i++) final.push(i);
    while (!equal(indices, final)) {
        callback(values(indices, array));
        var i = r - 1;
        while (indices[i] == n - r + i) i -= 1;
        indices[i] += 1;
        for (var j = i + 1; j < r; j++) indices[j] = indices[i] + j - i;
    }
    callback(values(indices, array));
}

function analyze_all_n_by_n(team1, team2, nPlayers1, nPlayers2){
    //analyze all n by n (e.g. 2 players for 2 players, 1 for 2, etc)
    var oneIDs = _.keys(team1.id_player); 
    var twoIDs = _.keys(team2.id_player); 

    var idCombinations1 = [];
    var idCombinations2 = [];
    _.each([[oneIDs, nPlayers1, idCombinations1], [twoIDs, nPlayers2, idCombinations2]], function(cInfo){
            generateCombinations(cInfo[0], cInfo[1], function(com){cInfo[2].push(com);});
            });

    var tradeIDPairs = [];
    generateCombinations(idCombinations1, idCombinations2, function(com){tradeIDPairs.push(com);});

    for (var index1 in idCombinations1){
        for (var index2 in idCombinations2){
            //log_sep(idCombinations1[index1], idCombinations2[index2]);
            analyze_trade(team1, team2, idCombinations1[index1], idCombinations2[index2]);
        }
    }
    //_.each(tradeIDPairs, function(idPairs){analyze_trade(team1, team2, idPairs[0], idPairs[1])}); 
}

function analyze_trade(team1, team2, playerIDs1, playerIDs2, inspect){
    //trade will be made from copies of team1 and team2

    var inspect = inspect || false;

    //make copies to not mess up original teams
    var teamCopy1 = $.extend(true, {}, team1);
    var teamCopy2 = $.extend(true, {}, team2);
    
    //inject FA picks into team, this is viewed as "you can pick these guys up and put them in slots so count them"
    var injectCounter = 5000;
    var injectPosition__points = _.zip(injectionPositions, startingPositionInjections);
    _.each(injectPosition__points, function (iPos__points){
            var faName = "FA_" + iPos__points[0];
            var faPositions = iPos__points[0];
            var faPoints = iPos__points[1]; 
            teamCopy1.create_player(injectCounter, faName, [faPositions], faPoints); 
            injectCounter++;
            teamCopy2.create_player(injectCounter, faName, [faPositions], faPoints); 
            injectCounter++;
            }); 

    //get a teams best projections for the current teams
    var bestConfigBefore1 = select_best_starting_players(teamCopy1);
    var bestConfigBefore2 = select_best_starting_players(teamCopy2);
    var bestPointsBefore1 = sum_team_points(bestConfigBefore1);
    var bestPointsBefore2 = sum_team_points(bestConfigBefore2);

    //make trades
    var playersTraded1 = [];
    _.each(playerIDs1, function (pID){
            playersTraded1.push(teamCopy1.id_player[pID].name + "(" + pID + ")");
            teamCopy1.trade_player_to(teamCopy2, pID);
            });
    
    var playersTraded2 = [];
    _.each(playerIDs2, function (pID){
            playersTraded2.push(teamCopy2.id_player[pID].name + "(" + pID + ")");
            teamCopy2.trade_player_to(teamCopy1, pID);
            });

    //calculate best teams after trade
    var bestConfigAfter1 = select_best_starting_players(teamCopy1);
    var bestConfigAfter2 = select_best_starting_players(teamCopy2);
    var bestPointsAfter1 = sum_team_points(bestConfigAfter1);
    var bestPointsAfter2 = sum_team_points(bestConfigAfter2);

    //get players who were dropped/promoted to a team
    var added = _.map(_.difference(bestConfigAfter1, bestConfigBefore1), function (p){return p.name});
    var dropped = _.map(_.difference(bestConfigBefore1, bestConfigAfter1), function (p){return p.name});
    var added2 = _.map(_.difference(bestConfigAfter2, bestConfigBefore2), function (p){return p.name});
    var dropped2 = _.map(_.difference(bestConfigBefore2, bestConfigAfter2), function (p){return p.name});
    var configBefore = _.map(bestConfigBefore1, function (p){return p.name});
    var configAfter = _.map(bestConfigAfter1, function (p){return p.name});

    //report
    var pointsDifference1 = Math.round(bestPointsAfter1 - bestPointsBefore1);
    var pointsDifference2 = Math.round(bestPointsAfter2 - bestPointsBefore2);
    var pointsDifferenceTotal = pointsDifference1 + pointsDifference2;
    log_sep(teamCopy1.name, teamCopy2.name, playersTraded1, playersTraded2, pointsDifference1, pointsDifference2, pointsDifferenceTotal, dropped, added, dropped2, added2);

    if (inspect){
        console.log("PLAYER ONE BEFORE CONFIG");
        inspect_best_configuration(bestConfigBefore1);
        console.log("PLAYER ONE AFTER CONFIG");
        inspect_best_configuration(bestConfigAfter1);
        console.log("PLAYER TWO BEFORE CONFIG");
        inspect_best_configuration(bestConfigBefore2);
        console.log("PLAYER TWO AFTER CONFIG");
        inspect_best_configuration(bestConfigAfter2);
    }

}

function create_teams_from_local_data(fileName){

    var tName_team = {};
    var iCount = 0;
    var playerData = get_content_from_local_file(fileName);
    _.each(playerData.split("\n"), function (line) { 

            //end file
            if (line === ""){ return };

            //create new team if this team hasnt been loaded yet
            var tName = line.split("\t")[0];
            if ( ! _.has(tName_team, tName)){
                tName_team[tName] = new team(_.size(tName_team) + 1, tName);
            }
            
            //add player to team
            iCount++;
            tName_team[tName].id_player[iCount] = create_player_from_tab_data(iCount, line); 
            });

    return tName_team;

}
///////MAIN//////////

var system = require('system');
if (system.args.length !== 3) {
    console.log('USAGE: num_players_you_trade num_players_you_get\nEXAMPLE: phantomjs trade.js 1 2');
    phantom.exit();
}
else {
    var tName_team = create_teams_from_local_data("./final.scraped.txt");

    //do some trading
    //analyze_trade(tName_team["Darren_U_2_Lock_Me"], tName_team["Collmie_Maybe"], ["4","10"], ["22"], true);
    var otherTeamNames = _.keys(tName_team);
    otherTeamNames = _.difference(otherTeamNames, [yourTeamName]);
    _.each(otherTeamNames, function(otherTeamName){
            console.log(system.args);
            analyze_all_n_by_n(tName_team[yourTeamName], tName_team[otherTeamName], Number(system.args[1]), Number(system.args[2]));
            
            });

    //get out of here
    phantom.exit();
}
