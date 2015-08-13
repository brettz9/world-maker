/*global getJSON*/
/*jslint vars:true, todo:true*/
(function () {'use strict';

    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function initialCase (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
        this.rooms = json.rooms;
        this.directions = json.directions || ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
        
        // Todo: Give choice from existing users or option to create a new one
        // Todo: Save user stats and allow reuse
        this.createCharacter(function () {
            this.userInjuryIndex = 0;
            var room = this.rooms[json.startingRoom];
            this.processRoom(room);
        }.bind(this));
    };
    WorldCreator.prototype.createCharacter = function (cb) {
        this.user = {};
        this.prompt("characterType", "Please choose a type of character: " + Object.keys(this.characterTypes)./*map(function (characterType) {
            return this.characterTypes[characterType].name;
        }, this).*/join(', '), function (characterType) {
            this.createCharacterAttributes(characterType, cb);
        }, this);
    };
    WorldCreator.prototype.createCharacterAttributes = function (characterType, cb) {
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
        this.prompt("userName", "You have strength " + this.user.strength + ", agility " + this.user.agility + "; Please choose a name for your character", function (name) {
            if (!name) {
                this.alert("wrongUserName", "Please choose a valid user name.", function () {
                    this.createCharacterAttributes(characterType, cb);
                }, this);
                return;
            }
            this.user.name = name;
            cb();
        }, this);
    };
    WorldCreator.prototype.processRoom = function (room) {
        var antagonist = this.antagonists[room.antagonistID]; // description, strength, agility
        if (!antagonist.injuryIndex) {
            antagonist.injuryIndex = 0;
        }
        var treasure = this.treasures[room.treasureID]; // description, value
        
        var desc = [
                room.description,
                room.antagonistDescription.
                    replace(/\{\{antagonist\}\}/g, antagonist.description).
                    replace(/\{\{antagonist\|initialCap\}\}/g, function () {
                        return initialCase(antagonist.description);
                    }),
                room.treasureDescription.
                    replace(/\{\{treasure\}\}/g, treasure.description).
                    replace(/\{\{treasure\|initialCap\}\}/g, function () {
                        return initialCase(treasure.description);
                    })
            ].join(' ') +
            (this.describeDirections ? " You may go " + Object.keys(room.rooms).join(', ') : '') +
            '\n';

        desc += " What would you like to do (attack, north, south, etc.)?";
        
        this.prompt("action", desc, function (action) {
            if (this.directions.indexOf(action) > -1) {
                if (!room.rooms[action]) {
                    return this.alert("wrongDirection", "You can't go that direction.", function () {
                        this.processRoom(room);
                    }, this);
                }
                this.processRoom(this.rooms[room.rooms[action]]);
            }
            else if (action === 'a' || action === 'attack') {
                this.processUserAttack(antagonist, treasure, room);
            }
            else {
                this.alert("wrongAction", "The action you have chosen is not recognized. Please try another.", function () {
                    this.processRoom(room);
                }, this);
            }
        }, this);
    };
    WorldCreator.prototype.processUserAttack = function (antagonist, treasure, room) {
        var userAttackLuck = Math.random() * 100;
        var antagEvadeLuck = Math.random() * 100;
        if (userAttackLuck < this.user.strength) {
            if (antagEvadeLuck < antagonist.agility) {
                this.alert("antagonistDodged", antagonist.name + " dodged your attack.", function () {
                    this.processAntagonistAttack(antagonist, treasure, room);
                }, this);
                return;
            }
            this.alert("userAttackSuccess", "You landed a hit. " + this.injuryLevels.antagonist[antagonist.injuryIndex].replace(/\{\{antagonist\}\}/g, antagonist.description), function () {
                antagonist.injuryIndex++;
                if (this.injuryLevels.antagonist[antagonist.injuryIndex] === undefined) {
                    this.alert("antagonistDefeated", function () {
                        this.user.treasure += treasure.value;
                        if (this.gameType === '') { // roomID, treasure (and minimum), all
                            this.gameValue;
                            this.processRoom(room);
                        }
                    }, this);
                    return;
                }
                this.processAntagonistAttack(antagonist, treasure, room);
            }, this);
            return;
        }
    };
    WorldCreator.prototype.processAntagonistAttack = function (antagonist, treasure, room) {
        var antagAttackLuck = Math.random() * 100;
        var userEvadeLuck = Math.random() * 100;
        if (antagAttackLuck < antagonist.strength) {
            if (userEvadeLuck < this.user.agility) {
                this.alert("userDodged", "You dodged an attack! ", function () {
                    this.processUserAttack(antagonist, treasure, room);
                }, this);
                return;
            }
            this.alert("antagonistAttackSuccess", initialCase(antagonist.name) + " landed a hit! " + this.injuryLevels.user[this.userInjuryIndex].replace(/\{\{user\}\}/g, this.user.name), function () {
                this.userInjuryIndex++;
                if (this.injuryLevels.user[this.userInjuryIndex] === undefined) {
                    this.alert("gameOver", "Game over. The game will now restart", function () {
                        this.createWorld(this.jsonURL);
                    }, this);
                    return;
                }
                this.processUserAttack(antagonist, treasure, room);
            }, this);
        }
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
        this.jsonURL = jsonURL; // Remember so can restart the game
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
