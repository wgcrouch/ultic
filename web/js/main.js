var Ultic = {};



Ultic.Board = {
    width: 800,
    height: 800,
    init: function(canvas, width, height) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
    },
    draw: function() {
        var canvas = Ultic.canvas;


    }
};

$.ready(function() {
    Ultic.gameCanvas = document.getElementById('gamearea').getContext('2d');
    Ultic.boardCanvas = document.getElementById('board').getContext('2d');

    Ultic.Board.init(Ultic.boardCanvas, 800, 800);
});