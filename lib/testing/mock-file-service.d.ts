import { Plugin } from '@hapi/hapi';
import { FileServiceServerAddons } from '../interfaces';
export interface MockFileServiceOptions {
    readonly serverMocks?: Partial<FileServiceServerAddons>;
}
export declare const MockFileService: Plugin<MockFileServiceOptions>;
