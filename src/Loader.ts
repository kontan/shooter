module BulletStorm {
    export function loadImage(path: string): HTMLImageElement{
        var img = new Image();
        img.src = path;
        return img;
    }


    export class ResourceLoader{
        private resourceCount: number = 0;
        private loaders: { (): void; }[] = [];

        constructor(private onComplete: ()=>void){
        }

        private loaded(){
            this.resourceCount -= 1;
            if(this.resourceCount === 0){
                this.onComplete();
            }
        }

        loadImage(path: string): () => HTMLImageElement{
            var img = new Image();
            img.addEventListener('load', this.loaded);
            img.addEventListener('error', this.loaded);
            img.addEventListener('abort', this.loaded);
            this.loaders.push(()=>{
                img.src = path;
            });
            return ()=>img.complete ? img : null;
        }

        loadText(path: string): () => string{
            var request: XMLHttpRequest = new XMLHttpRequest();
            request.addEventListener('load', ()=>{
                this.loaded();
            });
            request.addEventListener('error', ()=>{
                this.loaded();
            });

            this.loaders.push(()=>{
                request.open('get', path, false);
                request.send();
            });
            return ()=>request.readyState === 4 ? request.responseText : null;
        }

        loadTextFromElement(id: string): () => string{
            var element = document.getElementById(id);
            var text = element.textContent;
            return ()=>text;
        }

        jsonp(url: string, mapping?: (json: any) => any): () => any{
            var json = null;
            this.loaders.push(()=>{
                $.getJSON(url, (data)=>{
                    json = data;
                    this.loaded();
                });
            });
            return ()=>mapping ? mapping(json) : json;
        }

        start(): void{
        	if(this.loaders.length > 0){
        		this.resourceCount = this.loaders.length;
    	        this.loaders.forEach((loader)=>loader());
    	        this.loaders = [];
            }else{
            	this.onComplete();
            }
        }
    }
}