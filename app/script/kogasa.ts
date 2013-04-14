// nway.js
var MaxBullets = 200;
var Frequency = 60;
var Ways = 8;
var Varying = 0.2;
var BulletSpeed = 2.0;

// nway 弾を発射します。
// @param n 一度に発射される弾丸の個数
// @param d 弾丸が分散する角度
// @param target 弾丸の狙う位置
function nway(n, d, position, target){
    // 弾丸を発射する角度を求めます。
    // そのために、発射位置からターゲットの位置への方向ベクトルを求めます。
    var v = new Vector2();

    // unit はこのスクリプトが設定されている敵キャラクターです。
    // その位置からターゲットの位置を減算すると、発射の方向へのベクトルになります。
    // v.subVectors(u, t) は v = u - t の意味です。
    v.subVectors(target, position);

    // 方向ベクトル v がわかれば、v.getAngle() で角度 を求めることができます。
    var angle = v.getAngle();

    // n-way 弾なので n 回繰り返してループします。
    // ただし、ステージに弾丸が多すぎないように、MaxBullets より少ない時だけ実行します。
    for(var i = 0; i < n && shooter.stage.bullets.length < MaxBullets; i++){

        // 弾丸を作成します。初期状態では位置 (0,0), 速度(0,0) です。
        var bullet = new LargeBullet();

        // 弾丸の初期位置をこの敵キャラクターと同じにしています
        bullet.position = position.clone();

        // angle が n-way 弾全体の発射方向です。
        // d はn-way 弾のとなりあう弾丸の角度で、それが n 個発射されるので、
        // 弾丸の広がる扇形の全体の角度は d * (n - 1) です。
        // 従って、一番端の弾丸の角度は angle - d * (n - 1) * 0.5 で表されます。
        // 一番端の弾丸から d * i　ずつ角度を変えながら発射すれば n-way 弾になります。
        // これをまとめると、 i 番目の弾丸の角度は angle - d * (n - 1) * 0.5 + d * i となり、
        // これを整理すると angle + d * (i - (n - 1) * 0.5) となります。
        // Vector2.fromAngle は角度と長さから新たなベクトルを作成します。
        bullet.velocity = Vector2.fromAngle(angle + d * (i - (n - 1) * 0.5), BulletSpeed);
        
        // 弾丸をステージに追加します。Stage.bullets は
        // 現在のステージに存在する敵キャラクターが発射したすべての弾丸を保持するリストです。
        shooter.stage.bullets.push(bullet);
    }
}

function newEnemy(){
    var now = 0;

    var enemy = shooter.newEnemy();
    enemy.position.x = shooter.width / 2;
    enemy.position.y = shooter.height / 2 - 160;
    enemy.updateUnit = function(){
        
        // unit はこのスクリプトが設定されている敵キャラクターです。
        // unit.position.x を変更すると、そのキャラクターの x 座標を変更することができます。
        enemy.position.x = shooter.width / 2 + 100 * Math.sin(now++ * 0.01);

        // shooter.now はゲームを開始してから経過したフレーム数を number で返します。
        // ここの条件式では、Frequency フレームに一度弾が発射されるようになっています。 
        if(shooter.now % Frequency === 0){
            nway(Ways, Varying, enemy.position, shooter.player.position);
        }
    };

    shooter.stage.units.push(enemy);
}

newEnemy();

exports.update = function(){ 
    //if(shooter.now % 100 === 0){
    //    newEnemy();
    //}
};