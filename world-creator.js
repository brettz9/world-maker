(function () {'use strict';

    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function WorldCreator () {
        if (!(this instanceof WorldCreator)) {
            return new WorldCreator();
        }
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
            if (['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'].indexOf(action) > -1) {
                if (!room.childRooms[action]) {
                    alert("You can't go that direction.");
                    return this.processRoom(room);
                }
                this.processRoom(room.childRooms[action]);
            }
            else if (action === 'a' || action === 'attack') {
                
                this.user.strength;
                this.user.agility;
                antagonist.strength;
                antagonist.agility;
                treasure.value;
                if (this.gameType === '') { // roomID, treasure (and minimum), all
                    this.gameValue;
                }
            }
        });
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