/*
Appends game scripts onto the DOM Head
*/

function load(path) {
    let imported = document.createElement('script');
    imported.src = path;
    document.head.appendChild(imported);
};
load('grid.js');
load('building.js');
load('paddle.js');
load('wall.js');
load('ball.js');
load('ui.js')
load('game.js');
