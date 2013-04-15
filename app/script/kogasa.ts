// ステージスクリプト全体は、スクリプトがロードされたときに一度だけ呼ばれます。

// shooter オブジェクトはゲーム全体を表すオブジェクトです。


// 弾や敵キャラクターを初期化します。初期化しない場合は、スクリプトが読み込まれるたびにさらに追加されることになります。
shooter.stage.initialize();

// nway.js
var MaxBullets = 200;
var Frequency = 60;
var Ways = 8;
var Varying = 0.2;
var BulletSpeed = 2.0;

function newEnemy(){
    var now = 0;

    var enemy = shooter.newEnemy();
    enemy.position.set(shooter.width / 2, shooter.height / 2 - 160);

    // updateUnit は各ユニットごとにあるプロパティで、毎フレーム呼び出される関数です
    enemy.updateUnit = function(){
        
        // unit はこのスクリプトが設定されている敵キャラクターです。
        // unit.position.x を変更すると、そのキャラクターの x 座標を変更することができます。
        enemy.position.x = shooter.width / 2 + 100 * Math.sin(now++ * 0.01);

        // shooter.now はゲームを開始してから経過したフレーム数を number で返します。
        // ここの条件式では、Frequency フレームに一度弾が発射されるようになっています。 
        if(shooter.now % Frequency === 0){
            shooter.stage.nway(Ways, Varying, enemy.position, shooter.player.position, BulletSpeed)();
        }
    };

    shooter.stage.units.push(enemy);
}

newEnemy();

// shooter.stage.loadImage で画像を読み込むことができます。
// 関数呼び出しの返り値は関数オブジェクトで、それを呼び出すと、リソースの読み込みが完了している場合は要求したリソース、
// そうでなければ undefined が返ります。
// loadImage の直後はリソースは使用不可なので気を付けます
var backgroundImageRes = shooter.stage.loadImage('res/ground.png');
var cloudImageRes = shooter.stage.loadImage('res/cloud.png');
var cloudUpperImageRes = shooter.stage.loadImage('res/cloud_upper.png');
var stageScrollDelta = 0;
var cloudScrollDelta = 0;
var lowerCloudScrollDelta = 0;

// スクリプト内でリソースを読み込みを開始した場合、それがすべて読み込まれると exports.complete が呼び出されます。
// exports.complete の呼び出しが終わると、このプロパティは削除されます。
// exports でエクスポートされた他の関数についても、リソースの読み込みが完了するまでは呼び出されません。
exports.complete = function(){

};

// ステージスクリプト内では、スコープ内に exports という変数があります。
// exports には空のオブジェクトが束縛されており、スクリプトでは自由に値を設定することができます。
// exports のいくつかのプロパティは特別に扱われます。
// exports.update に設定された関数は、毎フレーム呼び出されます。
exports.update = function(){ 
    stageScrollDelta = (stageScrollDelta + 2.0) % backgroundImageRes().height;    
    cloudScrollDelta = (cloudScrollDelta + 22.2) % cloudImageRes().height;
    lowerCloudScrollDelta = (lowerCloudScrollDelta + 8.7) % cloudUpperImageRes().height;  
};

// 背景を描画する関数です。
exports.paintBackground = function(g){
    g.drawImage(backgroundImageRes(), 0, stageScrollDelta);
    g.drawImage(backgroundImageRes(), 0, stageScrollDelta - backgroundImageRes().height);

    g.drawImage(cloudImageRes(), 0, lowerCloudScrollDelta);
    g.drawImage(cloudImageRes(), 0, lowerCloudScrollDelta - cloudImageRes().height);

    g.globalCompositeOperation = 'lighter';
    g.drawImage(cloudUpperImageRes(), 0, cloudScrollDelta);
    g.drawImage(cloudUpperImageRes(), 0, cloudScrollDelta - cloudUpperImageRes().height);
    g.globalCompositeOperation = 'source-over';    
};