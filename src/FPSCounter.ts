module BulletStorm {
    // fps counter
    var fpsCountStart: number = performance.now();
    var frameCount: number = 0;

    var indicators: HTMLSpanElement[] = [];

    export function addFPSIndicater(elementID: string){
    	var fpsIndicator = <HTMLSpanElement> document.querySelector(elementID);
		if(fpsIndicator){
			indicators.push(fpsIndicator);
		}
    }

    animate(()=>{
        frameCount += 1;
        var now = performance.now();
        var deltaTime = now - fpsCountStart;
        if(deltaTime >= 1000){
            indicators.forEach((i)=>{
	            i.textContent = (frameCount * 1000 / deltaTime).toFixed(2);
            });
            frameCount = 0;
            fpsCountStart = now;
        }
    });
}