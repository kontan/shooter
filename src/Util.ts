module BulletStorm {
	export function animate(f){
		var requestAnimationFrame = window['requestAnimationFrame'] || 
	                                window['mozRequestAnimationFrame'];
	    function update(){
		    requestAnimationFrame(()=>{
		    	f();
		    	update();
		    });
		}

		update();
	}
}