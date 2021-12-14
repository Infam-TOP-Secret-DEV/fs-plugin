import { beforeEach, describe, expect, it } from '@jest/globals';
import { FileServiceHandler } from './handler';
import { JwtPayload, } from 'jsonwebtoken';

describe('FileService', () => {
  let handler: FileServiceHandler;

  beforeEach(() => {
    handler = new FileServiceHandler({
      apiUrl: 'http://files-dev.investgate.ru/api',
      fileAccess: {
        secret: 'secret',
      },
      fileAccessLink: {
        secret: 'secret',
      },
    });
  });

  describe('fileURL', () => {
    it('builds file URL', () => {
      expect(handler.fileURL('test-file').href).toBe(
        'http://files-dev.investgate.ru/api/file/test-file',
      );
    });
    it('builds file info URL', () => {
      expect(handler.fileURL('test-file', 'info').href).toBe(
        'http://files-dev.investgate.ru/api/file/test-file/info',
      );
    });
  });

  describe('getDirectLink', () => {
    it('obtains direct file link', () => {
      const directLink = handler.getDirectLink({ userId: 'test-user', fileId: 'test-file' });

      expect(directLink.pathname).toBe('/api/file/test-file');
      expect(directLink.searchParams.getAll('token')).toEqual([expect.any(String)]);
    });
  });

  describe('token', () => {
    let token: string;
    const validateResult = {
      exp: expect.any(Number),
      iat: expect.any(Number),
      timestamp: expect.any(Number),
      "userId": "test-user"
    }
    it('create token: fileAccess', () => {
      token = handler.createToken('test-user');

      expect(token).toEqual(expect.any(String));
    });

    it('validate token: fileAccess', () => {
      const fileAccess: string | JwtPayload = handler.validateToken(token);

      expect(fileAccess).toEqual(validateResult);
    });

    it('create token: fileAccessLink', () => {
      token = handler.createToken('test-user', 'fileAccessLink');

      expect(token).toEqual(expect.any(String));
    });

    it('validate token: fileAccessLink', () => {
      const fileAccessLink: string | JwtPayload = handler.validateToken(token, 'fileAccessLink');

      expect(fileAccessLink).toEqual(validateResult);
    });
  });
});
