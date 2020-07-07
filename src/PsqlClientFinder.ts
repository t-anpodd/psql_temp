//import statements here
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import * as winreg from 'winreg';
import * as exec from '@actions/exec';

const IS_WINDOWS = process.platform === 'win32';

export default class PsqlClientFinder
{
    public static async getPsqlClientPath(): Promise<string> {
        core.debug(`Getting location of PSQL client on ${os.hostname()}`);
        if (IS_WINDOWS) {
            return this._getPsqlClientOnWindows();
        }
        else {
            return this._getPsqlClientOnLinux();
        }
    }

    public static resolveFilePath(filePathPattern: string): string {
        let filePath = filePathPattern;
        if (glob.hasMagic(filePathPattern)) {
            let matchedFiles: string[] = glob.sync(filePathPattern);
            if (matchedFiles.length === 0) {
                throw new Error(`No files found matching pattern ${filePathPattern}`);
            }

            if (matchedFiles.length > 1) {
                throw new Error(`Muliple files found matching pattern ${filePathPattern}`);
            }

            filePath = matchedFiles[0];
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Unable to find file at location: ${filePath}`);
        }
        
        return filePath;
    }

    public static getRegistrySubKeys(path: string): Promise<winreg.Registry[]> {
        return new Promise((resolve) => {
            core.debug(`Getting sub-keys at registry path: HKLM:${path}`);
            let regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });

            regKey.keys((error, result) => {
                return !!error ? '' : resolve(result);
            })
        });
    }

    public static getRegistryValue(registryKey: winreg.Registry, name: string): Promise<string> {
        return new Promise((resolve) => {
            core.debug(`Getting registry value ${name} at path: HKLM:${registryKey.key}`);
            registryKey.get(name, (error, result: winreg.RegistryItem) => {
                resolve(!!error ? '' : result.value);
            });
        });
    }

    public static registryKeyExists(path: string): Promise<boolean> {
        core.debug(`Checking if registry key 'HKLM:${path}' exists.`);
        return new Promise((resolve) => {
            let regKey = new winreg({
                hive: winreg.HKLM,
                key: path
            });

            regKey.keyExists((error, result: boolean) => {
                resolve(!!error ? false : result);
            })
        });
    }

    private static async _getpsqlClientPathFromRegistry(registryPath: string): Promise<string> {
        core.debug(`Getting location of psql.exe from registryPath HKLM:${registryPath}`);
        let registrySubKeys = await PsqlClientFinder.getRegistrySubKeys(registryPath);

        let latestVersionKey = registrySubKeys[0].key;
        let latestVersion = 0.0;

        for(let subKey of registrySubKeys)
        {
            let splitArray = subKey.key.split('-');
            let version = parseFloat(splitArray[splitArray.length - 1]);

            if(version > latestVersion)
            {
                latestVersionKey = subKey.key;
                latestVersion = version;
            }
        }
        
        let splitLatest = latestVersionKey.split('\\');
        let latestPsqlInstallation = splitLatest[splitLatest.length - 1];
        core.debug(`Latest version of PSQL found is: ${latestPsqlInstallation}`);

        for (let registryKey of registrySubKeys) {
            if (registryKey.key.match(latestPsqlInstallation)) {
                let psqlServerPath = await PsqlClientFinder.getRegistryValue(registryKey, 'Base Directory');
                if (!!psqlServerPath) {
                    let psqlClientExecutablePath = path.join(psqlServerPath, 'bin', 'psql.exe');
                    if (fs.existsSync(psqlClientExecutablePath)) {
                        core.debug(`PSQL client executable found at path ${psqlClientExecutablePath}`);
                        return psqlClientExecutablePath;
                    }
                }
            }
        }

        return '';
    }

    private static async _getPsqlClientOnLinux(): Promise<string> {
        let  psqlClientPath = await io.which('psql.exe', true);
        core.debug(`PSQL client found at path ${psqlClientPath}`);
        return psqlClientPath;
    }

    private static async _getPsqlClientOnWindows(): Promise<string> {
        //let  psqlClientPath = await io.which('psql.exe', true);

        let psqlClientRegistryKey = path.join('\\', 'Software', 'PostgreSQL', 'Installations');
        let psqlClientPath = '';
        
        if (await PsqlClientFinder.registryKeyExists(psqlClientRegistryKey)) {
            psqlClientPath = await this._getpsqlClientPathFromRegistry(psqlClientRegistryKey);    
        }

        if (!psqlClientPath) {
            core.debug(`Unable to find PSQL client executable on ${os.hostname()} from registry.`);
            core.debug(`Getting location of psql.exe from PATH environment variable.`);
            psqlClientPath = await io.which('psql', false);
        }

        if (psqlClientPath) {
            core.debug(`PSQL client found at path ${psqlClientPath}`);
            return psqlClientPath;
        }
        else {
            throw new Error(`Unable to find PSQL client executable on ${os.hostname()}.`);
        }
    }
}

//TEST CODE

async function mainfunc(){
var psqlPath = await PsqlClientFinder.getPsqlClientPath();
console.log(psqlPath);
}

mainfunc();

//END OF TEST CODE