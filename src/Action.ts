module BulletStorm {
    /**
     * 各アクションは関数であり、呼び出すとそのフレームで完了させるべきタスクを完了します。
     * 自分のタスクが残っていれば true を返し、すべて完了すると false を返します。
     */
    export interface Action {
        (): bool;
    }


    /**
     * 指定したフレーム数だけ待機します。
     */ 
    export function wait(frames: number): Action {
        var start: number;
        return () => {
            if(start === undefined){
                start = this.currentFrame;
            }
            if(this.currentFrame >= start + frames){
                start = undefined;
                return false;
            }else{
                return true;
            }
        };
    }
    Object.freeze(wait);

    export function sequential(...actions: Action[]): Action {
        var index = 0;
        return () => {
            while(index < actions.length){
                if(actions[index]()){
                    return true;
                }else{
                    index++;
                }
            }
            return false;
        };
    }
    Object.freeze(sequential);    

    /// 指定したアクションを繰り返します。
    /// 渡されたアクションに一つも wait が含まれていない場合は1フレームの間に無限ループすることになってしまうので、
    /// その場合は既定の回数以上のアクションが実行されるとエラーになります。
    export function loop(...actions: Action[]): Action {
        var index = 0;
        return () => {
            for(var i = 0; ; i++){
                if(i >= 10000){
                    throw "loop: Invalid loop action";
                }
                if(actions[index]()){
                    return true;
                }else{
                    index = (index + 1) % actions.length;
                }
            }
        };
    }
    Object.freeze(loop);

    /// 複数のアクションを並列して実行するアクションを作成します。
    /// 弾を発射しながら移動するような場合に使用します。
    /// すべてのアクションが完了した場合にこのアクションは完了したとみなされます。
    export function concurrent(...actions: Action[]): Action {
        return ()=>actions.some(action=>action());
    }
    Object.freeze(concurrent);
}