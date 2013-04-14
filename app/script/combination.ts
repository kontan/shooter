var MaxBullets = 200;
var Frequency = 60;
var Ways = 8;
var Varying = 0.2;
var BulletSpeed = 2.0;

function nway(n){
    return shooter.nway(n, Varying, unit.position, shooter.player.position, BulletSpeed);
}

// アクションの初期化。
// スクリプト内で定義されるローカル変数は１フレームだけで保存されるので、
// 次のフレームでアクセスしたい場合は state というオブジェクトのプロパティに保存しておく。
// state はスクリプトが切り替えられる度に破棄されます
if(state.action === undefined){
    state.action = shooter.loop(
        nway(3),
        shooter.wait(30),
        nway(4),
        shooter.wait(30)
    );
}

// アクションを実行します。
// このフレームで為すべきアクションだけ実行します。
// アクションが完了した場合は false を返しますが、loop で作成したアクションなので常に true を返します。
state.action();