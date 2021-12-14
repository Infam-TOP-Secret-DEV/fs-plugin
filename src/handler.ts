import FormData from 'form-data';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import { URL } from 'url';
import { FileTokenType } from './enum';
import { FileCred, FileInfo, FileServiceOptions, FileUpload, FileEdit } from './interfaces';

export class FileServiceHandler {
  private readonly _apiUrl: URL;
  private readonly _fileAccess: Required<FileServiceOptions['fileAccess']>;
  private readonly _fileAccessLink: Required<FileServiceOptions['fileAccessLink']>;

  constructor(options: FileServiceOptions) {
    const { apiUrl, fileAccess, fileAccessLink } = options;

    this._apiUrl = new URL(apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`);

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

  fileURL(fileId: string, route?: 'info'): URL {
    let path = `file/${fileId}`;

    if (route) {
      path += `/${route}`;
    }

    return new URL(path, this._apiUrl);
  }

  getDirectLink(cred: FileCred): URL {
    const url = this.fileURL(cred.fileId);

    url.searchParams.set('token', this.createToken(cred.userId, 'fileAccessLink'));

    return url;
  }

  private filePostBody(file: FileUpload): FormData {
    const body = new FormData();

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

  public createToken(userId: string, tokenType: FileTokenType = 'fileAccess'): string {
    const data: UserAuthData = {
      userId,
      timestamp: Date.now(),
    };
    let secret: string;
    let expiresIn: number;
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

    return sign(data, secret, { expiresIn });
  }

  public validateToken(
    token: string,
    tokenType: FileTokenType = 'fileAccess',
  ): string | JwtPayload {
    let secret: string;
    switch (tokenType) {
      case 'fileAccess':
        secret = this._fileAccess.secret;
        break;
      case 'fileAccessLink':
        secret = this._fileAccessLink.secret;
        break;
    }
    try {
      return verify(token, secret);
    } catch (e) {
      throw Error('Token invalid');
    }
  }

  async create(file: FileUpload): Promise<FileInfo> {
    const url = new URL('file', this._apiUrl);
    const { data, ...info } = file;
    const logPrefix = `[file-service:${url.href}]`;

    console.debug(`${logPrefix} Creating`, info);
    const response = await fetch(url, {
      method: 'POST',
      body: this.filePostBody(file),
      headers: { Authorization: 'Bearer ' + this.createToken(file.userId) },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `${logPrefix} Failed to create`,
        info,
        'Status:',
        response.status,
        'Response:',
        responseText,
      );
      throw new Error(`Failed to create ${file.name} for ${file.userId}`);
    }

    const { result } = JSON.parse(responseText) as { ok: true; result: FileInfo };

    console.debug(`${logPrefix} Created`, responseText);

    return result;
  }

  async edit(file: FileEdit): Promise<FileInfo> {
    const url = this.fileURL(file.fileId);
    const { data, ...info } = file;
    const logPrefix = `[file-service:${url.href}]`;

    console.debug(`${logPrefix} Editing`, info);

    const response = await fetch(url, {
      method: 'PUT',
      body: this.filePostBody(file),
      headers: { Authorization: 'Bearer ' + this.createToken(file.userId, 'fileAccess') },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `${logPrefix} Failed to edit`,
        info,
        'Status:',
        response.status,
        'Response:',
        responseText,
      );
      throw new Error(`Failed to edit ${file.name} for ${file.userId}`);
    }

    const { result } = JSON.parse(responseText) as FileServicePOSTResponse;

    console.debug(`${logPrefix} Edited`, responseText);

    return result;
  }

  async get(cred: FileCred): Promise<Buffer> {
    const url = this.fileURL(cred.fileId);
    const logPrefix = `[file-service:${url.href}]`;

    console.debug(`${logPrefix} Downloading`);

    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
    });
    if (!response.ok) {
      console.error(
        `${logPrefix} Failed to download. Status:`,
        response.status,
        'Response:',
        await response.text(),
      );
      throw new Error(`Failed to download file ${url.href}`);
    }

    const buffer = await response.buffer();

    console.debug(`${logPrefix} Downloaded`, buffer.length, 'bytes');

    return buffer;
  }

  async info(cred: FileCred): Promise<FileInfo> {
    const url = this.fileURL(cred.fileId, 'info');
    const logPrefix = `[file-service:${url.href}]`;

    console.debug(`${logPrefix} Get info`);

    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
    });

    if (!response.ok) {
      console.error(
        `${logPrefix} Failed to get info. Status:`,
        response.status,
        'Response:',
        await response.text(),
      );
      throw new Error(`Failed to get info file ${url.href}`);
    }

    const { result: info } = (await response.json()) as { result: FileInfo };

    console.debug(`${logPrefix} Received`);

    return info;
  }

  async destroy(cred: FileCred): Promise<boolean> {
    const url = this.fileURL(cred.fileId);
    const logPrefix = `[file-service:${url.href}]`;

    console.debug(`${logPrefix} Destroying`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + this.createToken(cred.userId) },
    });
    if (!response.ok) {
      console.error(
        `${logPrefix} Failed to destroy. Status:`,
        response.status,
        'Response:',
        await response.text(),
      );
      throw new Error(`Failed to destroy file ${url.href}`);
    }

    console.debug(`${logPrefix} Destroyed`);

    return true;
  }
}

interface UserAuthData {
  readonly userId: string;
  readonly timestamp: number;
}

interface FileServicePOSTResponse {
  ok: true;
  result: FileInfo;
}
