import { config } from 'dotenv';
import { FileServiceOptions } from './interfaces';

let fileServiceConfig: FileServiceOptions | undefined;

export function loadFileServiceConfig(): FileServiceOptions {
  if (!fileServiceConfig) {
    config();
    fileServiceConfig = {
      apiUrl: process.env.FILE_SERVICE_URL as string,
      fileAccess: {
        secret: process.env.AUTH_JWT_FILESERVICE_SECRET as string,
        expired: Number(process.env.AUTH_JWT_FILESERVICE_LIFETIME) || undefined,
      },
      fileAccessLink: {
        secret: process.env.AUTH_JWT_FILESERVICELINK_SECRET as string,
        expired: Number(process.env.AUTH_JWT_FILESERVICELINK_LIFETIME) || undefined,
      },
    };
  }

  return fileServiceConfig;
}
