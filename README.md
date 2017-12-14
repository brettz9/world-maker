# world-maker

[![Greenkeeper badge](https://badges.greenkeeper.io/brettz9/world-maker.svg)](https://greenkeeper.io/)

A simple tool for building interactive choose-your-own-adventure
type of text games. Inspired by the coolest game from Apple IIe, Eamon ([HTML5](http://www.myabandonware.com/game/eamon-26k) or [java](http://www.eamonag.org/java/index.htm))!

Making such games is a great beginning task for children learning
programming. I just wanted to take it a step further (maybe serving
as a possible basis of study for young intermediate programmers).

# Installation

`npm install .`

# Usage

HTML:
```html
<script src="node_modules/simple-get-json/index.js"></script>
<script src="world-maker.js"></script>
```

JavaScript:

```js
var wc = new WorldCreator();
wc.createWorld('game.json');
```

# API

- ***WorldCreator(cfg)*** - Constructor accepting an optional `cfg` object with the following optional properties:
    - `prompt` - A function which will be passed a code (currently "characterType", "userName", or "action"), a question to pose to the user, and a callback which should be invoked with the response (currently either one of the directions, or 'a' or 'attack' for attack) when the user is finished providing one.
    - `alert` - A function which will be passed a code (currently "wrongCharacterType", "wrongUserName", "wrongAction", "wrongDirection", "cannotAttack", "userDodged", "antagonistDodged", "userAttackSuccess", "antagonistAttackSuccess", "antagonistDefeated", "userMissed", "antagonistMissed", "gameOver"), an alert message to the user, and a callback which should be invoked when the alert has been dismissed and execution can continue.
- ***WorldCreator.createWorld(gameJSON)*** - Public instance method to begin the game indicated by `gameJSON`. `gameJSON` can be either a JSON object or a string of a URL to retrieve for the JSON. (Will invoke `processJSON` with the result.)

The following instance methods of `WorldCreator` should normallly not need to be directly overridden:

- ***WorldCreator.processJSON*** - Handles retrieved JSON (its single argument).
- ***WorldCreator.processRoom*** - Handles an individual room object (its single argument).
- ***WorldCreator.processUserAttack*** - Handles an attack by the user (passed the antagonist, treasure, and room). May also invoke `processAntagonistAttack`.
- ***WorldCreator.processAntagonistAttack*** - Handles an attack by the antagonist (passed the antagonist, treasure, and room).
- ***WorldCreator.processUserWin*** - Handle the user winning the game.
- ***WorldCreator.createCharacter*** - Prompts the user for a character type and invokes `createCharacterAttributes` with the result. Accepts a callback as its single argument (e.g., to invoke after a name for the character has been chosen).
- ***WorldCreator.createCharacterAttributes*** - Build attributes for the selected character type (its first argument). Will build a character object (with the following numeric properties: `strength`, `agility`, `treasure`). Accepts a callback as its second argument (to invoke after a name for the character has been chosen).
- ***WorldCreator.alert*** - Utilizes the simple browser alert. Behavior can be overridden via `cfg` during instantiation.
- ***WorldCreator.prompt*** - Utilizes the simple browser prompt. Behavior can be overridden via `cfg` during instantiation.

Game JSON format:

```js
{
    "gameType": "all", // "roomID", "treasureID", "antagonistID", "minimumTreasure", or "all"; defaults to "all"
    "gameValue": "", // Points to a "roomID", "treasureID", or "antagonistID" string or a "minimumTreasure" numeric amount; not required if "gameType" is "all"
    "describeDirections": true, // boolean
    "directions": ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest"], // An array of allowable directions
    "injuryLevels": {
        "user": [
            "{{user}} receives a flesh wound.",
            "{{user}} is hurting.",
            "{{user}} is bleeding profusely!",
            "Sad to say, {{user}} is now deceased. Please try again."
        ],
        "antagonist": [
            "{{antagonist}} receives a flesh wound.",
            "{{antagonist}} is hurting.",
            "{{antagonist}} is bleeding profusely!",
            "{{antagonist}} is now pushing up daisies."
        ]
    },
    "characterTypes": {
        "warrior": {
            "name": "Warrior",
            "strength": {
                "min": 60,
                "max": 80
            },
            "agility": {
                "min": 50,
                "max": 60
            }
        },
        "archer": {
            "name": "Archer",
            "strength": {
                "min": 50,
                "max": 55
            },
            "agility": {
                "min": 75,
                "max": 85
            }
        }
    },
    "antagonists": {
        "goblin": {
            "name": "Goblin",
            "description": "an ugly goblin",
            "strength": 40,
            "agility": 40
        },
        "ogre": {
            "name": "Ogre",
            "description": "a foul-smelling ogre",
            "strength": 60,
            "agility": 30
        }
    },
    "treasures": {
        "ruby": {
            "description": "a beautiful red ruby",
            "value": 500
        },
        "emerald": {
            "description": "a stunning emerald",
            "value": 700
        }
    },
    "startingRoom": "mainHall", // ID of a room where the user will begin
    "rooms": {
        "mainHall": {
            "description": "You are in the main hall.",
            "antagonistDescription": "{{antagonist|initialCap}} is already here to greet you.",
            "treasureDescription": "He is holding {{treasure}}.",
            "antagonistID": "goblin",
            "treasureID": "ruby",
            "rooms": {
                "south": "eerieCorridor"
            }
        },
        "eerieCorridor": {
            "description": "You step into a dank, eerie-looking corridor.",
            "antagonistDescription": "In the shadows, you see {{antagonist}}.",
            "treasureDescription": "He is guarding {{treasure}}.",
            "antagonistID": "ogre",
            "treasureID": "emerald",
            "rooms": {
                "north": "mainHall" // Directions have to specified in both ways; also allows one-way movement
            }
        }
    }
}
```

# Todos

1. Give choice from existing users or option to create a new one and save user stats (to JSON or storage) to allow reuse
1. For room/corridor, support secret rooms.
1. For treasures, support alternative treasures.
1. For users, support association of user to potentially multiple weapon types (add to strength) and multiple suits of armor (add to agility); support charisma (to avoid the need to fight (certain) monsters), and luck (checked against random value to increase or decrease treasure value).
1. Support alternative name to "strength" to allow for intelligence, morality, etc. to be used as the key determinant of defeating an entity, whatever was needed to "win" for that entity--e.g., outwit a bully, get high score in exams, be kind to fellow student, etc.
1. Allow other defaults (e.g., default treasure type)
1. Option on whether to show user the antagonist's stats
1. Allow for antagonists to have a range of strength, agility, etc.
1. Implement alternative prompt/alert UIs: e.g., option to show movement options, etc. as buttons
1. Option to allow/disallow antagonist attacks before user can move
1. Option to disallow user leaving before confronting antagonist
1. Option to require explicitly getting treasure; if so, will need to duplicate treasures per room to avoid marking as unavailable if same treasure obtained elsewhere; will also need to show treasure description even if antagonist is missing but treasure is present
1. Move or allow to move room treasure/antagonist description to treasure/antagonist?
1. Move all alert/prompt strings into game JSON; provide for i18n (e.g., use [imf](https://github.com/brettz9/imf))
1. Would need to refactor dealing with antagonists per room if allow antagonists to move; for such characters, the injury index should be tracked on the antagonist, not on the room
1. Make commands externally extensible
