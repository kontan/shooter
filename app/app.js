var ResolvedFile = (function () {
    function ResolvedFile(content, path) {
        this.content = content;
        this.path = path;
    }
    return ResolvedFile;
})();
var BufferedTextWriter = (function () {
    function BufferedTextWriter() {
        this.buffer = [];
    }
    BufferedTextWriter.prototype.Write = function (s) {
        this.buffer.push(s);
    };
    BufferedTextWriter.prototype.WriteLine = function (s) {
        this.buffer.push(s);
        this.buffer.push('\n');
    };
    BufferedTextWriter.prototype.Close = function () {
    };
    BufferedTextWriter.prototype.toString = function () {
        return this.buffer.join('');
    };
    return BufferedTextWriter;
})();
var BrowserTextWriter = (function () {
    function BrowserTextWriter() {
        this.buffer = [];
    }
    BrowserTextWriter.prototype.Write = function (s) {
        this.buffer.push(s);
    };
    BrowserTextWriter.prototype.WriteLine = function (s) {
        this.buffer.push(s);
        this.buffer.push('\n');
        console.log(this.buffer.join(''));
        this.buffer = [];
    };
    BrowserTextWriter.prototype.Close = function () {
        console.log(this.buffer.join(''));
        this.buffer = [];
    };
    return BrowserTextWriter;
})();
var QuasiFile = (function () {
    function QuasiFile(path) {
        this.path = path;
        this.writer = new BufferedTextWriter();
    }
    return QuasiFile;
})();
var BrowserIIO = (function () {
    function BrowserIIO() {
        this.files = [];
        this.arguments = [];
        this.stderr = new BrowserTextWriter();
        this.stdout = new BrowserTextWriter();
    }
    BrowserIIO.prototype.readFile = function (path) {
        console.log('readFile');
        return null;
    };
    BrowserIIO.prototype.writeFile = function (path, contents) {
        console.log('writeFile');
    };
    BrowserIIO.prototype.createFile = function (path, useUTF8) {
        console.log('createFile(' + path + ', ' + useUTF8 + ')');
        var file = new QuasiFile(path);
        this.files.push(file);
        return file.writer;
    };
    BrowserIIO.prototype.deleteFile = function (path) {
        console.log('deleteFile');
    };
    BrowserIIO.prototype.dir = function (path, re, options) {
        console.log('dir');
        return [];
    };
    BrowserIIO.prototype.fileExists = function (path) {
        console.log('fileExists');
        return false;
    };
    BrowserIIO.prototype.directoryExists = function (path) {
        console.log('directoryExists');
        return false;
    };
    BrowserIIO.prototype.createDirectory = function (path) {
        console.log('createDirectory');
    };
    BrowserIIO.prototype.resolvePath = function (path) {
        console.log('resolvePath');
        return path;
    };
    BrowserIIO.prototype.dirName = function (path) {
        console.log('dirName');
        return path;
    };
    BrowserIIO.prototype.findFile = function (rootPath, partialFilePath) {
        console.log('findFile');
        return null;
    };
    BrowserIIO.prototype.print = function (str) {
        console.log(str);
    };
    BrowserIIO.prototype.printLine = function (str) {
        console.log(str);
    };
    BrowserIIO.prototype.watchFile = function (filename, callback) {
        console.log('watchFile');
        return {
            close: function () {
            }
        };
    };
    BrowserIIO.prototype.run = function (source, filename) {
        console.log('run');
    };
    BrowserIIO.prototype.getExecutingFilePath = function () {
        console.log('getExecutingFilePath');
        return "getExecutingFilePath";
    };
    BrowserIIO.prototype.quit = function (exitCode) {
        console.log('quit');
    };
    return BrowserIIO;
})();
var BulletStorm;
(function (BulletStorm) {
    var Vector2 = (function () {
        function Vector2(x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.x = x;
            this.y = y;
            Object.seal(this);
        }
        Vector2.fromAngle = function fromAngle(angle, length) {
            if (typeof length === "undefined") { length = 1; }
            return new Vector2(length * Math.cos(angle), length * Math.sin(angle));
        };
        Vector2.prototype.set = function (x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.x = x;
            this.y = y;
            return this;
        };
        Vector2.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
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
    BulletStorm.Vector2 = Vector2;    
    Object.freeze(Vector2);
    Object.freeze(Vector2.prototype);
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    function loadImage(path) {
        var img = new Image();
        img.src = path;
        return img;
    }
    BulletStorm.loadImage = loadImage;
    var ResourceLoader = (function () {
        function ResourceLoader() {
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
            var _this = this;
            var img = new Image();
            img.addEventListener('load', this.loaded);
            img.addEventListener('error', this.loaded);
            img.addEventListener('abort', this.loaded);
            this.loaders.push(function () {
                img.src = path;
                if(img.complete) {
                    _this.loaded();
                }
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
        ResourceLoader.prototype.start = function (onComplete) {
            if(this.loaders.length > 0) {
                this.onComplete = onComplete;
                this.resourceCount = this.loaders.length;
                this.loaders.forEach(function (loader) {
                    return loader();
                });
                this.loaders = [];
            } else {
                onComplete();
                onComplete = null;
            }
        };
        return ResourceLoader;
    })();
    BulletStorm.ResourceLoader = ResourceLoader;    
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    var HitEffect = (function () {
        function HitEffect(position, count, image) {
            if (typeof count === "undefined") { count = 0; }
            this.position = position;
            this.count = count;
            this.image = image;
        }
        HitEffect.maxCount = 20;
        HitEffect.prototype.update = function () {
            this.count += 1;
        };
        HitEffect.prototype.paint = function (g) {
            g.save();
            g.translate(this.position.x, this.position.y - this.count * 2);
            g.rotate(this.count * 0.1);
            g.translate(-this.image.width / 2, -this.image.height / 2);
            g.globalAlpha = 0.2 - 0.2 * this.count / HitEffect.maxCount;
            g.drawImage(this.image, 0, 0);
            g.restore();
        };
        return HitEffect;
    })();
    BulletStorm.HitEffect = HitEffect;    
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    var Bullet = (function () {
        function Bullet() {
            this.position = new BulletStorm.Vector2(0, 0);
            this.velocity = new BulletStorm.Vector2(0, 0);
            this.angle = 0;
            this.size = 0;
        }
        Bullet.prototype.update = function () {
        };
        Bullet.prototype.paint = function (g) {
        };
        return Bullet;
    })();
    BulletStorm.Bullet = Bullet;    
    Object.freeze(Bullet);
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    var Unit = (function () {
        function Unit(images) {
            this.images = images;
            this.position = new BulletStorm.Vector2(0, 0);
            this.velocity = new BulletStorm.Vector2(0, 0);
            this.radius = 5;
            this.img = undefined;
        }
        Unit.prototype.update = function () {
            this.img = this.velocity.y < 0 ? this.images.front : this.velocity.y > 0 ? this.images.back : this.velocity.x < 0 ? this.images.left : this.velocity.x > 0 ? this.images.right : this.images.image;
        };
        Unit.prototype.paint = function (g) {
            g.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
        };
        return Unit;
    })();
    BulletStorm.Unit = Unit;    
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    function wait(frames) {
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
    }
    BulletStorm.wait = wait;
    Object.freeze(wait);
    function sequential() {
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
    }
    BulletStorm.sequential = sequential;
    Object.freeze(sequential);
    function loop() {
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
    }
    BulletStorm.loop = loop;
    Object.freeze(loop);
    function concurrent() {
        var actions = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            actions[_i] = arguments[_i + 0];
        }
        return function () {
            return actions.some(function (action) {
                return action();
            });
        };
    }
    BulletStorm.concurrent = concurrent;
    Object.freeze(concurrent);
})(BulletStorm || (BulletStorm = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BulletStorm;
(function (BulletStorm) {
    BulletStorm.origin = "res/";
    var bulletLargeImagePath = BulletStorm.origin + 'bullet_large.png';
    var dartImagePath = BulletStorm.origin + 'dart.png';
    var pointerImagePath = BulletStorm.origin + 'pointer.png';
    var heartImagePath = BulletStorm.origin + 'heart.svg';
    var starImagePath = BulletStorm.origin + 'star.svg';
    var stageBackgroundImagePath = BulletStorm.origin + 'ground.png';
    var stageCloudImagePath = BulletStorm.origin + 'cloud.png';
    var upperCloudImagePath = BulletStorm.origin + 'cloud_upper.png';
    var hitEffectImagePath = BulletStorm.origin + 'hiteffect.png';
    var bulletLargeImage = BulletStorm.loadImage(bulletLargeImagePath);
    var dartImage = BulletStorm.loadImage(dartImagePath);
    var pointerImage = BulletStorm.loadImage(pointerImagePath);
    var heartImage = BulletStorm.loadImage(heartImagePath);
    var starImage = BulletStorm.loadImage(starImagePath);
    var stageBackgroundImage = BulletStorm.loadImage(stageBackgroundImagePath);
    var stageCloudImage = BulletStorm.loadImage(stageCloudImagePath);
    var upperCloudImage = BulletStorm.loadImage(upperCloudImagePath);
    var hitEffectImage = BulletStorm.loadImage(hitEffectImagePath);
    function loadDirectionalImages(prefix) {
        return {
            image: BulletStorm.loadImage(prefix + '.png'),
            front: BulletStorm.loadImage(prefix + '_f.png'),
            back: BulletStorm.loadImage(prefix + '_b.png'),
            left: BulletStorm.loadImage(prefix + '_l.png'),
            right: BulletStorm.loadImage(prefix + '_r.png')
        };
    }
    var rumiaImage = loadDirectionalImages('res/rumia');
    var kogasaImage = loadDirectionalImages('res/kogasa');
    function construct(constructor, args) {
        function F() {
            return constructor.apply(this, args);
        }
        F.prototype = constructor.prototype;
        return new F();
    }
    var Shooter = (function () {
        function Shooter(canvas) {
            this.canvas = canvas;
            this.stage = null;
            this.player = null;
            this.now = 0;
            this.reservedActions = [];
            this._width = canvas.width;
            this._height = canvas.height;
            this.stage = new Stage(this);
            this.player = new PlayerUnit(this);
            this.player.position.x = this.width / 2;
            this.player.position.y = this.height - 150;
            Object.seal(this);
        }
        Object.defineProperty(Shooter.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shooter.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Shooter.prototype.loadScript = function (path, onLoad) {
            var loader = new BulletStorm.ResourceLoader();
            var script = loader.loadText(path);
            loader.start(function () {
                onLoad(script());
            });
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
            this.now += 1;
        };
        Object.defineProperty(Shooter.prototype, "wait", {
            get: function () {
                return BulletStorm.wait;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shooter.prototype, "sequential", {
            get: function () {
                return BulletStorm.sequential;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shooter.prototype, "loop", {
            get: function () {
                return BulletStorm.loop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shooter.prototype, "concurrent", {
            get: function () {
                return BulletStorm.concurrent;
            },
            enumerable: true,
            configurable: true
        });
        Shooter.prototype.newEnemy = function () {
            return new EnemyUnit(this);
        };
        return Shooter;
    })();
    BulletStorm.Shooter = Shooter;    
    Object.freeze(Shooter);
    Object.freeze(Shooter.prototype);
    var Stage = (function () {
        function Stage(shooter) {
            this.shooter = shooter;
            this.bullets = [];
            this.playerBullets = [];
            this.units = [];
            this.effects = [];
            this.pointerAlpha = 0;
            this.swinging = new BulletStorm.Vector2(0, 0);
            this.brightness = 1;
            this.totalFrameCount = 0;
            this.scriptText = null;
            this.scriptScope = null;
            this.loader = new BulletStorm.ResourceLoader();
            this.completed = true;
            Object.seal(this);
        }
        Stage.prototype.loadScript = function (scriptPath, onLoad) {
            var _this = this;
            $.get(scriptPath, function (data) {
                _this.script = data;
                onLoad();
            });
        };
        Stage.prototype.callback = function (name) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            try  {
                if(this.scriptScope && typeof this.scriptScope.exports[name] === 'function') {
                    var result = chainchomp.callback(this.scriptScope.exports[name], args);
                    return result;
                }
            } catch (e) {
                console.log(e.message);
                console.log(this.scriptText);
                this.scriptScope.exports[name] = undefined;
            }
        };
        Stage.prototype.complete = function () {
            var _this = this;
            this.loader.start(function () {
                _this.callback('complete');
                if(typeof _this.scriptScope.exports.complete === 'function') {
                    delete _this.scriptScope.exports.complete;
                }
                _this.completed = true;
            });
        };
        Object.defineProperty(Stage.prototype, "script", {
            get: function () {
                return this.scriptText;
            },
            set: function (scriptText) {
                try  {
                    this.scriptText = scriptText;
                    this.scriptScope = {
                        'shooter': this.shooter,
                        'exports': {
                        },
                        'Vector2': BulletStorm.Vector2,
                        'LargeBullet': LargeBullet
                    };
                    var env = chainchomp.pick();
                    var scriptFunc = env(scriptText, this.scriptScope);
                    var input = document.querySelector('#edit_debug input');
                    var checked = input.checked;
                    scriptFunc({
                        debug: checked
                    });
                    this.completed = false;
                } catch (e) {
                    console.log(e.message);
                    console.log(scriptText);
                }
                this.complete();
            },
            enumerable: true,
            configurable: true
        });
        Stage.prototype.swing = function (size, angle) {
            if (typeof size === "undefined") { size = 20; }
            if (typeof angle === "undefined") { angle = Math.PI * 2 * Math.random(); }
            this.swinging = new BulletStorm.Vector2(size * Math.cos(angle), size * Math.sin(angle));
        };
        Stage.prototype.isActive = function () {
            return this.shooter.player.life > 0 && this.units.length > 0;
        };
        Stage.prototype.initialize = function () {
            this.bullets = [];
            this.playerBullets = [];
            this.units = [];
            this.effects = [];
            this.pointerAlpha = 0;
            this.swinging.set(0, 0);
            this.brightness = 1;
            this.totalFrameCount = 0;
        };
        Stage.prototype.loadImage = function (path) {
            return this.loader.loadImage(path);
        };
        Stage.prototype.update = function () {
            var _this = this;
            if(this.completed) {
                if(this.isActive()) {
                    this.callback('update');
                    this.complete();
                    this.bullets.forEach(function (bullet) {
                        bullet.update();
                        bullet.position.add(bullet.velocity);
                    });
                    this.playerBullets.forEach(function (bullet) {
                        bullet.update();
                        bullet.position.add(bullet.velocity);
                    });
                    var updateUnit = function (unit) {
                        if(unit.update) {
                            unit.update();
                        }
                        unit.position.x = Math.max(0, Math.min(_this.shooter.width, unit.position.x + unit.velocity.x));
                        unit.position.y = Math.max(0, Math.min(_this.shooter.height, unit.position.y + unit.velocity.y));
                        unit.velocity.set(0, 0);
                    };
                    this.units.forEach(function (unit) {
                        updateUnit(unit);
                    });
                    if(this.shooter.player.update) {
                        updateUnit(this.shooter.player);
                    }
                    this.effects = this.effects.filter(function (effect) {
                        effect.update();
                        return effect.count < BulletStorm.HitEffect.maxCount;
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
                            var delta = new BulletStorm.Vector2(0, 0);
                            delta.subVectors(_this.shooter.player.position, bullet.position);
                            if(delta.length() < ((_this.shooter.player.radius || 0) + bullet.size)) {
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
                            var delta = new BulletStorm.Vector2(0, 0);
                            delta.subVectors(unit.position, bullet.position);
                            if(delta.length() < ((unit.radius || 0) + bullet.size)) {
                                result = false;
                                _this.effects.push(new BulletStorm.HitEffect(new BulletStorm.Vector2(bullet.position.x - 8 + 16 * Math.random(), bullet.position.y - 8 * Math.random()), 0, hitEffectImage));
                                unit.life = Math.max(0, unit.life - 1);
                                break;
                            }
                        }
                        return result;
                    });
                    this.totalFrameCount += 1;
                    this.brightness = Math.min(1, this.brightness + 0.02);
                    this.swinging.mul(0.95);
                } else {
                    this.brightness = Math.max(0, this.brightness - 0.02);
                }
            }
        };
        Stage.prototype.paint = function (graphics) {
            if(this.completed) {
                graphics.save();
                var swingRange = Math.sin(Math.PI * 2 * (this.totalFrameCount % 5) / 5);
                graphics.translate(swingRange * this.swinging.x, swingRange * this.swinging.y);
                graphics.save();
                this.callback('paintBackground', graphics);
                graphics.restore();
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
                if(this.units.length > 0) {
                    var enemy = this.units[0];
                    graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    graphics.fillRect(10, 10, 480, 3);
                    graphics.fillStyle = 'rgba(255, 64, 64, 0.9)';
                    graphics.fillRect(10, 10, 480 * enemy.life / enemy.maxLife, 3);
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
            }
        };
        Stage.prototype.nway = function (n, d, origin, target, speed) {
            var _this = this;
            return function () {
                var velocity = new BulletStorm.Vector2();
                velocity.subVectors(target, origin);
                var angle = Math.atan2(velocity.y, velocity.x);
                for(var i = 0; i < n; i++) {
                    var bullet = new LargeBullet();
                    bullet.position = origin.clone();
                    bullet.velocity = BulletStorm.Vector2.fromAngle(angle - d * (n - 1) * 0.5 + d * i, speed);
                    _this.bullets.push(bullet);
                }
            };
        };
        return Stage;
    })();
    BulletStorm.Stage = Stage;    
    Object.freeze(Stage);
    Object.freeze(Stage.prototype);
    var LargeBullet = (function (_super) {
        __extends(LargeBullet, _super);
        function LargeBullet() {
                _super.call(this);
            this.size = 4;
            Object.seal(this);
        }
        LargeBullet.prototype.paint = function (g) {
            g.globalCompositeOperation = 'lighter';
            g.drawImage(bulletLargeImage, -bulletLargeImage.width / 2, -bulletLargeImage.height / 2);
        };
        return LargeBullet;
    })(BulletStorm.Bullet);
    BulletStorm.LargeBullet = LargeBullet;    
    Object.freeze(LargeBullet);
    Object.freeze(LargeBullet.prototype);
    var DartBullet = (function (_super) {
        __extends(DartBullet, _super);
        function DartBullet() {
                _super.call(this);
            this.size = 4;
            Object.seal(this);
        }
        DartBullet.prototype.paint = function (g) {
            g.drawImage(dartImage, -dartImage.width / 2, -dartImage.height / 2);
        };
        return DartBullet;
    })(BulletStorm.Bullet);
    BulletStorm.DartBullet = DartBullet;    
    Object.freeze(DartBullet);
    Object.freeze(DartBullet.prototype);
    var EnemyUnit = (function (_super) {
        __extends(EnemyUnit, _super);
        function EnemyUnit(shooter) {
                _super.call(this, kogasaImage);
            this.shooter = shooter;
            this.maxLife = 1000;
            this.life = 1000;
            this.updateUnit = null;
            this.radius = 30;
            Object.seal(this);
        }
        EnemyUnit.prototype.update = function () {
            _super.prototype.update.call(this);
            if(this.updateUnit) {
                this.updateUnit();
            }
            if(this.life === 0) {
                this.shooter.stage.units.splice(this.shooter.stage.units.indexOf(this), 1);
            }
        };
        return EnemyUnit;
    })(BulletStorm.Unit);
    BulletStorm.EnemyUnit = EnemyUnit;    
    Object.freeze(EnemyUnit);
    Object.freeze(EnemyUnit.prototype);
    var PlayerUnit = (function (_super) {
        __extends(PlayerUnit, _super);
        function PlayerUnit(shooter) {
                _super.call(this, rumiaImage);
            this.life = 6;
            this.bomb = 3;
            this.probation = 0;
            Object.seal(this);
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
    })(BulletStorm.Unit);
    BulletStorm.PlayerUnit = PlayerUnit;    
    Object.freeze(PlayerUnit);
    Object.freeze(PlayerUnit.prototype);
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    function animate(f) {
        var requestAnimationFrame = window['requestAnimationFrame'] || window['mozRequestAnimationFrame'];
        function update() {
            requestAnimationFrame(function () {
                f();
                update();
            });
        }
        update();
    }
    BulletStorm.animate = animate;
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    var totalFrameCount = 0;
    var keyTable = {
    };
    BulletStorm.animate(function () {
        totalFrameCount += 1;
    });
    window.addEventListener('keydown', function (e) {
        if(keyTable[e.keyCode] === undefined) {
            keyTable[e.keyCode] = totalFrameCount;
        }
    });
    window.addEventListener('keyup', function (e) {
        delete keyTable[e.keyCode];
    });
    function getKey(keyCode) {
        return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - totalFrameCount) : null;
    }
    BulletStorm.getKey = getKey;
    function getArrowKey() {
        return new BulletStorm.Vector2((getKey(39) ? 1 : 0) - (getKey(37) ? 1 : 0), (getKey(40) ? 1 : 0) - (getKey(38) ? 1 : 0));
    }
    BulletStorm.getArrowKey = getArrowKey;
    function getZKey() {
        return getKey(90);
    }
    BulletStorm.getZKey = getZKey;
    function getSpaceKey() {
        return getKey(90);
    }
    BulletStorm.getSpaceKey = getSpaceKey;
    function getShiftKey() {
        return getKey(16);
    }
    BulletStorm.getShiftKey = getShiftKey;
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    var fpsCountStart = performance.now();
    var frameCount = 0;
    var indicators = [];
    function addFPSIndicater(elementID) {
        var fpsIndicator = document.querySelector(elementID);
        if(fpsIndicator) {
            indicators.push(fpsIndicator);
        }
    }
    BulletStorm.addFPSIndicater = addFPSIndicater;
    BulletStorm.animate(function () {
        frameCount += 1;
        var now = performance.now();
        var deltaTime = now - fpsCountStart;
        if(deltaTime >= 1000) {
            indicators.forEach(function (i) {
                i.textContent = (frameCount * 1000 / deltaTime).toFixed(2);
            });
            frameCount = 0;
            fpsCountStart = now;
        }
    });
})(BulletStorm || (BulletStorm = {}));
var BulletStorm;
(function (BulletStorm) {
    window.addEventListener('load', function () {
        var loader = new BulletStorm.ResourceLoader();
        var stageScript = loader.loadText('script/kogasa.ts');
        loader.start(function () {
            var canvas = $('#canvas')[0];
            var graphics = canvas.getContext('2d');
            var bulletsIndicator = $('#bullets')[0];
            BulletStorm.addFPSIndicater('#fps');
            var shooter = new BulletStorm.Shooter(canvas);
            shooter.stage.script = stageScript();
            var textarea = $('#textarea')[0];
            var editor = $('#editor')[0];
            var samples = document.querySelectorAll('#samples > a');
            $('#edit').click(function () {
                textarea.value = shooter.stage.script;
                editor.setAttribute('style', 'display: block;');
            });
            $('#edit_cancel').click(function () {
                editor.removeAttribute('style');
            });
            $('#edit_ok').click(function () {
                shooter.stage.script = textarea.value;
                editor.removeAttribute('style');
            });
            for(var i = 0; i < samples.length; i++) {
                (function () {
                    var a = samples[i];
                    $(a).click(function (e) {
                        $.get(a.getAttribute('href'), function (data) {
                            textarea.value = data;
                        });
                        e.preventDefault();
                    });
                })();
            }
            BulletStorm.animate(function () {
                if(editor.hasAttribute('style') === false) {
                    shooter.player.velocity.set(0, 0);
                    var accurate = BulletStorm.getShiftKey() !== null;
                    var speed = accurate ? 1 : 3;
                    shooter.stage.pointerAlpha = Math.max(0, Math.min(1, shooter.stage.pointerAlpha + 0.1 * (accurate ? 1 : -1)));
                    shooter.player.velocity.add(BulletStorm.getArrowKey().mul(speed));
                    if(BulletStorm.getZKey()) {
                        var bullet = new BulletStorm.DartBullet();
                        bullet.position.copy(shooter.player.position);
                        bullet.velocity.set(0, -30);
                        shooter.stage.playerBullets.push(bullet);
                    }
                    shooter.update();
                    shooter.stage.paint(graphics);
                    bulletsIndicator.textContent = shooter.stage.bullets.length.toString();
                    function updateGauge(containerID, imagePath, value) {
                        var gauge = document.querySelector(containerID);
                        if(gauge.childNodes.length !== value) {
                            while(gauge.childNodes.length > 0) {
                                gauge.removeChild(gauge.childNodes[0]);
                            }
                            for(var i = 0; i < value; i++) {
                                gauge.appendChild(BulletStorm.loadImage(imagePath));
                            }
                        }
                    }
                    updateGauge('#life', BulletStorm.origin + 'heart.svg', shooter.player.life);
                    updateGauge('#bomb', BulletStorm.origin + 'star.svg', shooter.player.bomb);
                }
            });
        });
    });
})(BulletStorm || (BulletStorm = {}));
