

declare var TypeScript: any;

interface IIO {
    readFile(path: string): string;
    writeFile(path: string, contents: string): void;
    createFile(path: string, useUTF8?: bool): ITextWriter;
    deleteFile(path: string): void;
    dir(path: string, re?: RegExp, options?: { recursive?: bool; }): string[];
    fileExists(path: string): bool;
    directoryExists(path: string): bool;
    createDirectory(path: string): void;
    resolvePath(path: string): string;
    dirName(path: string): string;
    findFile(rootPath: string, partialFilePath: string): IResolvedFile;
    print(str: string): void;
    printLine(str: string): void;
    arguments: string[];
    stderr: ITextWriter;
    stdout: ITextWriter;
    watchFile(filename: string, callback: (string) => void ): IFileWatcher;
    run(source: string, filename: string): void;
    getExecutingFilePath(): string;
    quit(exitCode?: number);
}





interface IResolvedFile {
    content: string;
    path: string;
}

class ResolvedFile implements IResolvedFile {
    constructor(public content: string, public path: string){
    }
}

interface IFileWatcher {
    close(): void;
}


class BufferedTextWriter implements ITextWriter {
    private buffer: string[] = [];
    Write(s: string): void{
        this.buffer.push(s);
    }
    WriteLine(s: string): void{
        this.buffer.push(s);
        this.buffer.push('\n');
    }
    Close(): void{
    }
    toString(): string{
        return this.buffer.join('');
    }
}

class BrowserTextWriter implements ITextWriter {
    private buffer: string[] = [];
    Write(s: string): void{
        this.buffer.push(s);
    }
    WriteLine(s: string): void{
        this.buffer.push(s);
        this.buffer.push('\n');
        console.log(this.buffer.join(''));
        this.buffer = [];
    }
    Close(): void{
        console.log(this.buffer.join(''));
        this.buffer = [];
    }
}

class QuasiFile {
    writer: BufferedTextWriter = new BufferedTextWriter();
    constructor(public path: string){
    }
}

class BrowserIIO implements IIO {
    files: QuasiFile[] = [];

    readFile(path: string): string {   
        console.log('readFile');
        return null;
    }
    writeFile(path: string, contents: string): void {
        console.log('writeFile');
    }
    createFile(path: string, useUTF8?: bool): ITextWriter {
        console.log('createFile(' + path + ', ' + useUTF8 + ')');
        var file = new QuasiFile(path);
        this.files.push(file);
        return file.writer;
    }
    deleteFile(path: string): void {
        console.log('deleteFile');
    }
    dir(path: string, re?: RegExp, options?: { recursive?: bool; }): string[]{
        console.log('dir');
        return [];
    }
    fileExists(path: string): bool {
        console.log('fileExists');
        return false;
    }
    directoryExists(path: string): bool {
        console.log('directoryExists');
        return false;
    }
    createDirectory(path: string): void {
        console.log('createDirectory');
    }
    resolvePath(path: string): string {
        console.log('resolvePath');
        return path;
    }
    dirName(path: string): string {
        console.log('dirName');
        return path;
    }
    findFile(rootPath: string, partialFilePath: string): IResolvedFile {
        console.log('findFile');
        return null;
    }
    print(str: string): void {
        console.log(str);
    }
    printLine(str: string): void {
        console.log(str);
    }
    arguments: string[] = [];
    stderr: ITextWriter = new BrowserTextWriter();
    stdout: ITextWriter = new BrowserTextWriter();
    watchFile(filename: string, callback: (string) => void ): IFileWatcher {
        console.log('watchFile');
        return { close: ()=>{} };
    }
    run(source: string, filename: string): void {
        console.log('run');
    }
    getExecutingFilePath(): string {
        console.log('getExecutingFilePath');
        return "getExecutingFilePath";
    }
    quit(exitCode?: number) {
        console.log('quit');
    }
}
