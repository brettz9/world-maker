/*global WorldCreator*/

(function () {'use strict';

    var button = document.createElement('button');
    button.textContent = 'Start game';
    document.body.appendChild(button);

    button.addEventListener('click', function () {
        var wc = new WorldCreator();
        wc.createWorld('game.json');
    });

}());
