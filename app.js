var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vector2 = (function () {
    function Vector2(x, y) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector2.fromAngle = function fromAngle(angle, length) {
        return new Vector2(length * Math.cos(angle), length * Math.sin(angle));
    };
    Vector2.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
    };
    Vector2.prototype.addVectors = function (a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
    };
    Vector2.prototype.subVectors = function (a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
    };
    Vector2.prototype.mul = function (t) {
        this.x *= t;
        this.y *= t;
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
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    return Vector2;
})();
function createImage(path) {
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
    ResourceLoader.prototype.loading = function () {
        this.resourceCount += 1;
    };
    ResourceLoader.prototype.loaded = function () {
        this.resourceCount -= 1;
        if(this.resourceCount === 0) {
            this.onComplete();
        }
    };
    ResourceLoader.prototype.loadImage = function (path) {
        var _this = this;
        var img = new Image();
        img.addEventListener('load', this.loaded);
        img.addEventListener('error', this.loaded);
        img.addEventListener('abort', this.loaded);
        this.loaders.push(function () {
            _this.loading();
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
            _this.loading();
            request.open('get', path, false);
            request.send();
        });
        return function () {
            return request.readyState === 4 ? request.responseText : null;
        };
    };
    ResourceLoader.prototype.loadTextFromElement = function (id) {
        var element = document.getElementById(id);
        var text = element.innerText || element.textContent;
        return function () {
            return text;
        };
    };
    ResourceLoader.prototype.start = function () {
        if(this.loaders.length > 0) {
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
        this.totalFrameCount = 0;
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
    return Shooter;
})();
var Stage = (function () {
    function Stage(width, height) {
        this.width = width;
        this.height = height;
        this.bullets = [];
        this.playerBullets = [];
        this.units = [];
        this.effects = [];
    }
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
    image: createImage('rumia.png'),
    front: createImage('rumia_f.png'),
    back: createImage('rumia_b.png'),
    left: createImage('rumia_l.png'),
    right: createImage('rumia_r.png')
};
var kogasaImage = {
    image: createImage('kogasa.png'),
    front: createImage('kogasa.png'),
    back: createImage('kogasa.png'),
    left: createImage('kogasa.png'),
    right: createImage('kogasa.png')
};
var bulletLargeImage = createImage("bullet_large.png");
var dartImage = createImage("dart.png");
var pointerImage = createImage('pointer.png');
var heartImage = createImage('heart.svg');
var starImage = createImage('star.svg');
var stageBackgroundImage = createImage('scroll.png');
var stageCloudImage = createImage('cloud.png');
var upperCloudImage = createImage('cloud_upper.png');
var hitEffectImage = createImage('hiteffect.png');
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
    function Unit(stage, images) {
        this.stage = stage;
        this.images = images;
        this.position = new Vector2(0, 0);
        this.radius = 5;
        this.velocity = new Vector2(0, 0);
    }
    Unit.prototype.update = function () {
        this.position.x = Math.max(0, Math.min(this.stage.width, this.position.x + this.velocity.x));
        this.position.y = Math.max(0, Math.min(this.stage.height, this.position.y + this.velocity.y));
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
        _super.call(this, shooter.stage, kogasaImage);
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
            }
        }
    };
    return EnemyUnit;
})(Unit);
var PlayerUnit = (function (_super) {
    __extends(PlayerUnit, _super);
    function PlayerUnit(stage) {
        _super.call(this, stage, rumiaImage);
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
        var swinging = new Vector2(0, 0);
        var pointerAlpha = 0;
        var stageScrollDelta = 0;
        var cloudScrollDelta = 0;
        var lowerCloudScrollDelta = 0;
        function swing(size, angle) {
            if (typeof size === "undefined") { size = 20; }
            if (typeof angle === "undefined") { angle = Math.PI * 2 * Math.random(); }
            swinging = new Vector2(size * Math.cos(angle), size * Math.sin(angle));
        }
        var stage = new Stage(canvas.width, canvas.height);
        var shooter = new Shooter(canvas);
        shooter.stage = stage;
        var rumia = new PlayerUnit(stage);
        rumia.position.x = canvas.width / 2;
        rumia.position.y = canvas.height - 150;
        shooter.player = rumia;
        var enemy = new EnemyUnit(shooter);
        enemy.position.x = shooter.width / 2;
        enemy.position.y = shooter.height / 2 - 160;
        enemy.setScript(bulletScript());
        stage.units.push(enemy);
        var keyTable = {
        };
        window.addEventListener('keydown', function (e) {
            if(keyTable[e.keyCode] === undefined) {
                keyTable[e.keyCode] = shooter.totalFrameCount;
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
            return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - shooter.totalFrameCount) : null;
        }
        function contains(point, margin) {
            if (typeof margin === "undefined") { margin = 0; }
            var x = point.x;
            var y = point.y;
            return x >= -margin && x < (canvas.width + margin) && y >= -margin && y < (canvas.height + margin);
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
                    shooter.loadScript(a.href, function (script) {
                        var textarea = document.getElementById('textarea');
                        textarea.value = script;
                    });
                    e.preventDefault();
                });
            })();
        }
        function updateFrame() {
            var requestAnimationFrame = window['requestAnimationFrame'] || window['mozRequestAnimationFrame'];
            requestAnimationFrame(function () {
                if(editing === false) {
                    if(getKey(32)) {
                        swing();
                    }
                    var accurate = getKey(16) !== null;
                    var speed = accurate ? 1 : 3;
                    pointerAlpha = Math.max(0, Math.min(1, pointerAlpha + 0.1 * (accurate ? 1 : -1)));
                    shooter.player.velocity.x = 0;
                    shooter.player.velocity.y = 0;
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
                    stage.bullets.forEach(function (bullet) {
                        bullet.update();
                    });
                    stage.playerBullets.forEach(function (bullet) {
                        bullet.update();
                    });
                    stage.units.forEach(function (unit) {
                        unit.update();
                    });
                    shooter.player.update();
                    stage.effects = stage.effects.filter(function (effect) {
                        effect.update();
                        return effect.count < HitEffect.maxCount;
                    });
                    stage.playerBullets = stage.playerBullets.filter(function (bullet) {
                        return contains(bullet.position, 64);
                    });
                    stage.bullets = stage.bullets.filter(function (bullet) {
                        return contains(bullet.position, 64);
                    });
                    bulletsIndicator.innerText = stage.bullets.length.toString();
                    bulletsIndicator.textContent = bulletsIndicator.innerText;
                    if(shooter.player.probation === 0) {
                        stage.bullets = stage.bullets.filter(function (bullet) {
                            var delta = new Vector2(0, 0);
                            delta.subVectors(shooter.player.position, bullet.position);
                            if(delta.length() < (shooter.player.radius + bullet.size)) {
                                shooter.player.crash();
                                swing();
                                return false;
                            } else {
                                return true;
                            }
                        });
                    }
                    stage.playerBullets = stage.playerBullets.filter(function (bullet) {
                        var result = true;
                        for(var i = 0; i < stage.units.length; i++) {
                            var unit = stage.units[i];
                            var delta = new Vector2(0, 0);
                            delta.subVectors(unit.position, bullet.position);
                            if(delta.length() < (unit.radius + bullet.size)) {
                                result = false;
                                stage.effects.push(new HitEffect(new Vector2(bullet.position.x - 8 + 16 * Math.random(), bullet.position.y - 8 * Math.random())));
                                unit.life = Math.max(0, unit.life - 1);
                                break;
                            }
                        }
                        return result;
                    });
                    swinging.mul(0.95);
                    var lifeGauge = document.querySelector('#life');
                    if(lifeGauge.childNodes.length !== shooter.player.life) {
                        while(lifeGauge.childNodes.length > 0) {
                            lifeGauge.removeChild(lifeGauge.childNodes[0]);
                        }
                        for(var i = 0; i < shooter.player.life; i++) {
                            lifeGauge.appendChild(createImage('heart.svg'));
                        }
                    }
                    var bombGauge = document.querySelector('#bomb');
                    if(bombGauge.childNodes.length !== shooter.player.life) {
                        while(bombGauge.childNodes.length > 0) {
                            bombGauge.removeChild(bombGauge.childNodes[0]);
                        }
                        for(var i = 0; i < shooter.player.bomb; i++) {
                            bombGauge.appendChild(createImage('star.svg'));
                        }
                    }
                    stageScrollDelta += 2.0;
                    stageScrollDelta = stageScrollDelta % stageBackgroundImage.height;
                    cloudScrollDelta += 22.2;
                    cloudScrollDelta = cloudScrollDelta % stageCloudImage.height;
                    lowerCloudScrollDelta += 8.7;
                    lowerCloudScrollDelta = lowerCloudScrollDelta % stageCloudImage.height;
                    graphics.save();
                    var swingRange = Math.sin(Math.PI * 2 * (shooter.totalFrameCount % 5) / 5);
                    graphics.translate(swingRange * swinging.x, swingRange * swinging.y);
                    graphics.drawImage(stageBackgroundImage, 0, stageScrollDelta);
                    graphics.drawImage(stageBackgroundImage, 0, stageScrollDelta - stageBackgroundImage.height);
                    graphics.drawImage(stageCloudImage, 0, lowerCloudScrollDelta);
                    graphics.drawImage(stageCloudImage, 0, lowerCloudScrollDelta - stageCloudImage.height);
                    graphics.globalCompositeOperation = 'lighter';
                    graphics.drawImage(upperCloudImage, 0, cloudScrollDelta);
                    graphics.drawImage(upperCloudImage, 0, cloudScrollDelta - stageCloudImage.height);
                    graphics.globalCompositeOperation = 'source-over';
                    stage.units.forEach(function (unit) {
                        graphics.save();
                        graphics.translate(unit.position.x, unit.position.y);
                        unit.paint(graphics);
                        graphics.restore();
                    });
                    graphics.save();
                    graphics.translate(shooter.player.position.x, shooter.player.position.y);
                    shooter.player.paint(graphics);
                    graphics.restore();
                    stage.effects.forEach(function (effect) {
                        effect.paint(graphics);
                    });
                    stage.playerBullets.forEach(function (bullet) {
                        graphics.save();
                        graphics.translate(bullet.position.x, bullet.position.y);
                        bullet.paint(graphics);
                        graphics.restore();
                    });
                    stage.bullets.forEach(function (bullet) {
                        graphics.save();
                        graphics.translate(bullet.position.x, bullet.position.y);
                        bullet.paint(graphics);
                        graphics.restore();
                    });
                    if(pointerAlpha > 0) {
                        graphics.save();
                        graphics.translate(shooter.player.position.x, shooter.player.position.y);
                        graphics.globalAlpha = pointerAlpha;
                        graphics.drawImage(pointerImage, -pointerImage.width / 2, -pointerImage.height / 2);
                        graphics.restore();
                    }
                    graphics.restore();
                    graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    graphics.fillRect(10, 10, 480, 10);
                    graphics.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    graphics.fillRect(10, 10, 480 * enemy.life / enemy.maxLife, 10);
                    frameCount += 1;
                    var now = performance.now();
                    var delta = now - fpsCountStart;
                    if(delta >= 1000) {
                        fpsIndicator.innerText = (frameCount * 1000 / delta).toFixed(2);
                        fpsIndicator.textContent = fpsIndicator.innerText;
                        frameCount = 0;
                        fpsCountStart = now;
                    }
                }
                shooter.totalFrameCount += 1;
                updateFrame();
            });
        }
        updateFrame();
    });
    var bulletScript = loader.loadTextFromElement('script_nway');
    loader.start();
});
