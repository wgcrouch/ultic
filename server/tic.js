var io = require('socket.io').listen(20000);

io.set('log level', 2);
var users = {};
io.sockets.on('connection', function(socket){
    var grid = new Grid();
    grid.createEmpty();

    users[socket.id] = {
        socket: socket,
        grid: grid
    };

    socket.on('move', function(data) {
        var player = grid.blank('o');

        if (data.player) {
            player = grid.blank('x');
        }
        grid.get(data.coord[0]).set(data.coord[1], player);
        
    });
});

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

    var grid = {
        result: function() {
            return _result;
        },
        set: function(grid, state) {
            _grid[grid] = state;

            // Workout winning conditions
            if (_result !== 'u') return;
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
                    _result = 'x';
                    return 'x';
                }
                if ((oMask & winConditions[i]) === winConditions[i]) {
                    console.log('O wins');
                    _result = 'o';
                    return 'o';
                }
            };
            return 'u';
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