"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockFileService = void 0;
exports.MockFileService = {
    name: 'fileService',
    register(server, options = {}) {
        const { serverMocks = {} } = options;
        Object.entries(serverMocks).forEach(([name, method]) => {
            server.decorate('server', name, method);
        });
    },
};
