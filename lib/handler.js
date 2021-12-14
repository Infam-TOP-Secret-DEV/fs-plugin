"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileServiceHandler = void 0;
const form_data_1 = __importDefault(require("form-data"));
const jsonwebtoken_1 = require("jsonwebtoken");
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
class FileServiceHandler {
    constructor(options) {
        const { apiUrl, fileAccess, fileAccessLink } = options;
        this._apiUrl = new url_1.URL(apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);
        const { expired: expiresIn = 900000 } = fileAccess;
        this._fileAccess = {
            ...fileAccess,
            expired: expiresIn,
        };
        const { expired: linkExpiresIn = 60 * 60 * 24 * 3 * 1000 /* 3 days */ } = fileAccessLink;
        this._fileAccessLink = {
            ...fileAccessLink,
            expired: linkExpiresIn,
        };
    }
    fileURL(fileId, route) {
        let path = `file/${fileId}`;
        if (route) {
            path += `/${route}`;
        }
        return new url_1.URL(path, this._apiUrl);
    }
    getDirectLink(cred) {
        const url = this.fileURL(cred.fileId);
        url.searchParams.set('token', this.createToken(cred.userId, 'fileAccessLink'));
        return url;
    }
    filePostBody(file) {
        const body = new form_data_1.default();
        if (file.public != null) {
            body.append('public', String(file.public));
        }
        if (file.storage != null) {
            body.append('storage', file.storage);
        }
        if (file.type != null) {
            body.append('type', file.type);
        }
        body.append('file', file.data, {
            filename: file.name,
            contentType: file.mime,
        });
        return body;
    }
    createToken(userId, tokenType = 'fileAccess') {
        const data = {
            userId,
            timestamp: Date.now(),
        };
        let secret;
        let expiresIn;
        switch (tokenType) {
            case 'fileAccess':
                secret = this._fileAccess.secret;
                expiresIn = this._fileAccess.expired;
                break;
            case 'fileAccessLink':
                secret = this._fileAccessLink.secret;
                expiresIn = this._fileAccess.expired;
                break;
        }
        return (0, jsonwebtoken_1.sign)(data, secret, { expiresIn });
    }
    validateToken(token, tokenType = 'fileAccess') {
        let secret;
        switch (tokenType) {
            case 'fileAccess':
                secret = this._fileAccess.secret;
                break;
            case 'fileAccessLink':
                secret = this._fileAccessLink.secret;
                break;
        }
        try {
            return (0, jsonwebtoken_1.verify)(token, secret);
        }
        catch (e) {
            throw Error('Token invalid');
        }
    }
    async create(file) {
        const url = new url_1.URL('file', this._apiUrl);
        const { data, ...info } = file;
        const logPrefix = `[file-service:${url.href}]`;
        console.debug(`${logPrefix} Creating`, info);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'POST',
            body: this.filePostBody(file),
            headers: { Authorization: 'Bearer ' + this.createToken(file.userId) },
        });
        const responseText = await response.text();
        if (!response.ok) {
            console.error(`${logPrefix} Failed to create`, info, 'Status:', response.status, 'Response:', responseText);
            throw new Error(`Failed to create ${file.name} for ${file.userId}`);
        }
        const { result } = JSON.parse(responseText);
        console.debug(`${logPrefix} Created`, responseText);
        return result;
    }
    async edit(file) {
        const url = this.fileURL(file.fileId);
        const { data, ...info } = file;
        const logPrefix = `[file-service:${url.href}]`;
        console.debug(`${logPrefix} Editing`, info);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'PUT',
            body: this.filePostBody(file),
            headers: { Authorization: 'Bearer ' + this.createToken(file.userId, 'fileAccess') },
        });
        const responseText = await response.text();
        if (!response.ok) {
            console.error(`${logPrefix} Failed to edit`, info, 'Status:', response.status, 'Response:', responseText);
            throw new Error(`Failed to edit ${file.name} for ${file.userId}`);
        }
        const { result } = JSON.parse(responseText);
        console.debug(`${logPrefix} Edited`, responseText);
        return result;
    }
    async get(cred) {
        const url = this.fileURL(cred.fileId);
        const logPrefix = `[file-service:${url.href}]`;
        console.debug(`${logPrefix} Downloading`);
        const response = await (0, node_fetch_1.default)(url, {
            headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
        });
        if (!response.ok) {
            console.error(`${logPrefix} Failed to download. Status:`, response.status, 'Response:', await response.text());
            throw new Error(`Failed to download file ${url.href}`);
        }
        const buffer = await response.buffer();
        console.debug(`${logPrefix} Downloaded`, buffer.length, 'bytes');
        return buffer;
    }
    async info(cred) {
        const url = this.fileURL(cred.fileId, 'info');
        const logPrefix = `[file-service:${url.href}]`;
        console.debug(`${logPrefix} Get info`);
        const response = await (0, node_fetch_1.default)(url, {
            headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
        });
        if (!response.ok) {
            console.error(`${logPrefix} Failed to get info. Status:`, response.status, 'Response:', await response.text());
            throw new Error(`Failed to get info file ${url.href}`);
        }
        const { result: info } = (await response.json());
        console.debug(`${logPrefix} Received`);
        return info;
    }
    async destroy(cred) {
        const url = this.fileURL(cred.fileId);
        const logPrefix = `[file-service:${url.href}]`;
        console.debug(`${logPrefix} Destroying`);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
        });
        if (!response.ok) {
            console.error(`${logPrefix} Failed to destroy. Status:`, response.status, 'Response:', await response.text());
            throw new Error(`Failed to destroy file ${url.href}`);
        }
        console.debug(`${logPrefix} Destroyed`);
        return true;
    }
}
exports.FileServiceHandler = FileServiceHandler;
