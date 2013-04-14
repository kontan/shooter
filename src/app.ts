/// <reference path="BulletStorm.ts" />

module BulletStorm {

    /////////////////////////////////////////////////////////
    // Initialization
    ///////////////////////////////////////////////////////////

    window.addEventListener('load', ()=>{

        var loader: BulletStorm.ResourceLoader = new BulletStorm.ResourceLoader(()=>{

            // references
            var canvas: HTMLCanvasElement = <HTMLCanvasElement> document.querySelector('#canvas');
            var graphics: CanvasRenderingContext2D = this.canvas.getContext('2d');
            
            // fps counter
            var fpsCountStart: number = performance.now();
            var frameCount: number = 0;
            var bulletsIndicator: HTMLSpanElement = <HTMLSpanElement> document.querySelector('#bullets');
            var fpsIndicator: HTMLSpanElement = <HTMLSpanElement> document.querySelector('#fps');

            // game object initialization
            var shooter: Shooter = new Shooter(canvas);

            var stage: Stage = new Stage(shooter);
            shooter.stage = stage;

            var player: PlayerUnit = new PlayerUnit(shooter);
            player.position.x = canvas.width / 2;
            player.position.y = canvas.height - 150;
            shooter.player = player;

            var enemy: EnemyUnit = new EnemyUnit(shooter);
            enemy.position.x = shooter.width / 2;
            enemy.position.y = shooter.height / 2 - 160;
            enemy.setScript(bulletScript());
            stage.units.push(enemy);
            shooter.stage.enemy = enemy;

            // event handling

            var keyTable: { [keyCode: number]: number; } = <any>{};

            window.addEventListener('keydown', (e: KeyboardEvent)=>{
                if(keyTable[e.keyCode] === undefined){
                    keyTable[e.keyCode] = shooter.stage.totalFrameCount;
                }
                if( ! editing){
                    e.preventDefault();
                }
            });

            window.addEventListener('keyup', (e: KeyboardEvent)=>{
                delete keyTable[e.keyCode];
                if( ! editing){
                    e.preventDefault();
                }
            });    

            function getKey(keyCode: number): number{
                return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - shooter.stage.totalFrameCount) : null;
            }

            // editor event handling

            var editing: bool = false;

            document.getElementById('edit').addEventListener('click', ()=>{
                document.getElementById('textarea').value = enemy.scriptText;
                document.getElementById('editor').setAttribute('style', 'display: block;');
                editing = true;
            });

            document.getElementById('edit_cancel').addEventListener('click', ()=>{
                document.getElementById('editor').removeAttribute('style');
                editing = false;
            });

            document.getElementById('edit_ok').addEventListener('click', ()=>{
                enemy.setScript(document.getElementById('textarea').value);
                document.getElementById('editor').removeAttribute('style');
                editing = false;
            });

            var samples = document.querySelectorAll('#samples > a');
            for(var i = 0; i < samples.length; i++){
                ()=>{
                    var a = <HTMLAElement> samples[i];
                    a.addEventListener('click', (e: MouseEvent)=>{
                        $.get(a.getAttribute('href'), function(data){
                            var textarea = <HTMLTextareaElement> document.getElementById('textarea');
                            textarea.value = data;
                        });
                        e.preventDefault();
                    });
                }();
            }

            // game loop ///////////////////////////////////////////////////////////////
            var requestAnimationFrame = window['requestAnimationFrame'] || 
                                        window['mozRequestAnimationFrame'];

            function updateFrame(): void{
                requestAnimationFrame(()=>{                
                    if(editing === false){
                        // process inputs ///////////////////////////////////////////////////////////

                        // preprocess
                        
                        shooter.player.velocity.x = 0;
                        shooter.player.velocity.y = 0;

                        // key 
                        if(getKey(32)){ // space key
                            shooter.swing();
                        }

                        var accurate = getKey(16) !== null;
                        var speed = accurate ? 1 : 3;
                        shooter.stage.pointerAlpha = Math.max(0, Math.min(1, shooter.stage.pointerAlpha + 0.1 * (accurate ? 1 : -1)));

                        if(getKey(37)){
                            shooter.player.velocity.x -= speed;
                        }
                        if(getKey(38)){
                            shooter.player.velocity.y -= speed;
                        }
                        if(getKey(39)){
                            shooter.player.velocity.x += speed;
                        }
                        if(getKey(40)){
                            shooter.player.velocity.y += speed;
                        }

                        if(getKey(90)){    // z
                            for(var i = 0; i < 1; i++){
                                var bullet = new DartBullet();
                                bullet.position = shooter.player.position.clone();
                                bullet.position.y += 30 * i;
                                bullet.velocity = new Vector2(0, -30);
                                stage.playerBullets.push(bullet);
                            }
                        }

                        // update //////////////////////////////////////////////////////////////////////////
                        shooter.update();

                        // paint　///////////////////////////////////////////////////////////////////////////
                        shooter.stage.paint(graphics);



                        // update side bar //////////////////////////////////////////////////////

                        bulletsIndicator.textContent = stage.bullets.length.toString();

                        // heart
                        var lifeGauge = <HTMLSpanElement> document.querySelector('#life');
                        if(lifeGauge.childNodes.length !== shooter.player.life){
                            // remove all child
                            while(lifeGauge.childNodes.length > 0){
                                lifeGauge.removeChild(lifeGauge.childNodes[0]);
                            }
                            // add images
                            for(var i = 0; i < shooter.player.life; i++){
                                lifeGauge.appendChild(loadImage(BulletStorm.origin + 'heart.svg'));
                            }
                        }

                        // bomb
                        var bombGauge = <HTMLSpanElement> document.querySelector('#bomb');
                        if(bombGauge.childNodes.length !== shooter.player.life){
                            // remove all child
                            while(bombGauge.childNodes.length > 0){
                                bombGauge.removeChild(bombGauge.childNodes[0]);
                            }
                            // add images
                            for(var i = 0; i < shooter.player.bomb; i++){
                                bombGauge.appendChild(loadImage(BulletStorm.origin + 'star.svg'));
                            }
                        }

                        // fps count /////////////////////////////////////////////////////////////
                        frameCount += 1;
                        var now = performance.now();
                        var deltaTime = now - fpsCountStart;
                        if(deltaTime >= 1000){
                            fpsIndicator.textContent = (frameCount * 1000 / deltaTime).toFixed(2);
                            frameCount = 0;
                            fpsCountStart = now;
                        }
                    }

                    // request next frame ////////////////////////////////////////////////////////////
                    updateFrame();    
                });
            }

            // start game loop
            updateFrame();
        });

        var bulletScript: () => string = loader.loadText('script/nway.ts');
        loader.start();
    });
}

