/// <reference path="Util.ts" />
/// <reference path="Vector2.ts" />

module BulletStorm {
    var totalFrameCount: number = 0;
    var keyTable: { [keyCode: number]: number; } = <any>{};

    animate(()=>{
        totalFrameCount += 1;
    });
    
    window.addEventListener('keydown', (e: KeyboardEvent)=>{
        if(keyTable[e.keyCode] === undefined){
            keyTable[e.keyCode] = totalFrameCount;
        }
    });

    window.addEventListener('keyup', (e: KeyboardEvent)=>{
        delete keyTable[e.keyCode];
    });    

    export function getKey(keyCode: number): number{
        return keyTable[keyCode] !== undefined ? (keyTable[keyCode] - totalFrameCount) : null;
    }

    export function getArrowKey(){
        return new Vector2(
            (getKey(39) ? 1 : 0) - (getKey(37) ? 1 : 0),
            (getKey(40) ? 1 : 0) - (getKey(38) ? 1 : 0)
        );
    }

    export function getZKey(){   
        return getKey(90);
    } 

    export function getSpaceKey(){   
        return getKey(90);
    }     

    export function getShiftKey(){   
        return getKey(16);
    }     
}