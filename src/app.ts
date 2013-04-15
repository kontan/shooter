/// <reference path="jquery.d.ts" />
/// <reference path="BulletStorm.ts" />
/// <reference path="Keyboard.ts" />
/// <reference path="Util.ts" />
/// <reference path="FPSCounter.ts" />

module BulletStorm {

    window.addEventListener('load', ()=>{

        var loader: ResourceLoader = new ResourceLoader();

        var stageScript: () => string = loader.loadText('script/kogasa.ts');

        loader.start(()=>{

            // references //////////////////////////////////////////////////////////////////////////////////////////////////////////
            var canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#canvas')[0];
            var graphics: CanvasRenderingContext2D = canvas.getContext('2d');
            var bulletsIndicator: HTMLSpanElement = <HTMLSpanElement> $('#bullets')[0];
            
            // fps count            
            addFPSIndicater('#fps');

            // game object initialization /////////////////////////////////////////////////////////////////////////////////////////////
            var shooter: Shooter = new Shooter(canvas);
            shooter.stage.script = stageScript();

            // editor event handling //////////////////////////////////////////////////////////////////////////////////////////////////
            var textarea: HTMLTextAreaElement = <HTMLTextAreaElement> $('#textarea')[0];
            var editor: HTMLElement = $('#editor')[0];
            var samples: NodeList = document.querySelectorAll('#samples > a');

            $('#edit').click(()=>{
                textarea.value = shooter.stage.script;
                editor.setAttribute('style', 'display: block;');
            });

            $('#edit_cancel').click(()=>{
                editor.removeAttribute('style');
            });

            $('#edit_ok').click(()=>{
                shooter.stage.script = textarea.value;
                editor.removeAttribute('style');
            });

            for(var i = 0; i < samples.length; i++)()=>{
                var a = <HTMLAnchorElement> samples[i];
                $(a).click((e: MouseEvent)=>{
                    $.get(a.getAttribute('href'), function(data){
                        textarea.value = data;
                    });
                    e.preventDefault();
                });
            }();

            // game loop ///////////////////////////////////////////////////////////////

            animate(()=>{                
                if(editor.hasAttribute('style') === false){
                    // process inputs ///////////////////////////////////////////////////////////

                    // preprocess
                    shooter.player.velocity.set(0, 0);

                    // key 
                    var accurate = getShiftKey() !== null;
                    var speed = accurate ? 1 : 3;
                    shooter.stage.pointerAlpha = Math.max(0, Math.min(1, shooter.stage.pointerAlpha + 0.1 * (accurate ? 1 : -1)));
                    shooter.player.velocity.add(getArrowKey().mul(speed));

                    if(getZKey()){
                        var bullet = new DartBullet();
                        bullet.position.copy(shooter.player.position);
                        bullet.velocity.set(0, -30);
                        shooter.stage.playerBullets.push(bullet);
                    }

                    // update //////////////////////////////////////////////////////////////////////////
                    shooter.update();
                    shooter.stage.paint(graphics);

                    // update side bar //////////////////////////////////////////////////////
                    bulletsIndicator.textContent = shooter.stage.bullets.length.toString();

                    // heart
                    function updateGauge(containerID: string, imagePath: string, value: number): void {
                        var gauge = <HTMLSpanElement> document.querySelector(containerID);
                        if(gauge.childNodes.length !== value){
                            // remove all child
                            while(gauge.childNodes.length > 0){
                                gauge.removeChild(gauge.childNodes[0]);
                            }
                            // add images
                            for(var i = 0; i < value; i++){
                                gauge.appendChild(loadImage(imagePath));
                            }
                        }
                    }

                    updateGauge('#life', BulletStorm.origin + 'heart.svg', shooter.player.life);
                    updateGauge('#bomb', BulletStorm.origin + 'star.svg', shooter.player.bomb);
                }
            });
        });
    });
}

