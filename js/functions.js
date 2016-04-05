$(document).ready(function () {

    var TYPES = ["murakami", "miner", "mega"]
      , KILL_DISTANCE = 5
      ;

    function Unit(a, d, s, type) {
        this.attack = a;
        this.defense = d;
        this.speed = s;
        this.ui = $(".templates div.unit." + type).clone().appendTo(".battle-place")
        this.setPos(Math.random() * (800 - 60), Math.random() * (400 - 70));
    }

    Unit.prototype.setPos = function (x, y) {
        if (x > 740) {
            x -= this.speed;
        }
        if (y > 330) {
            y -= this.speed;
        }
        if (x < 0) {
            x += this.speed;
        }
        if (y < 0) {
            y += this.speed;
        }
        this.x = x;
        this.y = y;
        this.ui.css({
            left: x
          , top: y
        });
    };

    Unit.prototype.die = function () {
        this.died = true;
        this.ui.css("opacity", 0.7);
    };

    Unit.prototype.next = function () {
        var x = this.x
          , y = this.y
          ;

        x += (Math.floor(Math.random() * 100) % 2 ? 1 : -1) * this.speed;
        y += (Math.floor(Math.random() * 100) % 2 ? 1 : -1) * this.speed;
        this.setPos(x, y);
    };

    function Army() {
        this.units = [];
    }

    Army.prototype.add = function (unit) {
        this.units.push(unit);
    };

    Army.prototype.kill = function (unit) {
        var index = this.units.indexOf(unit);
        if (index === -1) {
            return console.error("Cannot find unit.");
        }
        this.units[index].ui.remove();
        this.units[index] = null;
    };

    Army.prototype.cleanUp = function () {
        var self = this;
        this.units.forEach(function (c) {
            if (c.died) {
                self.kill(c);
            }
        });
        this.units = this.units.filter(Boolean);
    };

    Army.prototype.generate = function (count, type) {
        for (var i = 0; i < 10; ++i) {
            this.add(new Unit(
                Math.random() * 10
              , Math.random() * 10
              , Math.random() * 10
              , type
            ));
        }
    };

    function Game(ui) {
        this.ui = $(ui);
        this.reset();
    }

    Game.prototype.reset = function () {
        this.ui.empty();
        this.armies = [new Army(), new Army()];
        this.armies.forEach(function (c, i) {
            c.generate(10, TYPES[0]);
            c.generate(10, TYPES[1]);
            c.generate(10, TYPES[2]);
            c.units.forEach(function (u) {
                u.ui.addClass("army-" + i);
            });
        });
    };

    Game.prototype.checkWin = function () {
        if (!this.armies[0].units.length) {
            return $("h1").text("Blue won!");
        }
        if (!this.armies[1].units.length) {
            return $("h1").text("Red won!");
        }
        if (KILL_DISTANCE > 800) {
            $("h1").text((this.armies[0].units.length > this.armies[1].units.length ? "Red" : "Blue") + " won!");
        }
    };

    Game.prototype.next = function () {
        this.armies[0].units.forEach(function (c) {
            c.next();
        });
        this.armies[1].units.forEach(function (c) {
            c.next();
        });
    };

    Game.prototype.cleanUp = function () {
        this.armies.forEach(function (c) {
            c.cleanUp();
        });
    };

    Game.prototype.check = function (u1, u2) {
        if (u1.attack > u2.defense && Math.abs(u2.x - u1.x) < KILL_DISTANCE && Math.abs(u2.y - u1.y) < KILL_DISTANCE) {
            u2.die();
        }
    };

    Game.prototype.battle = function () {
        var self = this;
        this.next();
        this.cleanUp();


        var army1 = this.armies[0]
          , army2 = this.armies[1]
          ;

        army1.units.forEach(function (cUnit1) {
            army2.units.forEach(function (cUnit2) {
                if (cUnit1.died || cUnit2.died) { return; }
                self.check(cUnit1, cUnit2);
                self.check(cUnit2, cUnit1);
            });
        });
    };

    var g = new Game(".battle-place");
    window.game = g;

    $(".container").css("opacity", "0").animate({
        opacity: 1
      , top: "50%"
    }, 1000);

    $(document).on("keydown", function (e) {
        if (e.keyCode === 13) {
            g.battle();
            $(".red-count .count").text(g.armies[0].units.length)
            $(".blue-count .count").text(g.armies[1].units.length)
            KILL_DISTANCE += 2;
            g.checkWin();
        }
    });
});
