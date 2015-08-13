# world-maker

A simple tool for building interactive choose-your-own-adventure
type of text games. Inspired by the coolest game from Apple IIe, Eamon ([HTML5](http://www.myabandonware.com/game/eamon-26k) or [java](http://www.eamonag.org/java/index.htm))!

***INCOMPLETE***

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
    - `alert` - A function which will be passed a code (currently "wrongCharacterType", "wrongUserName", "wrongAction" or "wrongDirection"), an alert message to the user, and a callback which should be invoked when the alert has been dismissed and execution can continue.
- ***WorldCreator.createWorld(gameJSON)*** - Public instance method to begin the game indicated by `gameJSON`. `gameJSON` can be either a JSON object or a string of a URL to retrieve for the JSON. (Will invoke `processJSON` with the result.)

The following instance methods of `WorldCreator` should normallly not need to be directly overridden:

- ***WorldCreator.processJSON*** - Handles retrieved JSON (its single argument).
- ***WorldCreator.processRoom*** - Handles an individual room object (its single argument).
- ***WorldCreator.processAttack*** - Handles an attack by the user and any return attack (passed an antagonist and treasure).
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
            "description": "an ugly goblin",
            "strength": 40,
            "agility": 40
        },
        "ogre": {
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

1. For room/corridor, support secret rooms.
1. For treasures, support alternative treasures.
1. For users, support association of user to potentially multiple weapon types (add to strength) and multiple suits of armor (add to agility); support charisma (to avoid the need to fight (certain) monsters), and luck (checked against random value to increase or decrease treasure value).
1. Support alternative name to "strength" to allow for intelligence, morality, etc. to be used as the key determinant of defeating an entity, whatever was needed to "win" for that entity--e.g., outwit a bully, get high score in exams, be kind to fellow student, etc.
1. Allow other defaults (e.g., default treasure type)
1. Option on whether to show user the antagonist's stats
1. Allow for antagonists to have a range of strength, agility, etc.
1. Option to show movement options, etc. as buttons
1. Option to allow/disallow antagonist attacks before user can move
1. Allow injury levels to differ for different antagonists (including varying for the user)
1. Option to require explicitly getting treasure
