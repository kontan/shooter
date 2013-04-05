var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var origin = "http://phyzkit.net/shooter/";
var rumiaImagePath = origin + 'rumia.png';
var rumiaImagePathF = origin + 'rumia_f.png';
var rumiaImagePathB = origin + 'rumia_b.png';
var rumiaImagePathL = origin + 'rumia_l.png';
var rumiaImagePathR = origin + 'rumia_r.png';
var kogasaImagePath = origin + 'kogasa.png';
var bulletLargeImagePath = origin + 'bullet_large.png';
var dartImagePath = origin + 'dart.png';
var pointerImagePath = origin + 'pointer.png';
var heartImagePath = origin + 'heart.svg';
var starImagePath = origin + 'star.svg';
var stageBackgroundImagePath = origin + 'ground.png';
var stageCloudImagePath = origin + 'cloud.png';
var upperCloudImagePath = origin + 'cloud_upper.png';
var hitEffectImagePath = origin + 'hiteffect.png';
var Vector2 = (function () {
    function Vector2(x, y) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector2.fromAngle = function fromAngle(angle, length) {
        if (typeof length === "undefined") { length = 1; }
        return new Vector2(length * Math.cos(angle), length * Math.sin(angle));
    };
    Vector2.prototype.copy = function (v) {
        this.x = v.x;
        this.y = v.y;
    };
    Vector2.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    Vector2.prototype.addVectors = function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    };
    Vector2.prototype.subVectors = function (a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    };
    Vector2.prototype.mul = function (t) {
        this.x *= t;
        this.y *= t;
        return this;
    };
    Vector2.prototype.length = function () {
        return Math.sqrt(this.lengthSq());
    };
    Vector2.prototype.lengthSq = function () {
        return this.x * this.x + this.y * this.y;
    };
    Vector2.prototype.setLength = function (v) {
        var t = v / this.length();
        this.x *= t;
        this.y *= t;
        return this;
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    Vector2.prototype.getAngle = function () {
        return Math.atan2(this.y, this.x);
    };
    return Vector2;
})();
function loadImage(path) {
    var img = new Image();
    img.src = path;
    return img;
}
var ResourceLoader = (function () {
    function ResourceLoader(onComplete) {
        this.onComplete = onComplete;
        this.resourceCount = 0;
        this.loaders = [];
    }
    ResourceLoader.prototype.loaded = function () {
        this.resourceCount -= 1;
        if(this.resourceCount === 0) {
            this.onComplete();
        }
    };
    ResourceLoader.prototype.loadImage = function (path) {
        var img = new Image();
        img.addEventListener('load', this.loaded);
        img.addEventListener('error', this.loaded);
        img.addEventListener('abort', this.loaded);
        this.loaders.push(function () {
            img.src = path;
        });
        return function () {
            return img.complete ? img : null;
        };
    };
    ResourceLoader.prototype.loadText = function (path) {
        var _this = this;
        var request = new XMLHttpRequest();
        request.addEventListener('load', function () {
            _this.loaded();
        });
        request.addEventListener('error', function () {
            _this.loaded();
        });
        this.loaders.push(function () {
            request.open('get', path, false);
            request.send();
        });
        return function () {
            return request.readyState === 4 ? request.responseText : null;
        };
    };
    ResourceLoader.prototype.loadTextFromElement = function (id) {
        var element = document.getElementById(id);
        var text = element.textContent;
        return function () {
            return text;
        };
    };
    ResourceLoader.prototype.jsonp = function (url, mapping) {
        var _this = this;
        var json = null;
        this.loaders.push(function () {
            $.getJSON(url, function (data) {
                json = data;
                _this.loaded();
            });
        });
        return function () {
            return mapping ? mapping(json) : json;
        };
    };
    ResourceLoader.prototype.start = function () {
        if(this.loaders.length > 0) {
            this.resourceCount = this.loaders.length;
            this.loaders.forEach(function (loader) {
                return loader();
            });
            this.loaders = [];
        } else {
            this.onComplete();
        }
    };
    return ResourceLoader;
})();
var Shooter = (function () {
    function Shooter(canvas) {
        this.canvas = canvas;
        this.stage = null;
        this.player = null;
        this.currentFrame = 0;
        this.reservedActions = [];
        this.width = canvas.width;
        this.height = canvas.height;
    }
    Shooter.prototype.loadScript = function (path, onLoad) {
        var loader = new ResourceLoader(function () {
            onLoad(script());
        });
        var script = loader.loadTextFromElement(path);
        loader.start();
    };
    Shooter.prototype.contains = function (point, margin) {
        if (typeof margin === "undefined") { margin = 0; }
        var x = point.x;
        var y = point.y;
        return x >= -margin && x < (this.width + margin) && y >= -margin && y < (this.height + margin);
    };
    Shooter.prototype.update = function () {
        this.reservedActions.filter(function (action) {
            return action();
        });
        this.stage.update();
        this.currentFrame += 1;
    };
    Shooter.prototype.wait = function (frames) {
        var _this = this;
        var start;
        return function () {
            if(start === undefined) {
                start = _this.currentFrame;
            }
            if(_this.currentFrame >= start + frames) {
                start = undefined;
                return false;
            } else {
                return true;
            }
        };
    };
    Shooter.prototype.sequential = function () {
        var actions = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            actions[_i] = arguments[_i + 0];
        }
        var index = 0;
        return function () {
            while(index < actions.length) {
                if(actions[index]()) {
                    return true;
                } else {
                    index++;
                }
            }
            return false;
        };
    };
    Shooter.prototype.loop = function () {
        var actions = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            actions[_i] = arguments[_i + 0];
        }
        var index = 0;
        return function () {
            for(var i = 0; ; i++) {
                if(i >= 10000) {
                    throw "loop: Invalid loop action";
                }
                if(actions[index]()) {
                    return true;
                } else {
                    index = (index + 1) % actions.length;
                }
            }
        };
    };
    Shooter.prototype.concurrent = function () {
        var actions = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            actions[_i] = arguments[_i + 0];
        }
        return function () {
            return actions.some(function (action) {
                return action();
            });
        };
    };
    Shooter.prototype.nway = function (n, d, origin, target, speed) {
        var _this = this;
        return function () {
            var velocity = new Vector2();
            velocity.subVectors(target, origin);
            velocity.setLength(1);
            var angle = Math.atan2(velocity.y, velocity.x);
            for(var i = 0; i < n; i++) {
                var bullet = new LargeBullet();
                bullet.position = origin.clone();
                bullet.velocity = Vector2.fromAngle(angle - d * (n - 1) * 0.5 + d * i, speed);
                _this.stage.bullets.push(bullet);
            }
        };
    };
    return Shooter;
})();
var Stage = (function () {
    function Stage(shooter) {
        this.shooter = shooter;
        this.bullets = [];
        this.playerBullets = [];
        this.units = [];
        this.effects = [];
        this.enemy = null;
        this.stageScrollDelta = 0;
        this.cloudScrollDelta = 0;
        this.lowerCloudScrollDelta = 0;
        this.pointerAlpha = 0;
        this.swinging = new Vector2(0, 0);
        this.brightness = 1;
        this.totalFrameCount = 0;
    }
    Stage.prototype.swing = function (size, angle) {
        if (typeof size === "undefined") { size = 20; }
        if (typeof angle === "undefined") { angle = Math.PI * 2 * Math.random(); }
        this.swinging = new Vector2(size * Math.cos(angle), size * Math.sin(angle));
    };
    Stage.prototype.isActive = function () {
        return this.shooter.player.life > 0 && this.units.length > 0;
    };
    Stage.prototype.spell = function () {
    };
    Stage.prototype.update = function () {
        var _this = this;
        if(this.isActive()) {
            this.bullets.forEach(function (bullet) {
                bullet.update();
            });
            this.playerBullets.forEach(function (bullet) {
                bullet.update();
            });
            this.units.forEach(function (unit) {
                unit.update();
            });
            this.shooter.player.update();
            this.effects = this.effects.filter(function (effect) {
                effect.update();
                return effect.count < HitEffect.maxCount;
            });
            this.playerBullets = this.playerBullets.filter(function (bullet) {
                return _this.shooter.contains(bullet.position, 64);
            });
            this.bullets = this.bullets.filter(function (bullet) {
                return _this.shooter.contains(bullet.position, 64);
            });
            if(this.shooter.player.probation === 0) {
                var crashed = false;
                this.bullets = this.bullets.filter(function (bullet) {
                    var delta = new Vector2(0, 0);
                    delta.subVectors(_this.shooter.player.position, bullet.position);
                    if(delta.length() < (_this.shooter.player.radius + bullet.size)) {
                        crashed = true;
                        return false;
                    } else {
                        return true;
                    }
                });
                if(crashed) {
                    this.shooter.player.crash();
                    this.shooter.stage.swing();
                }
            }
            this.playerBullets = this.playerBullets.filter(function (bullet) {
                var result = true;
                for(var i = 0; i < _this.units.length; i++) {
                    var unit = _this.units[i];
                    var delta = new Vector2(0, 0);
                    delta.subVectors(unit.position, bullet.position);
                    if(delta.length() < (unit.radius + bullet.size)) {
                        result = false;
                        _this.effects.push(new HitEffect(new Vector2(bullet.position.x - 8 + 16 * Math.random(), bullet.position.y - 8 * Math.random())));
                        unit.life = Math.max(0, unit.life - 1);
                        break;
                    }
                }
                return result;
            });
            this.totalFrameCount += 1;
            this.brightness = Math.min(1, this.brightness + 0.02);
            this.swinging.mul(0.95);
            this.stageScrollDelta += 2.0;
            this.stageScrollDelta = this.stageScrollDelta % stageBackgroundImage.height;
            this.cloudScrollDelta += 22.2;
            this.cloudScrollDelta = this.cloudScrollDelta % stageCloudImage.height;
            this.lowerCloudScrollDelta += 8.7;
            this.lowerCloudScrollDelta = this.lowerCloudScrollDelta % stageCloudImage.height;
        } else {
            this.brightness = Math.max(0, this.brightness - 0.02);
        }
    };
    Stage.prototype.paint = function (graphics) {
        graphics.save();
        var swingRange = Math.sin(Math.PI * 2 * (this.totalFrameCount % 5) / 5);
        graphics.translate(swingRange * this.swinging.x, swingRange * this.swinging.y);
        graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta);
        graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta - stageBackgroundImage.height);
        graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta);
        graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta - stageCloudImage.height);
        graphics.globalCompositeOperation = 'lighter';
        graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta);
        graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta - stageCloudImage.height);
        graphics.globalCompositeOperation = 'source-over';
        this.units.forEach(function (unit) {
            graphics.save();
            graphics.translate(unit.position.x, unit.position.y);
            unit.paint(graphics);
            graphics.restore();
        });
        graphics.save();
        graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
        this.shooter.player.paint(graphics);
        graphics.restore();
        this.effects.forEach(function (effect) {
            effect.paint(graphics);
        });
        this.playerBullets.forEach(function (bullet) {
            graphics.save();
            graphics.translate(bullet.position.x, bullet.position.y);
            bullet.paint(graphics);
            graphics.restore();
        });
        this.bullets.forEach(function (bullet) {
            graphics.save();
            graphics.translate(bullet.position.x, bullet.position.y);
            bullet.paint(graphics);
            graphics.restore();
        });
        if(this.pointerAlpha > 0) {
            graphics.save();
            graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
            graphics.globalAlpha = this.pointerAlpha;
            graphics.drawImage(pointerImage, -pointerImage.width / 2, -pointerImage.height / 2);
            graphics.restore();
        }
        graphics.restore();
        if(this.enemy !== null) {
            graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
            graphics.fillRect(10, 10, 480, 3);
            graphics.fillStyle = 'rgba(255, 64, 64, 0.9)';
            graphics.fillRect(10, 10, 480 * this.enemy.life / this.enemy.maxLife, 3);
        }
        if(this.brightness < 1) {
            graphics.fillStyle = 'rgba(0, 0, 0, ' + (0.5 * (1 - this.brightness)) + ')';
            graphics.fillRect(0, 0, this.shooter.width, this.shooter.height);
        }
        if(this.brightness < 1) {
            graphics.save();
            graphics.globalAlpha = 1 - this.brightness;
            graphics.fillStyle = 'white';
            graphics.font = 'normal 400 48px/2 Unknown Font, sans-seri';
            var hudText = this.shooter.player.life > 0 ? 'Stage Cleared!' : 'Game Over...';
            var metrics = graphics.measureText(hudText);
            graphics.fillText(hudText, (this.shooter.width - metrics.width) / 2, 200);
            graphics.restore();
        }
    };
    return Stage;
})();
var Bullet = (function () {
    function Bullet(size) {
        this.size = size;
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.angle = 0;
    }
    Bullet.prototype.update = function () {
        this.position.add(this.velocity);
    };
    Bullet.prototype.paint = function (g) {
    };
    return Bullet;
})();
var rumiaImage = {
    image: loadImage(rumiaImagePath),
    front: loadImage(rumiaImagePathF),
    back: loadImage(rumiaImagePathB),
    left: loadImage(rumiaImagePathL),
    right: loadImage(rumiaImagePathR)
};
var kogasaImage = {
    image: loadImage(kogasaImagePath),
    front: loadImage(kogasaImagePath),
    back: loadImage(kogasaImagePath),
    left: loadImage(kogasaImagePath),
    right: loadImage(kogasaImagePath)
};
var bulletLargeImage = loadImage(bulletLargeImagePath);
var dartImage = loadImage(dartImagePath);
var pointerImage = loadImage(pointerImagePath);
var heartImage = loadImage(heartImagePath);
var starImage = loadImage(starImagePath);
var stageBackgroundImage = loadImage(stageBackgroundImagePath);
var stageCloudImage = loadImage(stageCloudImagePath);
var upperCloudImage = loadImage(upperCloudImagePath);
var hitEffectImage = loadImage(hitEffectImagePath);
var LargeBullet = (function (_super) {
    __extends(LargeBullet, _super);
    function LargeBullet() {
        _super.call(this, 4);
    }
    LargeBullet.prototype.paint = function (g) {
        g.globalCompositeOperation = 'lighter';
        g.drawImage(bulletLargeImage, -bulletLargeImage.width / 2, -bulletLargeImage.height / 2);
    };
    return LargeBullet;
})(Bullet);
var DartBullet = (function (_super) {
    __extends(DartBullet, _super);
    function DartBullet() {
        _super.call(this, 4);
    }
    DartBullet.prototype.paint = function (g) {
        g.drawImage(dartImage, -dartImage.width / 2, -dartImage.height / 2);
    };
    return DartBullet;
})(Bullet);
var Unit = (function () {
    function Unit(shooter, images) {
        this.shooter = shooter;
        this.images = images;
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.radius = 5;
    }
    Unit.prototype.update = function () {
        this.position.x = Math.max(0, Math.min(this.shooter.width, this.position.x + this.velocity.x));
        this.position.y = Math.max(0, Math.min(this.shooter.height, this.position.y + this.velocity.y));
        this.img = this.velocity.y < 0 ? this.images.front : this.velocity.y > 0 ? this.images.back : this.velocity.x < 0 ? this.images.left : this.velocity.x > 0 ? this.images.right : this.images.image;
        this.velocity = new Vector2(0, 0);
    };
    Unit.prototype.paint = function (g) {
        g.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
    };
    return Unit;
})();
var EnemyUnit = (function (_super) {
    __extends(EnemyUnit, _super);
    function EnemyUnit(shooter) {
        _super.call(this, shooter, kogasaImage);
        this.shooter = shooter;
        this.script = null;
        this.scriptState = {
        };
        this.maxLife = 1000;
        this.life = 1000;
        this.radius = 30;
    }
    EnemyUnit.prototype.setScript = function (scriptText) {
        try  {
            this.scriptText = scriptText;
            this.script = new Function('shooter', 'unit', 'state', scriptText);
            this.scriptState = {
            };
        } catch (e) {
            console.log(e);
        }
    };
    EnemyUnit.prototype.update = function () {
        _super.prototype.update.call(this);
        if(this.script !== null) {
            var args = [
                this.shooter, 
                this, 
                this.scriptState
            ];
            try  {
                this.script.apply(undefined, args);
            } catch (e) {
                console.log(e);
                this.script = null;
            }
        }
        if(this.life === 0) {
            this.shooter.stage.units.splice(this.shooter.stage.units.indexOf(this), 1);
            if(this.shooter.stage.enemy === this) {
                this.shooter.stage.enemy = null;
            }
        }
    };
    return EnemyUnit;
})(Unit);
var PlayerUnit = (function (_super) {
    __extends(PlayerUnit, _super);
    function PlayerUnit(shooter) {
        _super.call(this, shooter, rumiaImage);
        this.life = 6;
        this.bomb = 3;
        this.probation = 0;
    }
    PlayerUnit.prototype.crash = function () {
        this.probation = 120;
        this.life = Math.max(0, this.life - 1);
    };
    PlayerUnit.prototype.update = function () {
        _super.prototype.update.call(this);
        this.probation = Math.max(0, this.probation - 1);
    };
    PlayerUnit.prototype.paint = function (g) {
        if(this.probation > 0 && Math.floor(this.probation / 2) % 2 === 0) {
            g.globalAlpha = 0.5;
        }
        _super.prototype.paint.call(this, g);
    };
    return PlayerUnit;
})(Unit);
var HitEffect = (function () {
    function HitEffect(position, count) {
        if (typeof count === "undefined") { count = 0; }
        this.position = position;
        this.count = count;
    }
    HitEffect.maxCount = 20;
    HitEffect.prototype.update = function () {
        this.count += 1;
    };
    HitEffect.prototype.paint = function (g) {
        g.save();
        g.translate(this.position.x, this.position.y - this.count * 2);
        g.rotate(this.count * 0.1);
        g.translate(-hitEffectImage.width / 2, -hitEffectImage.height / 2);
        g.globalAlpha = 0.2 - 0.2 * this.count / HitEffect.maxCount;
        g.drawImage(hitEffectImage, 0, 0);
        g.restore();
    };
    return HitEffect;
})();
window.addEventListener('load', function () {
    var _this = this;
    var loader = new ResourceLoader(function () {
        var canvas = document.querySelector('#canvas');
        var graphics = _this.canvas.getContext('2d');
        var fpsCountStart = performance.now();
        var frameCount = 0;
        var bulletsIndicator = document.querySelector('#bullets');
        var fpsIndicator = document.querySelector('#fps');
        var shooter = new Shooter(canvas);
        var stage = new Stage(shooter);
        shooter.stage = stage;
        var player = new PlayerUnit(shooter);
        player.position.x = canvas.width / 2;
        player.position.y = canvas.height - 150;
        shooter.player = player;
        var enemy = new EnemyUnit(shooter);
        enemy.position.x = shooter.width / 2;
        enemy.position.y = shooter.height / 2 - 160;
        enemy.setScript(bulletScript());
        stage.units.push(enemy);
        shooter.stage.enemy = enemy;
        var keyTable = {
        };
        window.addEventListener('keydown', function (e) {
            if(keyTable[e.keyCode] === undefined) {
                keyTable[e.keyCode] = shooter.stage.totalFrameCount;
            }
            if(!editing) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', function (e) {
            delete keyTable[e.keyCode];
            if(!editing) {
                e.preventDefault();
            }
        });
        function getKey(keyCode) {
            return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - shooter.stage.totalFrameCount) : null;
        }
        var editing = false;
        document.getElementById('edit').addEventListener('click', function () {
            document.getElementById('textarea').value = enemy.scriptText;
            document.getElementById('editor').setAttribute('style', 'display: block;');
            editing = true;
        });
        document.getElementById('edit_cancel').addEventListener('click', function () {
            document.getElementById('editor').removeAttribute('style');
            editing = false;
        });
        document.getElementById('edit_ok').addEventListener('click', function () {
            enemy.setScript(document.getElementById('textarea').value);
            document.getElementById('editor').removeAttribute('style');
            editing = false;
        });
        var samples = document.querySelectorAll('#samples > a');
        for(var i = 0; i < samples.length; i++) {
            (function () {
                var a = samples[i];
                a.addEventListener('click', function (e) {
                    var elem = document.getElementById(a.getAttribute('data-href'));
                    var textarea = document.getElementById('textarea');
                    textarea.value = elem.textContent;
                    e.preventDefault();
                });
            })();
        }
        var requestAnimationFrame = window['requestAnimationFrame'] || window['mozRequestAnimationFrame'];
        function updateFrame() {
            requestAnimationFrame(function () {
                if(editing === false) {
                    shooter.player.velocity.x = 0;
                    shooter.player.velocity.y = 0;
                    if(getKey(32)) {
                        shooter.swing();
                    }
                    var accurate = getKey(16) !== null;
                    var speed = accurate ? 1 : 3;
                    shooter.stage.pointerAlpha = Math.max(0, Math.min(1, shooter.stage.pointerAlpha + 0.1 * (accurate ? 1 : -1)));
                    if(getKey(37)) {
                        shooter.player.velocity.x -= speed;
                    }
                    if(getKey(38)) {
                        shooter.player.velocity.y -= speed;
                    }
                    if(getKey(39)) {
                        shooter.player.velocity.x += speed;
                    }
                    if(getKey(40)) {
                        shooter.player.velocity.y += speed;
                    }
                    if(getKey(90)) {
                        for(var i = 0; i < 1; i++) {
                            var bullet = new DartBullet();
                            bullet.position = shooter.player.position.clone();
                            bullet.position.y += 30 * i;
                            bullet.velocity = new Vector2(0, -30);
                            stage.playerBullets.push(bullet);
                        }
                    }
                    shooter.update();
                    shooter.stage.paint(graphics);
                    bulletsIndicator.textContent = stage.bullets.length.toString();
                    var lifeGauge = document.querySelector('#life');
                    if(lifeGauge.childNodes.length !== shooter.player.life) {
                        while(lifeGauge.childNodes.length > 0) {
                            lifeGauge.removeChild(lifeGauge.childNodes[0]);
                        }
                        for(var i = 0; i < shooter.player.life; i++) {
                            lifeGauge.appendChild(loadImage('heart.svg'));
                        }
                    }
                    var bombGauge = document.querySelector('#bomb');
                    if(bombGauge.childNodes.length !== shooter.player.life) {
                        while(bombGauge.childNodes.length > 0) {
                            bombGauge.removeChild(bombGauge.childNodes[0]);
                        }
                        for(var i = 0; i < shooter.player.bomb; i++) {
                            bombGauge.appendChild(loadImage('star.svg'));
                        }
                    }
                    frameCount += 1;
                    var now = performance.now();
                    var deltaTime = now - fpsCountStart;
                    if(deltaTime >= 1000) {
                        fpsIndicator.textContent = (frameCount * 1000 / deltaTime).toFixed(2);
                        frameCount = 0;
                        fpsCountStart = now;
                    }
                }
                updateFrame();
            });
        }
        updateFrame();
    });
    var bulletScript = loader.loadTextFromElement('script_combination');
    loader.start();
});
