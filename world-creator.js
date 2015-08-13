(function () {'use strict';

    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function WorldCreator (cfg) {
        if (!(this instanceof WorldCreator)) {
            return new WorldCreator();
        }
        cfg = cfg || {};
        if (cfg.prompt) {
            this.prompt = cfg.prompt;
        }
        if (cfg.alert) {
            this.alert = cfg.alert;
        }
        this.directions = cfg.directions || ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
    }
    WorldCreator.prototype.processJSON = function (json) {
        this.gameType = json.gameType; // roomID, treasure (and minimum), all
        this.gameValue = json.gameValue;
        this.describeDirections = json.describeDirections === undefined ? true : json.describeDirections;
        
        this.defaultRoomType = json.defaultRoomType;
        this.antagonists = json.antagonists; // id: description, strength, agility
        this.treasures = json.treasures; // id: description, value
        
        this.userPattern = json.userPattern;
        this.injuryLevels = json.injuryLevels;
        this.characterTypes = json.characterTypes;
        
        // Todo: Give choice from existing users or option to create a new one
        // Todo: Save user stats and allow reuse
        this.createCharacter(function () {
            var room = json.startingRoom;
            this.processRoom(room);
        }.bind(this));
    };
    WorldCreator.prototype.createCharacter = function (cb) {
        this.user = {};
        this.prompt("characterType", "Please choose a type of character: " + Object.keys(this.characterTypes).map(function (characterType) {
            return this.characterTypes[characterType].name;
        }, this).join(', '), function (characterType) {
            this.userPattern = this.characterTypes[characterType];
            if (!this.userPattern) {
                this.alert("wrongCharacterType", "Please choose a valid character type", function () {
                    this.createCharacter(cb);
                }, this);
                return;
            }
            
            var strength = this.userPattern.strength;
            var agility = this.userPattern.agility;
            this.user.strength = WorldCreator.getRandomIntInclusive(strength.min, strength.max);
            this.user.agility = WorldCreator.getRandomIntInclusive(agility.min, agility.max);
            this.user.treasure = 0;
            this.prompt("userName", "Please choose a name for your character", function (name) {
                this.user.name = name;
                cb();
            }, this);
        }, this);
    };
    WorldCreator.prototype.processRoom = function (room) {
        var antagonist = this.antagonists[room.antagonistID]; // description, strength, agility
        var treasure = this.treasures[room.treasureID]; // description, value
        
        var desc = room.description.replace(/\{\{antagonist\}\}/g, antagonist.description).replace(/\{\{treasure\}\}/g, treasure.description) +
            (this.describeDirections ? "You may go " + Object.keys(room.rooms).join(', ') : '') +
            '\n';
        // room.type: room/corridor/etc.

        desc += "What would you like to do (attack, north, south, etc.)?";
        
        this.prompt("action", desc, function (action) {
            if (this.directions.indexOf(action) > -1) {
                if (!room.rooms[action]) {
                    return this.alert("wrongDirection", "You can't go that direction.", function () {
                        this.processRoom(room);
                    }, this);
                }
                this.processRoom(room.rooms[action]);
            }
            else if (action === 'a' || action === 'attack') {
                var userRand = Math.random();
                var antagRand = Math.random();
                if ((userRand + this.user.strength) > (antagRand + antagonist.agility)) {
                    
                }
                this.user.agility;
                antagonist.strength;
                this.injuryLevels.user[i].replace(/\{\{user\}\}/g, this.user.name);
                this.injuryLevels.antagonist[i].replace(/\{\{antagonist\}\}/g, antagonist.description);
                
                this.user.treasure += treasure.value;
                if (this.gameType === '') { // roomID, treasure (and minimum), all
                    this.gameValue;
                }
            }
            else {
                this.alert("wrongAction", "The action you have chosen is not recognized. Please try another.", function () {
                    this.processRoom(room);
                }, this);
            }
        }, this);
    };
    WorldCreator.prototype.alert = function (code, msg, cb, thisArg) {
        alert(msg);
        cb.call(thisArg, code);
    };
    WorldCreator.prototype.prompt = function (code, desc, cb, thisArg) {
        var response = prompt(desc);
        cb.call(thisArg, response, code);
    };
    WorldCreator.prototype.createWorld = function (jsonURL) {
        if (typeof jsonURL === 'string') {
            getJSON(jsonURL, this.processJSON.bind(this));
        }
        else {
            this.processJSON(jsonURL);
        }
    };
    WorldCreator.getRandomIntInclusive = getRandomIntInclusive;
    
    window.WorldCreator = WorldCreator;
}());
