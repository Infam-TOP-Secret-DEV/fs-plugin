import { Plugin } from '@hapi/hapi';
import { FileServiceOptions, FileServiceServerAddons } from './interfaces';
declare module '@hapi/hapi' {
    interface Server extends FileServiceServerAddons {
    }
}
export declare const FileService: Plugin<FileServiceOptions>;
