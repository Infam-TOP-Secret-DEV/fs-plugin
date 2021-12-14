import { Plugin, Server } from '@hapi/hapi';
import { FileServiceOptions, FileServiceServerAddons } from './interfaces';

declare module Server {
    interface Server extends FileServiceServerAddons {
    }
}
export declare const FileService: Plugin<FileServiceOptions>;
