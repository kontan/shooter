// nway.js

'use strict';

var MaxBullets = 200;
var Frequency = 60;
var Ways = 8;
var Varying = 0.2;
var BulletSpeed = 2.0;

function nway(n, d, target){
    var velocity = new Vector2();
    velocity.subVectors(target, unit.position);
    var angle = velocity.getAngle();
    for(var i = 0; i < n && shooter.stage.bullets.length < MaxBullets; i++){
	    var bullet = new LargeBullet();
	    bullet.position = unit.position.clone();
	    bullet.velocity = Vector2.fromAngle(angle - d * (n - 1) * 0.5 + d * i, BulletSpeed);
	    shooter.stage.bullets.push(bullet);
	}
}

if(shooter.currentFrame % Frequency === 0){
    nway(Ways, Varying, shooter.player.position);
}
