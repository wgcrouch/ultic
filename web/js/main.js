var Ultic = {};
var padding = 20;

var Grid = function() {
    var blank = function(type) {
        return {
            result: function() {
                return type;
            }
        };
    };

    var _grid = function(){
        var subgrid = {};
        for (var i = 0; i < 9; i++) {
            subgrid[i] = blank('u');
        };
        return subgrid;
    }();

    var _result = 'u';

    var winConditions = [7, 56, 73, 84, 146, 273, 292, 448];

    var checkResult = function() {
        var xMask = 0;
        var oMask = 0;
        for (var i = 0; i < 9; i ++) {
            if (_grid[i] && _grid[i].result()) {
                if (_grid[i].result() == 'x') {
                    xMask |= Math.pow(2, i);
                } else if(_grid[i].result() == 'o') {
                    oMask |= Math.pow(2, i);
                }
            }
        }
        // Compare winning conditions
        for (var i = winConditions.length - 1; i >= 0; i--) {
            if ((xMask & winConditions[i]) === winConditions[i]) {
                console.log('X wins');
                return 'x';
            }
            if ((oMask & winConditions[i]) === winConditions[i]) {
                console.log('O wins');
                return 'o';
            }
        };
        return 'u';
    }
    var grid = {
        result: function() {
            if (_result !== 'u') return _result;
            _result = checkResult();
            return _result;
        },
        set: function(grid, state) {
            _grid[grid] = state;

            // Workout winning conditions
            
        },
        get: function(grid) {
            return _grid[grid];
        },
        flatten: function() {
            var grid = {};
            for (var i = 0; i < 9; i++) {
                var state = this.get(i);
                if (state && typeof state == 'object') {
                    grid[i] = state.flatten();
                } else {
                    grid[i] = state;
                }
            }
            return grid;
        },
        createEmpty: function() {
            for (var i = 0; i <= 9; i++) {
                this.set(i, new Grid());
            }
        },
        blank: blank
    }
    return grid;
}

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
    var grid = new Grid();
    grid.createEmpty();

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

    function drawMoveX(pos, size) {
        canvas.lineWidth = 2 * size || 1;
        var size = width/6/3 * (size || 1);
        var x = pos[0] - size/2;
        var y = pos[1] - size/2;
        canvas.beginPath();  
        canvas.moveTo(x, y);
        canvas.lineTo(x + size, y + size);
        canvas.moveTo(x + size, y);
        canvas.lineTo(x, y + size);
        canvas.stroke();
        canvas.lineWidth = 1;
    }

    function drawMoveY(pos, size) {      
        canvas.lineWidth = 2 * size || 1;  
        var size = width/10/3 * (size || 1);        
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

    function markWin(player, pos) {
        var x = pos[0] * width/3 + width/3/2;
        var y = pos[1] * height/3 + height/3/2;
        if (player == 'x') {
            drawMoveX([x,y],4);
        } else {
            drawMoveY([x,y],4);
        }
    }

    var move = function(x, y) {
        var pos = posToGrid(x, y);
        if (!pos) return;

        var coord = coordToSimple(pos);
        var spot = grid.get(coord[0]).get(coord[1]);
        if (spot.result() != 'u')  return;

        grid.get(coord[0]).set(coord[1], grid.blank(player ? 'x' : 'o'));
        var result = grid.get(coord[0]).result();
        drawMove(pos);
        if (result != 'u') {
            markWin(result, pos[0]);
        }
        if (grid.result() != 'u') {
            alert("We have a winner" + grid.result());
        }
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

    $('#gamearea').click(function(e) {
        var x = e.offsetX;
        var y = e.offsetY;

        game.move(x, y);
    })
});