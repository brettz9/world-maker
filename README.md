# world-maker

A simple tool for building interactive choose-your-own-adventure
type of text games. Inspired by the coolest game from Apple IIe, Eamon!

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
wc.create('game.json');
```

# API

- ***WorldCreator(cfg)*** - Constructor accepting an optional `cfg` object with the following optional properties:
    - `prompt` - A function which will be passed a question message to the user and a callback which should be invoked with an action () when the user responds.
    - `alert` - A function which will be passed an alert message to the user and a callback which should be invoked when the alert has been dismissed and execution can continue.
    - `directions` - An array of allowable directions. Defaults to ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'].
- ***WorldCreator.create(gameJSON)*** - Public method to begin the game indicated by `gameJSON`. `gameJSON` can be either a JSON object or a string of a URL to retrieve for the JSON. (Will invoke `processJSON` with the result.)

The following instance methods of `WorldCreator` should normallly not need to be overridden:

- ***WorldCreator.processJSON*** - Handles retrieved JSON (its single argument).
- ***WorldCreator.processRoom*** - Handles an individual room object (its single argument).
- ***WorldCreator.alert*** - Utilizes the simple browser alert. Behavior can be overridden via `cfg` during instantiation.
- ***WorldCreator.prompt*** - Utilizes the simple browser prompt. Behavior can be overridden via `cfg` during instantiation.


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
