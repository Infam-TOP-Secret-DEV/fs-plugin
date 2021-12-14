import { Plugin, Server } from '@hapi/hapi';
import { FileServiceServerAddons } from '../interfaces';

export interface MockFileServiceOptions {
  readonly serverMocks?: Partial<FileServiceServerAddons>;
}

export const MockFileService: Plugin<MockFileServiceOptions> = {
  name: 'fileService',
  register(server: Server, options: MockFileServiceOptions = {}) {
    const { serverMocks = {} } = options;
    Object.entries(serverMocks).forEach(([name, method]) => {
      server.decorate('server', name, method);
    });
  },
};
