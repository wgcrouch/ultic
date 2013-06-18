var Ultic = {};


function Board(canvas, width, height) {

    function line(startX, startY, endX, endY) {
        canvas.moveTo(startX, startY);
        canvas.lineTo(endX, endY);
    }

    var drawGrid = function(x, y, width, height) {
        canvas.beginPath();        
        line(x + width/3, y, x + width/3, y + height);
        line(x + width/3*2, y, x + width/3*2, y + height);
        line(x, y + height/3, x + width, y + height/3);
        line(x, y + height/3*2, x + width, y + height/3*2);
        canvas.stroke();
    };

    function getCoordFromNum(num) {        
        return [Math.floor(num/3), num % 3];
    }

    var draw = function() {
        drawGrid(0, 0, width, height);
        var padding = 20;
        var sWidth = width/3 - (padding*2);
        var sHeight = height/3 - (padding*2);
        for (var i=0; i<=8; i++) {   
            var coords = getCoordFromNum(i);
            drawGrid(coords[0] * width/3 + padding, coords[1] * height/3 + padding, sWidth, sHeight);
        }
    };

    return {
        draw: draw
    };

};

$(function() {
    Ultic.gameCanvas = document.getElementById('gamearea').getContext('2d');
    Ultic.boardCanvas = document.getElementById('board').getContext('2d');

    var board = new Board(Ultic.boardCanvas, 720, 720);    
    board.draw();
});