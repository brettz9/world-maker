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
            this.processRoom(json.startingRoom);
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
    WorldCreator.prototype.processRoom = function (roomID) {
        var room = this.rooms[roomID];
        var antagonist = this.antagonists[room.antagonistID]; // description, strength, agility
        if (!room.antagonistInjuryIndex) {
            room.antagonistInjuryIndex = 0;
        }
        var treasure = this.treasures[room.treasureID]; // description, value
        
        var desc = [
                room.description
            ].concat(!this.injuryLevels.antagonist[room.antagonistInjuryIndex] ? [] : [
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
            ]).join(' ') +
            (this.describeDirections ? " You may go " + Object.keys(room.rooms).join(', ') + '.' : '') +
            '\n';

        desc += " What would you like to do (attack, north, south, etc.)?";
        
        this.prompt("action", desc, function (action) {
            if (this.directions.indexOf(action) > -1) {
                if (!room.rooms[action]) {
                    return this.alert("wrongDirection", "You can't go that direction.", function () {
                        this.processRoom(roomID);
                    }, this);
                }
                this.processRoom(room.rooms[action]);
            }
            else if (action === 'a' || action === 'attack') {
                if (!this.injuryLevels.antagonist[room.antagonistInjuryIndex]) {
                    this.alert("cannotAttack", "There is nothing to attack!", function () {
                        this.processRoom(roomID);
                    }, this);
                    return;
                }
                this.processUserAttack(antagonist, treasure, roomID);
            }
            else {
                this.alert("wrongAction", "The action you have chosen is not recognized. Please try another.", function () {
                    this.processRoom(roomID);
                }, this);
            }
        }, this);
    };
    WorldCreator.prototype.processUserWin = function () {
        this.alert("userWon", "You won the game! The game will begin again.", function () {
            this.createWorld(this.jsonURL);
        }, this);
    };
    WorldCreator.prototype.processUserAttack = function (antagonist, treasure, roomID) {
        var room = this.rooms[roomID];
        var userAttackLuck = Math.random() * 100;
        var antagEvadeLuck = Math.random() * 100;
        if (userAttackLuck < this.user.strength) {
            if (antagEvadeLuck < antagonist.agility) {
                this.alert("antagonistDodged", antagonist.name + " dodged your attack.", function () {
                    this.processAntagonistAttack(antagonist, roomID);
                }, this);
                return;
            }
            this.alert("userAttackSuccess", this.user.name + " landed a hit. " + this.injuryLevels.antagonist[room.antagonistInjuryIndex].replace(/\{\{antagonist\}\}/g, antagonist.name), function () {
                room.antagonistInjuryIndex++;
                if (this.injuryLevels.antagonist[room.antagonistInjuryIndex] === undefined) {
                    this.alert("antagonistDefeated", antagonist.name + " is defeated!", function () {
                        this.user.treasure += treasure.value;
                        switch (this.gameType) {
                            case "roomID":
                                if (this.gameValue === roomID) {
                                    this.processUserWin();
                                    return;
                                }
                                break;
                            case "treasureID":
                                break;
                            case "antagonistID":
                                break;
                            case "minimumTreasure":
                                break;
                            case "all":
                                break;
                        }
                        // this.gameValue; // "roomID", "treasureID", or "antagonistID" string or a "minimumTreasure" numeric amount
                        // Todo: Duplicate treasures per room to avoid marking as unavailable if same treasure obtained elsewhere
                        this.processRoom(roomID);
                    }, this);
                    return;
                }
                this.processAntagonistAttack(antagonist, roomID);
            }, this);
            return;
        }
        this.alert("userMissed", this.user.name + " missed.", function () {
            this.processAntagonistAttack(antagonist, roomID);
        }, this);
    };
    WorldCreator.prototype.processAntagonistAttack = function (antagonist, roomID) {
        var antagAttackLuck = Math.random() * 100;
        var userEvadeLuck = Math.random() * 100;
        if (antagAttackLuck < antagonist.strength) {
            if (userEvadeLuck < this.user.agility) {
                this.alert("userDodged", this.user.name + " dodged an attack! ", function () {
                    this.processRoom(roomID);
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
                this.processRoom(roomID);
            }, this);
            return;
        }
        this.alert("antagonistMissed", initialCase(antagonist.name) + " missed.", function () {
            this.processRoom(roomID);
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
