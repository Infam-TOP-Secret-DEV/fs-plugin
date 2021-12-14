import { beforeAll, describe, expect, it } from '@jest/globals';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { loadFileServiceConfig } from './config';
import { FileStorage } from './enum';
import { FileServiceHandler } from './handler';
import { FileInfo } from './interfaces';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('try FileService', () => {
  let fileService: FileServiceHandler;

  beforeAll(() => {
    fileService = new FileServiceHandler(loadFileServiceConfig());
  });

  describe('file', () => {
    const fileInfo = {
      userId: '',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      type: 'unset',
      id: expect.any(String),
      ext: 'docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'TestDocument.docx',
      public: false,
      storage: FileStorage.DB,
    }
    let userId: string;
    let fileId: string;
    let data: Buffer;
    let file: FileInfo;

    beforeAll(async () => {
      userId = uuidv4();
      fileInfo.userId = userId;
      data = await fs.readFile(path.join('test', 'certificate_of_absence_of_debt.docx'));
    });

    it('uploads file', async () => {
      file = await fileService.create({
        userId,
        name: 'TestDocument.docx',
        mime: DOCX_MIME_TYPE,
        data,
      });
      expect(file).toEqual(fileInfo);
      fileId = String(file.id);
    });

    it('edits file', async () => {
      file = await fileService.edit({
        fileId,
        userId,
        name: 'TestDocument.docx',
        mime: DOCX_MIME_TYPE,
        data,
      });
      expect(file).toEqual(fileInfo);
    });

    it('get file', async () => {
      const fileId = String(file.id);
      const downloaded = await fileService.get({
        userId,
        fileId,
      });
      expect(data).toEqual(downloaded);
    });

    it('get file info', async () => {
      const fileId = String(file.id);
      const info = await fileService.info({
        userId,
        fileId,
      });
      expect(info).toEqual(fileInfo);
    });

    it('get file by direct link', async () => {
      const fileId = String(file.id);
      const url = fileService.getDirectLink({ userId, fileId });
      const response = await fetch(url);

      expect(response.ok).toBe(true);

      const downloaded = await response.buffer();

      expect(data).toEqual(downloaded);
    });

    it('delete file', async () => {
      const fileId = String(file.id);
      const responce = await fileService.destroy({
        userId,
        fileId,
      });
      expect(responce).toBe(true);
    });
  });
});
