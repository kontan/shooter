// random.js

'use strict';

function fire(){
    var angle = Math.PI * 2 * Math.random();
    var speed = 0.5 + Math.random() * 2; 
    var bullet = new LargeBullet();
    bullet.position.x = unit.position.x;
    bullet.position.y = unit.position.y;
    bullet.velocity.x = speed * Math.cos(angle);
    bullet.velocity.y = speed * Math.sin(angle);
    shooter.stage.bullets.push(bullet);	
}

for(var i = 0; i < 4 && shooter.stage.bullets.length < 500; i++){
    fire();
}
