"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
//import statements here
var core = require("@actions/core");
var io = require("@actions/io");
var os = require("os");
var path = require("path");
var fs = require("fs");
var glob = require("glob");
var winreg = require("winreg");
var IS_WINDOWS = process.platform === 'win32';
var PsqlClientFinder = /** @class */ (function () {
    function PsqlClientFinder() {
    }
    PsqlClientFinder.getPsqlClientPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                core.debug("Getting location of PSQL client on " + os.hostname());
                if (IS_WINDOWS) {
                    return [2 /*return*/, this._getPsqlClientOnWindows()];
                }
                else {
                    return [2 /*return*/, this._getPsqlClientOnLinux()];
                }
                return [2 /*return*/];
            });
        });
    };
    PsqlClientFinder.resolveFilePath = function (filePathPattern) {
        var filePath = filePathPattern;
        if (glob.hasMagic(filePathPattern)) {
            var matchedFiles = glob.sync(filePathPattern);
            if (matchedFiles.length === 0) {
                throw new Error("No files found matching pattern " + filePathPattern);
            }
            if (matchedFiles.length > 1) {
                throw new Error("Muliple files found matching pattern " + filePathPattern);
            }
            filePath = matchedFiles[0];
        }
        if (!fs.existsSync(filePath)) {
            throw new Error("Unable to find file at location: " + filePath);
        }
        return filePath;
    };
    PsqlClientFinder.getRegistrySubKeys = function (path) {
        return new Promise(function (resolve) {
            core.debug("Getting sub-keys at registry path: HKLM:" + path);
            var regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });
            regKey.keys(function (error, result) {
                return !!error ? '' : resolve(result);
            });
        });
    };
    PsqlClientFinder.getRegistryValue = function (registryKey, name) {
        return new Promise(function (resolve) {
            core.debug("Getting registry value " + name + " at path: HKLM:" + registryKey.key);
            registryKey.get(name, function (error, result) {
                resolve(!!error ? '' : result.value);
            });
        });
    };
    PsqlClientFinder.registryKeyExists = function (path) {
        core.debug("Checking if registry key 'HKLM:" + path + "' exists.");
        return new Promise(function (resolve) {
            var regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });
            regKey.keyExists(function (error, result) {
                resolve(!!error ? false : result);
            });
        });
    };
    PsqlClientFinder._getpsqlClientPathFromRegistry = function (registryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var registrySubKeys, latestVersionKey, latestVersion, _i, registrySubKeys_1, subKey, splitArray, version, splitLatest, latestPsqlInstallation, _a, registrySubKeys_2, registryKey, psqlServerPath, psqlClientExecutablePath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        core.debug("Getting location of psql.exe from registryPath HKLM:" + registryPath);
                        return [4 /*yield*/, PsqlClientFinder.getRegistrySubKeys(registryPath)];
                    case 1:
                        registrySubKeys = _b.sent();
                        latestVersionKey = registrySubKeys[0].key;
                        latestVersion = 0.0;
                        for (_i = 0, registrySubKeys_1 = registrySubKeys; _i < registrySubKeys_1.length; _i++) {
                            subKey = registrySubKeys_1[_i];
                            splitArray = subKey.key.split('-');
                            version = parseFloat(splitArray[splitArray.length - 1]);
                            if (version > latestVersion) {
                                latestVersionKey = subKey.key;
                                latestVersion = version;
                            }
                        }
                        splitLatest = latestVersionKey.split('\\');
                        latestPsqlInstallation = splitLatest[splitLatest.length - 1];
                        core.debug("Latest version of PSQL found is: " + latestPsqlInstallation);
                        _a = 0, registrySubKeys_2 = registrySubKeys;
                        _b.label = 2;
                    case 2:
                        if (!(_a < registrySubKeys_2.length)) return [3 /*break*/, 5];
                        registryKey = registrySubKeys_2[_a];
                        if (!registryKey.key.match(latestPsqlInstallation)) return [3 /*break*/, 4];
                        return [4 /*yield*/, PsqlClientFinder.getRegistryValue(registryKey, 'Base Directory')];
                    case 3:
                        psqlServerPath = _b.sent();
                        if (!!psqlServerPath) {
                            psqlClientExecutablePath = path.join(psqlServerPath, 'bin', 'psql.exe');
                            if (fs.existsSync(psqlClientExecutablePath)) {
                                core.debug("PSQL client executable found at path " + psqlClientExecutablePath);
                                return [2 /*return*/, psqlClientExecutablePath];
                            }
                        }
                        _b.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, ''];
                }
            });
        });
    };
    PsqlClientFinder._getPsqlClientOnLinux = function () {
        return __awaiter(this, void 0, void 0, function () {
            var psqlClientPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, io.which('psql.exe', true)];
                    case 1:
                        psqlClientPath = _a.sent();
                        core.debug("PSQL client found at path " + psqlClientPath);
                        return [2 /*return*/, psqlClientPath];
                }
            });
        });
    };
    PsqlClientFinder._getPsqlClientOnWindows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var psqlClientRegistryKey, psqlClientPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        psqlClientRegistryKey = path.join('\\', 'Software', 'PostgreSQL', 'Installations');
                        psqlClientPath = '';
                        return [4 /*yield*/, PsqlClientFinder.registryKeyExists(psqlClientRegistryKey)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getpsqlClientPathFromRegistry(psqlClientRegistryKey)];
                    case 2:
                        psqlClientPath = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!!psqlClientPath) return [3 /*break*/, 5];
                        core.debug("Unable to find PSQL client executable on " + os.hostname() + " from registry.");
                        core.debug("Getting location of psql.exe from PATH environment variable.");
                        return [4 /*yield*/, io.which('psql', false)];
                    case 4:
                        psqlClientPath = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (psqlClientPath) {
                            core.debug("PSQL client found at path " + psqlClientPath);
                            return [2 /*return*/, psqlClientPath];
                        }
                        else {
                            throw new Error("Unable to find PSQL client executable on " + os.hostname() + ".");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PsqlClientFinder;
}());
exports["default"] = PsqlClientFinder;
//TEST CODE
function mainfunc() {
    return __awaiter(this, void 0, void 0, function () {
        var psqlPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, PsqlClientFinder.getPsqlClientPath()];
                case 1:
                    psqlPath = _a.sent();
                    console.log(psqlPath);
                    return [2 /*return*/];
            }
        });
    });
}
mainfunc();
//END OF TEST CODE
