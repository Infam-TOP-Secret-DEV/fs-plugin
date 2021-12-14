/// <reference types="node" />
import { URL } from 'url';
import { FileStorage, FileTokenType } from './enum';
import { JwtPayload } from 'jsonwebtoken';
export interface FileInfo {
    readonly id: string;
    readonly userId: string;
    readonly name: string;
    readonly ext: string;
    readonly mime: string;
    readonly type: string;
    readonly public: boolean;
    readonly storage: FileStorage;
}
export interface FileUpload {
    readonly userId: string;
    readonly name: string;
    readonly public?: boolean | undefined;
    readonly storage?: FileStorage | undefined;
    readonly type?: string | undefined;
    readonly mime?: string | undefined;
    readonly data: Buffer;
}
export interface FileEdit extends FileUpload {
    readonly fileId: string;
}
export interface FileCred {
    readonly fileId: string;
    readonly userId: string;
}
export interface FileServiceOptions {
    readonly apiUrl: string;
    readonly fileAccess: {
        readonly expired?: number | undefined;
        readonly secret: string;
    };
    readonly fileAccessLink: {
        readonly expired?: number | undefined;
        readonly secret: string;
    };
}
export interface FileServiceServerAddons {
    fsCreateToken(userId: string, tokenType: FileTokenType): Promise<string>;
    fsValidateToken(token: string, tokenType: FileTokenType): Promise<string | JwtPayload>;
    fsCreate(file: FileUpload): Promise<FileInfo>;
    fsEdit(file: FileEdit): Promise<FileInfo>;
    fsGet(cred: FileCred): Promise<Buffer>;
    fsGetDirectLink(cred: FileCred): URL;
    fsInfo(cred: FileCred): Promise<FileInfo>;
    fsDestroy(cred: FileCred): Promise<boolean>;
}
