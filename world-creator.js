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
        this.describeChildRooms = json.describeChildRooms === undefined ? true : json.describeChildRooms;
        
        this.defaultRoomType = json.defaultRoomType;
        this.antagonists = json.antagonists; // id: name, strength, agility
        this.treasures = json.treasures; // id: name, value
        
        var userType = json.userType;
        var strength = userType.strength;
        var agility = userType.agility;
        
        // Todo: Give choice from existing users or option to create a new one
        // Todo: Save user stats and allow reuse
        this.user = {};
        this.user.strength = getRandomIntInclusive(strength.min, strength.max);
        this.user.agility = getRandomIntInclusive(agility.min, agility.max);
        this.user.treasure = 0;
        
        var room = json.room;
        this.processRoom(room);
    };
    WorldCreator.prototype.processRoom = function (room) {
        var antagonist = this.antagonists[room.antagonistID]; // name, strength, agility
        var treasure = this.treasures[room.treasureID]; // name, value
        
        var desc = (room.description ||
            ("You are in a " +
                (room.type || this.defaultRoomType) +
                (this.describeChildRooms ? "You may go " + Object.keys(room.childRooms).join(', ') : '')
            )) + '\n';
        // room.type: room/corridor/etc.

        if (antagonist && antagonist.name) {
            desc += "You see a " + antagonist.name + '.\n';
        }
        if (treasure && treasure.name) {
            desc += "There is also a " + treasure.name + '.\n';
        }
        desc += "What would you like to do (attack, north, south, etc.)?";
        
        this.prompt(desc, function (action) {
            if (this.directions.indexOf(action) > -1) {
                if (!room.childRooms[action]) {
                    return this.alert("You can't go that direction.", function () {
                        this.processRoom(room);
                    }.bind(this));
                }
                this.processRoom(room.childRooms[action]);
            }
            else if (action === 'a' || action === 'attack') {
                var userRand = Math.random();
                var antagRand = Math.random();
                if ((userRand + this.user.strength) > (antagRand + antagonist.agility)) {
                    
                }
                this.user.agility;
                antagonist.strength;
                
                this.user.treasure += treasure.value;
                if (this.gameType === '') { // roomID, treasure (and minimum), all
                    this.gameValue;
                }
            }
        }.bind(this));
    };
    WorldCreator.prototype.alert = function (msg, cb) {
        alert(msg);
        cb();
    };
    WorldCreator.prototype.prompt = function (desc, cb) {
        var action = prompt(desc);
        cb(action);
    };
    WorldCreator.prototype.create = function (jsonURL) {
        if (typeof jsonURL === 'string') {
            getJSON(jsonURL, this.processJSON.bind(this));
        }
        else {
            this.processJSON(jsonURL);
        }
    };
    
    window.WorldCreator = WorldCreator;
}());