"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFileServiceConfig = void 0;
const dotenv_1 = require("dotenv");
let fileServiceConfig;
function loadFileServiceConfig() {
    if (!fileServiceConfig) {
        (0, dotenv_1.config)();
        fileServiceConfig = {
            apiUrl: process.env.FILE_SERVICE_URL,
            fileAccess: {
                secret: process.env.AUTH_JWT_FILESERVICE_SECRET,
                expired: Number(process.env.AUTH_JWT_FILESERVICE_LIFETIME) || undefined,
            },
            fileAccessLink: {
                secret: process.env.AUTH_JWT_FILESERVICELINK_SECRET,
                expired: Number(process.env.AUTH_JWT_FILESERVICELINK_LIFETIME) || undefined,
            },
        };
    }
    return fileServiceConfig;
}
exports.loadFileServiceConfig = loadFileServiceConfig;
