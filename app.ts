declare var $: any;

// image pathes

var origin: string = "http://phyzkit.net/shooter/";
var rumiaImagePath: string           = origin + 'rumia.png';
var rumiaImagePathF: string          = origin + 'rumia_f.png';
var rumiaImagePathB: string          = origin + 'rumia_b.png';
var rumiaImagePathL: string          = origin + 'rumia_l.png';
var rumiaImagePathR: string          = origin + 'rumia_r.png';
var kogasaImagePath: string          = origin + 'kogasa.png';
var bulletLargeImagePath: string     = origin + 'bullet_large.png';
var dartImagePath: string            = origin + 'dart.png';
var pointerImagePath: string         = origin + 'pointer.png';
var heartImagePath: string           = origin + 'heart.svg';
var starImagePath: string            = origin + 'star.svg';
var stageBackgroundImagePath: string = origin + 'ground.png';
var stageCloudImagePath: string      = origin + 'cloud.png';
var upperCloudImagePath: string      = origin + 'cloud_upper.png';
var hitEffectImagePath: string       = origin + 'hiteffect.png';

//////////////////////////////////////////////////////////
// Game library
/////////////////////////////////////////////////////////

class Vector2 {
    constructor(public x?: number = 0, public y?: number = 0) {
    }
    static fromAngle(angle: number, length?: number = 1): Vector2{
    	return new Vector2(
	    	length * Math.cos(angle), 
	    	length * Math.sin(angle)
	    );
    }
    copy(v: Vector2): Vector2 {
        this.x = v.x;
        this.y = v.y;
    }
    add(v: Vector2): Vector2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    } 
    addVectors(a: Vector2, b: Vector2): Vector2 {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }
    subVectors(a: Vector2, b: Vector2): Vector2 {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }
    mul(t: number): Vector2{
        this.x *= t;
        this.y *= t;
        return this;
    }
    length(): number {
        return Math.sqrt(this.lengthSq());
    }
    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }
    setLength(v: number): Vector2{
    	var t = v / this.length();
    	this.x *= t;
    	this.y *= t;
    	return this;
    }
    clone(): Vector2{
        return new Vector2(this.x, this.y);
    }
    getAngle(): number{
    	return Math.atan2(this.y, this.x);
    }
}

function loadImage(path: string): HTMLImageElement{
    var img = new Image();
    img.src = path;
    return img;
}


class ResourceLoader{
    private resourceCount: number = 0;
    private loaders: { (): void; }[] = [];

    constructor(private onComplete: ()=>void){
    }

    private loaded(){
        this.resourceCount -= 1;
        if(this.resourceCount === 0){
            this.onComplete();
        }
    }

    loadImage(path: string): () => HTMLImageElement{
        var img = new Image();
        img.addEventListener('load', this.loaded);
        img.addEventListener('error', this.loaded);
        img.addEventListener('abort', this.loaded);
        this.loaders.push(()=>{
            img.src = path;
        });
        return ()=>img.complete ? img : null;
    }

    loadText(path: string): () => string{
        var request: XMLHttpRequest = new XMLHttpRequest();
        request.addEventListener('load', ()=>{
            this.loaded();
        });
        request.addEventListener('error', ()=>{
            this.loaded();
        });

        this.loaders.push(()=>{
            request.open('get', path, false);
            request.send();
        });
        return ()=>request.readyState === 4 ? request.responseText : null;
    }

    loadTextFromElement(id: string): () => string{
        var element = document.getElementById(id);
        var text = element.textContent;
        return ()=>text;
    }

    jsonp(url: string, mapping?: (json: any) => any): () => any{
        var json = null;
        this.loaders.push(()=>{
            $.getJSON(url, (data)=>{
                json = data;
                this.loaded();
            });
        });
        return ()=>mapping ? mapping(json) : json;
    }

    start(): void{
    	if(this.loaders.length > 0){
    		this.resourceCount = this.loaders.length;
	        this.loaders.forEach((loader)=>loader());
	        this.loaders = [];
        }else{
        	this.onComplete();
        }
    }
}



/////////////////////////////////////////////////////////
// Application
///////////////////////////////////////////////////////////

/**
 * 各アクションは関数であり、呼び出すとそのフレームで完了させるべきタスクを完了します。
 * 自分のタスクが残っていれば true を返し、すべて完了すると false を返します。
 */
