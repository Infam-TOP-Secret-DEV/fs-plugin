/// <reference types="node" />
import { JwtPayload } from 'jsonwebtoken';
import { URL } from 'url';
import { FileTokenType } from './enum';
import { FileCred, FileInfo, FileServiceOptions, FileUpload, FileEdit } from './interfaces';
export declare class FileServiceHandler {
    private readonly _apiUrl;
    private readonly _fileAccess;
    private readonly _fileAccessLink;
    constructor(options: FileServiceOptions);
    fileURL(fileId: string, route?: 'info'): URL;
    getDirectLink(cred: FileCred): URL;
    private filePostBody;
    createToken(userId: string, tokenType?: FileTokenType): string;
    validateToken(token: string, tokenType?: FileTokenType): string | JwtPayload;
    create(file: FileUpload): Promise<FileInfo>;
    edit(file: FileEdit): Promise<FileInfo>;
    get(cred: FileCred): Promise<Buffer>;
    info(cred: FileCred): Promise<FileInfo>;
    destroy(cred: FileCred): Promise<boolean>;
}
