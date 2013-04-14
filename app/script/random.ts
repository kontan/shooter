// random.js

function fire(): void {
    var angle = Math.PI * 2 * Math.random();
    var speed = 0.5 + Math.random() * 2; 
    var bullet = new LargeBullet();
    var velocity = Vector2.fromAngle(angle, speed);
    bullet.velocity = velocity.clone();
    bullet.position = unit.position.clone().add(velocity.setLength(50));
    shooter.stage.bullets.push(bullet);    
}

for(var i = 0; i < 4 && shooter.stage.bullets.length < 500; i++){
    fire();
}