interface Action {
    (): bool;
}

class Shooter{
    width: number;
    height: number;
    stage: Stage = null;
    player: PlayerUnit = null;
    currentFrame: number = 0;
    reservedActions: { (): void; }[] = [];

    constructor(private canvas: HTMLCanvasElement){
        this.width = canvas.width;
        this.height = canvas.height;
    }

    loadScript(path: string, onLoad: (scriptText:string)=>void): void{
    	var loader = new ResourceLoader(()=>{
    		onLoad(script());
    	});
    	//var script = loader.loadText(path);
    	var script = loader.loadTextFromElement(path);
    	loader.start();
    }

    contains(point: Vector2, margin?: number = 0): bool{
        var x = point.x;
        var y = point.y;
        return x >= -margin && x < (this.width  + margin) && 
               y >= -margin && y < (this.height + margin);        
    }

    update(): void{
        this.reservedActions.filter(action=>action());
        this.stage.update();    
        this.currentFrame += 1;
    }


    /// アクションコンビネータ //////////////////////////////////////////////////////////////

    /**
     * 指定したフレーム数だけ待機します。
     */ 
    wait(frames: number): Action {
        var start: number;
        return () => {
            if(start === undefined){
                start = this.currentFrame;
            }
            if(this.currentFrame >= start + frames){
                start = undefined;
                return false;
            }else{
                return true;
            }
        };
    }

    sequential(...actions: Action[]): Action {
        var index = 0;
        return () => {
            while(index < actions.length){
                if(actions[index]()){
                    return true;
                }else{
                    index++;
                }
            }
            return false;
        };
    }

    /// 指定したアクションを繰り返します。
    /// 渡されたアクションに一つも wait が含まれていない場合は1フレームの間に無限ループすることになってしまうので、
    /// その場合は既定の回数以上のアクションが実行されるとエラーになります。
    loop(...actions: Action[]): Action {
        var index = 0;
        return () => {
            for(var i = 0; ; i++){
                if(i >= 10000){
                    throw "loop: Invalid loop action";
                }
                if(actions[index]()){
                    return true;
                }else{
                    index = (index + 1) % actions.length;
                }
            }
        };
    }

    /// 複数のアクションを並列して実行するアクションを作成します。
    /// 弾を発射しながら移動するような場合に使用します。
    /// すべてのアクションが完了した場合にこのアクションは完了したとみなされます。
    concurrent(...actions: Action[]): Action {
        return ()=>actions.some(action=>action());
    }

    // 組み込みアクション ////////////////////////////////////////////////////////////////////////////////////////////////////////

    // n-way 弾を発射します。
    // origin, target に渡されたオブジェクトは複製されずにそのまま参照され続けることに注意してください。
    // アクションが作成された瞬間の位置に対して固定して発射したい場合は、clone してから渡してください。
    nway(n: number, d: number, origin: Vector2, target: Vector2, speed: number){
        return ()=>{
            var velocity = new Vector2();
            velocity.subVectors(target, origin);
            velocity.setLength(1);

            var angle = Math.atan2(velocity.y, velocity.x);
            for(var i = 0; i < n; i++){
                var bullet = new LargeBullet();
                bullet.position = origin.clone();
                bullet.velocity = Vector2.fromAngle(angle - d * (n - 1) * 0.5 + d * i, speed);
                this.stage.bullets.push(bullet);
            }
        }
    }
}

class Stage{
	bullets: Bullet[] = [];
    playerBullets: Bullet[] = [];
    units: EnemyUnit[] = [];
    effects: HitEffect[] = [];
    enemy: EnemyUnit = null;

    stageScrollDelta: number = 0;
    cloudScrollDelta: number = 0;
    lowerCloudScrollDelta: number = 0;

    // visual states
    pointerAlpha: number = 0;
	swinging: Vector2 = new Vector2(0, 0);
	brightness: number = 1;
    totalFrameCount: number = 0;

    constructor(private shooter: Shooter){
    }

    swing(size?: number = 20, angle?: number = Math.PI * 2 * Math.random()): void{
        this.swinging = new Vector2(size * Math.cos(angle), size * Math.sin(angle));  
    }

    isActive(): bool{
    	return this.shooter.player.life > 0 && this.units.length > 0;
    }

    // スペルカードを起動します。
    spell(): void{

    }

