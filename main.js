
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function PowerPellet(game) {
    this.radius = 4;
    this.visualRadius = 300;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius  * 2), this.radius + Math.random() * (800 - this.radius * 2));
}

PowerPellet.prototype = new Entity();
PowerPellet.prototype.constructor = PowerPellet;

PowerPellet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};
function Ghost(game, picture, which) {
    this.pic = picture;
    this.which = which;
    this.radius = 20;
    this.lives = 3;
    this.tempDead = false;
    this.visualRadius = 500;
    this.colors = ["Blue", "Green", "Red", "White"];
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.timeIt = 0;

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}

Ghost.prototype = new Entity();
Ghost.prototype.constructor = Ghost;

Ghost.prototype.update = function() {
    Entity.prototype.update.call(this);
    if (this.tempDead) {
        this.x = 400;
        this.y = 400;
        this.timeIt += 5;
        if (this.timeIt >= 4000) {
            this.tempDead = false;
        }
    } else {
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = -this.velocity.x * friction;
            if (this.collideLeft()) this.x = this.radius;
            if (this.collideRight()) this.x = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y * friction;
            if (this.collideTop()) this.y = this.radius;
            if (this.collideBottom()) this.y = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }
        for (var i = 0; i < this.game.entities.length; i++) {
            var ent = this.game.entities[i];
            if (!ent.isImmune) {
                var dist = distance(this, ent);
                if (ent.isFeelingIt) {
                if (this.collide(ent)) {
                    this.lives -= 1;
                    if (this.lives <= 0) {
                        this.removeFromWorld = true;
                    }
                    this.tempDead = true;
                    this.x = 400;
                    this.y = 400;
                    this.timeIt = 0;
                } else if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
                    if (dist > this.radius + ent.radius) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x -= difX * acceleration / (dist * dist);
                        this.velocity.y -= difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                }
            } else if (!ent.isFeelingIt) {
                if (this.collide(ent)) {
                    ent.lives -= 1;
                    ent.isImmune = true;
                    ent.immuneTimer = 0;
                } else if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
                    var dist = distance(this, ent);
                    if (dist > this.radius + ent.radius + 10) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                }
            }
            }
        }
        this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
        this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
    }

};

Ghost.prototype.draw = function (ctx) {
   if (!this.tempDead) {
       ctx.drawImage(this.pic, this.which * 64, 0, 32, 32, this.x - 16, this.y - 16, 32, 32);
   } else {
       ctx.drawImage(this.pic, 385, 0, 32, 32, this.x - 16, this.y - 16, 32, 32);
   }

};

function Pacman(game, picture) {
    this.pic = picture;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Blue", "Green", "Red", "White"];
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.setisNotFeelingIt();
    this.isImmune = false;
    this.lives = 3;
    this.immuneTimer = 0;
    this.feelingItTimer = 0;

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}

Pacman.prototype = new Entity();
Pacman.prototype.constructor = Pacman;

Pacman.prototype.setisFeelingIt = function () {
    this.isFeelingIt = true;
    this.color = 0;
    this.visualRadius = 500;
};

Pacman.prototype.setisNotFeelingIt = function () {
    this.isFeelingIt = false;
    this.color = 3;
    this.visualRadius = 500;
};

Entity.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Entity.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Entity.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Entity.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Entity.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};


Pacman.prototype.update = function() {
    Entity.prototype.update.call(this);
    if (this.lives <= 0) {
        this.removeFromWorld = true;
    }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    if (this.isFeelingIt) {
        this.feelingItTimer += 5;
        if (this.feelingItTimer >= 4000) {
            this.setisNotFeelingIt();
        }
    } else if (this.isImmune) {
        this.immuneTimer += 5;
        if (this.immuneTimer >= 500) {
            this.isImmune = false;
        }
    }
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = {x: this.velocity.x, y: this.velocity.y};

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
        }
    }
    for (var i = 0; i < this.game.pellets.length; i++) {
        var pel = this.game.pellets[i];
        if (this.collide(pel) && !this.isImmune) {
            pel.removeFromWorld = true;
            if (!this.isFeelingIt && !this.isImmune) {
                this.feelingItTimer = 0;
                this.setisFeelingIt();
            }
        }
        if (this.collide({x: pel.x, y: pel.y, radius: this.visualRadius}) && !this.isFeelingIt) {
            var dist = distance(this, pel);
            if (dist > this.radius + pel.radius + 10) {
                var difX = (pel.x - this.x) / dist;
                var difY = (pel.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }
        for (var i = 0; i < this.game.ghosts.length; i++) {
            var ghost = this.game.ghosts[i];
            if (!ghost.tempDead) {
                var ratio = 0;
                if (this.collide({ x: ghost.x, y: ghost.y, radius: this.visualRadius })) {
                    if (this.isFeelingIt) {
                     var dist = distance(this, ghost);
                     if (dist > this.radius + ghost.radius + 10) {
                        var difX = (ghost.x - this.x)/dist;
                        var difY = (ghost.y - this.y)/dist;
                        this.velocity.x += difX * acceleration / (dist*dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                        if (speed > maxSpeed) {
                            ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                } else if (!this.isFeelingIt) {
                        if (dist > this.radius + ghost.radius) {
                            var difX = (ent.x - this.x) / dist;
                            var difY = (ent.y - this.y) / dist;
                            this.velocity.x -= difX * acceleration / (dist * dist);
                            this.velocity.y -= difY * acceleration / (dist * dist);
                            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                            if (speed > maxSpeed) {
                                ratio = maxSpeed / speed;
                                this.velocity.x *= ratio;
                                this.velocity.y *= ratio;
                            }
                        }
                    }
                }
            }
        }
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Pacman.prototype.draw = function (ctx) {
    if (this.isFeelingIt) {
        ctx.beginPath();
        ctx.fillStyle = this.colors[this.color];
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    } else if (this.isImmune) {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
    ctx.drawImage(this.pic, 352, 0, 32, 32, this.x - 16, this.y - 16, 32, 32);

};



// the "main" code begins here
var friction = 1;
var acceleration = 100000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/pacmansprite.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var ost = new Audio("./Pacman Remix Theme.mp3");
    ost.play();
    ost.loop = true;
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    for (var i = 0; i < 10; i++) {
        var pacman = new Pacman(gameEngine, ASSET_MANAGER.getAsset("./img/pacmansprite.png"));
        gameEngine.addPacman(pacman);
    }
    for (var i = 0; i < 10; i++) {
        var ghost = new Ghost(gameEngine, ASSET_MANAGER.getAsset("./img/pacmansprite.png"), (i % 5));
        gameEngine.addGhost(ghost);
    }
    for (var i = 0; i < 12; i++) {
        var pellet = new PowerPellet(gameEngine);
        gameEngine.addPellet(pellet);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
