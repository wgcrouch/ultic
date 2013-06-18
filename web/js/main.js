var Ultic = {};
var padding = 20;
var socket = io.connect(
    //['http://', window.location.hostname, ':20000/'].join('')
    "http://localhost:20000/"
);

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

function Game(canvas, width, height) {
    var player = 1;

    function posToMainGrid(x, y) {
        var cellWidth = width/3;
        var cellHeight = height/3;

        var mainX = Math.floor(x/(cellWidth));
        var mainY = Math.floor(y/(cellHeight));
        return [mainX, mainY];
    }
    function posToGrid(x, y) {
        var cellWidth = width/3;
        var cellHeight = height/3;

        var main = posToMainGrid(x, y);

        var relX = x - (main[0] * cellWidth) - padding;
        var relY = y - (main[1] * cellHeight) - padding;
        if (relX < 0 || relY < 0 || relX > (cellWidth- padding*2) || relY > (cellHeight- padding*2)) {
            return false;
        }
        var subX = Math.floor(relX/((cellWidth-padding*2) /3));
        var subY = Math.floor(relY/((cellHeight-padding*2) / 3));
        return [main, [subX, subY]];
    }

    function coordToSimple(pos) {
        var main = pos[0][1] * 3 + pos[0][0];
        var sub = pos[1][1] * 3 + pos[1][0];
        return [main, sub];
    }

    function gridToDraw(pos) {
        var mainX = pos[0][0] * width/3;
        var mainY = pos[0][1] * width/3;
        var cellWidth = (width/3 - padding *2)/3;
        var cellHeight = (height/3 - padding *2)/3;
        var subX = mainX + pos[1][0] * cellWidth + cellWidth/2 + padding;
        var subY = mainY + + pos[1][1] * cellHeight + cellHeight/2 + padding;
        return [subX, subY];
    }

    function drawMoveX(pos) {
        var size = width/6/3;
        var x = pos[0] - size/2;
        var y = pos[1] - size/2;
        canvas.lineWidth = 2;
        canvas.beginPath();  
        canvas.moveTo(x, y);
        canvas.lineTo(x + size, y + size);
        canvas.moveTo(x + size, y);
        canvas.lineTo(x, y + size);
        canvas.stroke();
        canvas.lineWidth = 1;
    }

    function drawMoveY(pos) {
        var size = width/10/3;
        canvas.lineWidth = 2;
        canvas.beginPath();
        canvas.arc(pos[0], pos[1], size, 0, Math.PI*2, true); 
        canvas.closePath();
        canvas.stroke();
        canvas.lineWidth = 1;
    }

    function drawMove(pos) {
        drawPos = gridToDraw(pos);
        if (player) {
            drawMoveX(drawPos);
        } else {
            drawMoveY(drawPos);
        }
    }
    var move = function(x, y) {
        var pos = posToGrid(x, y);
        if (!pos) return;
        socket.emit('move', {coord: coordToSimple(pos), player: player});
        drawMove(pos);
        player = !player;
    };
    return {
        move: move
    };
}

$(function() {
    var width = 720;
    var height = width;
    Ultic.gameCanvas = document.getElementById('gamearea').getContext('2d');
    Ultic.boardCanvas = document.getElementById('board').getContext('2d');

    var board = new Board(Ultic.boardCanvas, width, height);   
    var game = new Game(Ultic.gameCanvas, width, height);
    board.draw();

    socket.on('connect', function () {});

    $('#gamearea').click(function(e) {
        var x = e.offsetX;
        var y = e.offsetY;

        game.move(x, y);
    })
});