    update(): void{
    	if(this.isActive()){

	    	// update game states

			this.bullets.forEach((bullet: Bullet)=>{
	            bullet.update();
	        });

	        this.playerBullets.forEach((bullet: Bullet)=>{
	            bullet.update();
	        });

	        this.units.forEach((unit: Unit)=>{
	            unit.update();
	        });

	        this.shooter.player.update();

			this.effects = this.effects.filter((effect: HitEffect)=>{
	            effect.update();
	            return effect.count < HitEffect.maxCount;
	        });	                
				
				this.playerBullets = this.playerBullets.filter((bullet: Bullet)=>{
	            return this.shooter.contains(bullet.position, 64);
	        });

	        this.bullets = this.bullets.filter((bullet: Bullet)=>{
	            return this.shooter.contains(bullet.position, 64);
	        });

	        
	        // collision detection

	        if(this.shooter.player.probation === 0){
	        	var crashed = false;
	            this.bullets = this.bullets.filter((bullet: Bullet)=>{
	                var delta = new Vector2(0, 0);
	                delta.subVectors(this.shooter.player.position, bullet.position);
	                if(delta.length() < (this.shooter.player.radius + bullet.size)){
	                	crashed = true;    
	                    return false;
	                }else{
	                    return true;
	                }
	            });
	            if(crashed){
					this.shooter.player.crash();
	                this.shooter.stage.swing();	            	
	            }
	        }

	        this.playerBullets = this.playerBullets.filter((bullet: Bullet)=>{
	        	var result = true;
	        	for(var i = 0; i < this.units.length; i++){
	        		var unit: EnemyUnit = this.units[i];
	                var delta = new Vector2(0, 0);
	                delta.subVectors(unit.position, bullet.position);
	                if(delta.length() < (unit.radius + bullet.size)){
	                    result = false;
	                    this.effects.push(new HitEffect(new Vector2(
	                    	bullet.position.x - 8 + 16 * Math.random(),
	                    	bullet.position.y - 8 * Math.random()
	                    )));
	                    unit.life = Math.max(0, unit.life - 1);
	                    break;
	                }
	        	}
	        	return result;
	        });


	        // visual effects /////////////////////////////////////////////////////////////////

	        this.totalFrameCount += 1;
	        this.brightness = Math.min(1, this.brightness + 0.02);

			// swinging dumper
			this.swinging.mul(0.95);    

	        // scroll 
	        this.stageScrollDelta += 2.0;
	        this.stageScrollDelta = this.stageScrollDelta % stageBackgroundImage.height;    

	        this.cloudScrollDelta += 22.2;
	        this.cloudScrollDelta = this.cloudScrollDelta % stageCloudImage.height;

	        this.lowerCloudScrollDelta += 8.7;    
	        this.lowerCloudScrollDelta = this.lowerCloudScrollDelta % stageCloudImage.height;
	    }else{
	    	this.brightness = Math.max(0, this.brightness - 0.02);
	    }
    }


    paint(graphics: CanvasRenderingContext2D): void{

	    graphics.save();
	    var swingRange = Math.sin(Math.PI * 2 * (this.totalFrameCount % 5) / 5);
	    graphics.translate(
	        swingRange * this.swinging.x, 
	        swingRange * this.swinging.y
	    );

        // background
        graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta);
        graphics.drawImage(stageBackgroundImage, 0, this.stageScrollDelta - stageBackgroundImage.height);

        graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta);
        graphics.drawImage(stageCloudImage, 0, this.lowerCloudScrollDelta - stageCloudImage.height);

        graphics.globalCompositeOperation = 'lighter';
        graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta);
        graphics.drawImage(upperCloudImage, 0, this.cloudScrollDelta - stageCloudImage.height);
        graphics.globalCompositeOperation = 'source-over';

        // draw enemies
        this.units.forEach((unit: Unit)=>{
            graphics.save();
            graphics.translate(unit.position.x, unit.position.y);
            unit.paint(graphics);
            graphics.restore();
        });

        // draw player
		graphics.save();
        graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
        this.shooter.player.paint(graphics);
        graphics.restore();

        this.effects.forEach((effect: HitEffect)=>{
        	effect.paint(graphics);
        });
        
        // draw player bullets
        this.playerBullets.forEach((bullet: Bullet)=>{
            graphics.save();
            graphics.translate(bullet.position.x, bullet.position.y);
            bullet.paint(graphics);
            graphics.restore();
        });

        // draw bullets
        this.bullets.forEach((bullet: Bullet)=>{
            graphics.save();
            graphics.translate(bullet.position.x, bullet.position.y);
            bullet.paint(graphics);
            graphics.restore();
        });

        // draw pointer 
        if(this.pointerAlpha > 0){
            graphics.save();
            graphics.translate(this.shooter.player.position.x, this.shooter.player.position.y);
            graphics.globalAlpha = this.pointerAlpha;
            graphics.drawImage(pointerImage, -pointerImage.width / 2, -pointerImage.height / 2);
            graphics.restore();
        }

	    graphics.restore();

		// paint HUD
		if(this.enemy !== null){
			graphics.fillStyle = 'rgba(0, 0, 0, 0.5)';
			graphics.fillRect(10, 10, 480, 3);
			graphics.fillStyle = 'rgba(255, 64, 64, 0.9)';
			graphics.fillRect(10, 10, 480 * this.enemy.life / this.enemy.maxLife, 3);
		}

	    if(this.brightness < 1){
	    	graphics.fillStyle = 'rgba(0, 0, 0, ' + (0.5 * (1 - this.brightness)) + ')';
	    	graphics.fillRect(0, 0, this.shooter.width, this.shooter.height);
	    }

	    // upper HUD
	    if(this.brightness < 1){
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
}

class Bullet{
    position: Vector2 = new Vector2(0, 0);
    velocity: Vector2 = new Vector2(0, 0);
    angle: number = 0;
    constructor(public size: number){
    }
    update(): void{
        this.position.add(this.velocity);
    }
    paint(g: CanvasRenderingContext2D): void{
    }
}

interface UnitImages{
    image: HTMLImageElement;
    front: HTMLImageElement;
    back:  HTMLImageElement;
    left:  HTMLImageElement;
    right: HTMLImageElement;	
}

var rumiaImage: UnitImages = {
    image: loadImage(rumiaImagePath),
    front: loadImage(rumiaImagePathF),
    back:  loadImage(rumiaImagePathB),
    left:  loadImage(rumiaImagePathL),
    right: loadImage(rumiaImagePathR)
};

var kogasaImage: UnitImages = {
    image: loadImage(kogasaImagePath),
    front: loadImage(kogasaImagePath),
    back:  loadImage(kogasaImagePath),
    left:  loadImage(kogasaImagePath),
    right: loadImage(kogasaImagePath)
};

var bulletLargeImage: HTMLImageElement = loadImage(bulletLargeImagePath);
var dartImage: HTMLImageElement = loadImage(dartImagePath);
var pointerImage = loadImage(pointerImagePath);
var heartImage = loadImage(heartImagePath);
var starImage = loadImage(starImagePath);
var stageBackgroundImage = loadImage(stageBackgroundImagePath);
var stageCloudImage = loadImage(stageCloudImagePath);
var upperCloudImage = loadImage(upperCloudImagePath);
var hitEffectImage = loadImage(hitEffectImagePath);

class LargeBullet extends Bullet{
    constructor(){
        super(4);
    }
    paint(g: CanvasRenderingContext2D): void{
        g.globalCompositeOperation = 'lighter';
        g.drawImage(
            bulletLargeImage, 
            -bulletLargeImage.width / 2,
            -bulletLargeImage.height / 2
        );
    }
}

class DartBullet extends Bullet{
    constructor(){
        super(4);
    }
    paint(g: CanvasRenderingContext2D): void{
        //g.globalCompositeOperation = 'lighter';
        g.drawImage(
            dartImage, 
            -dartImage.width / 2,
            -dartImage.height / 2
        );
    }
}

class Unit{

    // このオブジェクトはこのユニットの位置を常に保持するオブジェクトとして、
    // ユニットの位置を追跡するのにもつかわれています
    // ユニットの位置を変更したい場合は、
    //     unit.position = newPosition;
    // というようにオブジェクトごと置き換えるのではなく、
    //     unit.position.copy(newPosition);
    // のように Vector2 のプロパティを書き換えるようにします。
    //
    // @readonly
    position: Vector2 = new Vector2(0, 0);

    // @readonly
    velocity: Vector2 = new Vector2(0, 0);

    radius: number = 5;

