class Vector2 {
	x: number;
	y: number;
	constructor(x: number, y: number): Vector2;
	add(v: Vector2): Vector2;
	copy(v: Vector2): Vector2;
	static fromAngle(angle: number, length?: number): Vector2;
}

interface BulletScript {
	initialize(shooter: Shooter, state: any): void;
	update(shooter: Shooter, state: any): void;
	finalize(shooter: Shooter, state: any): void;
}

class Shooter {
	player: Unit;
}

class Unit {
	position: Vector2;
	size: number;
}

class Bullet {
	position: Vector2;
	velocity: Vector2;
	intersect(unit: Unit): bool;
	update(): void;
}