    img: HTMLImageElement;
    constructor(private shooter: Shooter, private images: UnitImages){
    }

    update(): void{
        this.position.x = Math.max(0, Math.min(this.shooter.width,  this.position.x + this.velocity.x));
        this.position.y = Math.max(0, Math.min(this.shooter.height, this.position.y + this.velocity.y));

        this.img = this.velocity.y < 0 ? this.images.front : 
                   this.velocity.y > 0 ? this.images.back :
                   this.velocity.x < 0 ? this.images.left :
                   this.velocity.x > 0 ? this.images.right :
                   this.images.image;
        this.velocity = new Vector2(0, 0);
    }
    paint(g: CanvasRenderingContext2D): void{
        g.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
    }
}

class EnemyUnit extends Unit{
    scriptText: string;
    private script: (shooter:Shooter) => void = null;
    private scriptState: any = {}; 
    maxLife: number = 1000;
    life: number = 1000;

    constructor(private shooter: Shooter){
        super(shooter, kogasaImage);
        this.radius = 30;
    }

    setScript(scriptText: string): void{
        try{
            this.scriptText = scriptText;
            this.script = <(shooter: Shooter) => void> new Function('shooter', 'unit', 'state', scriptText);
        	this.scriptState = {};
        }catch(e){
            console.log(e);
        }
    }

    update(): void{
        super.update();
        if(this.script !== null){
            var args: any[] = [this.shooter, this, this.scriptState];
            try{
                this.script.apply(undefined, args);
            }catch(e){
                console.log(e);
                this.script = null;
            }
        }

        if(this.life === 0){
        	this.shooter.stage.units.splice(this.shooter.stage.units.indexOf(this), 1);
        	if(this.shooter.stage.enemy === this){
        		this.shooter.stage.enemy = null;
        	}
        }
    }
}

class PlayerUnit extends Unit{
    life: number = 6;
    bomb: number = 3;
    probation: number = 0;
    constructor(shooter: Shooter){
        super(shooter, rumiaImage);
    }
    crash(): void{
        this.probation = 120;
        this.life = Math.max(0, this.life - 1);
    }
    update(): void{
        super.update();
        this.probation = Math.max(0, this.probation - 1);
    }
    paint(g: CanvasRenderingContext2D): void{
        if(this.probation > 0 && Math.floor(this.probation / 2) % 2 === 0){
            g.globalAlpha = 0.5;
        }
        super.paint(g);
    }
}

class HitEffect{
	static maxCount: number = 20;
	constructor(public position: Vector2, public count?: number = 0){
	}
	update(): void{
		this.count += 1;
	}
	paint(g: CanvasRenderingContext2D): void{
		g.save();
		g.translate(
			this.position.x,
        	this.position.y - this.count * 2
		);
		g.rotate(this.count * 0.1);
		g.translate(
			-hitEffectImage.width / 2,
        	-hitEffectImage.height / 2
		);
		g.globalAlpha = 0.2 - 0.2 * this.count / HitEffect.maxCount;
        g.drawImage(hitEffectImage, 0, 0);
        g.restore();
    }
}

/////////////////////////////////////////////////////////
// Initialization
///////////////////////////////////////////////////////////

window.addEventListener('load', ()=>{

    var loader: ResourceLoader = new ResourceLoader(()=>{

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

	        		var elem = document.getElementById(a.getAttribute('data-href'));
	        		var textarea = <HTMLTextareaElement> document.getElementById('textarea');
	        		textarea.value = elem.textContent;

	        		//shooter.loadScript(a.href, (script: string)=>{
	        		//	var textarea = <HTMLTextareaElement> document.getElementById('textarea');
	        		//	textarea.value = script;
	        		//});        		
	        		
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
	                        lifeGauge.appendChild(loadImage('heart.svg'));
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
	                        bombGauge.appendChild(loadImage('star.svg'));
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
    //var bulletScript: () => string = loader.loadText('bullets/nway.js');
    //var bulletScript: () => string = loader.loadTextFromElement('script_nway');
    //var bulletScript: () => string = loader.loadTextFromElement('script_random');
    //var bulletScript = loader.jsonp("http://phyzkit.net/bullet.cgi?name=random&callback=?", json=> json.script.replace('\\n', '\n'));
 
    var bulletScript: () => string = loader.loadTextFromElement('script_combination');

    loader.start();
});
