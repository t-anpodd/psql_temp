import psqlActionHelper, * as achelper from './PsqlClientFinder';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import { configure } from '@testing-library/react';
import * as core from '@actions/core';

async function run()
{
    let psqlPath = await psqlActionHelper.getPsqlClientPath();

    //provided as action input
    let regEx  = new RegExp('sql[0-9]\.sql');

    //provided as action input
    let targetDirectory = `C:\\Users\\anish\\Documents\\GitHub\\psql_try\\src`;

    //provided as action input
    let connectionString = `"host=new-server.postgres.database.azure.com port=5432 dbname=new_db user=anishpoddar2307@new-server password=E4_individualist sslmode=require"`;

    fs.readdir(targetDirectory, function(err, files){
        if(err)
        {
            return core.debug('Unable to read files from this directory');
        }

        files.forEach(async function(file){

            if(regEx.test(file))
            {
                console.log("File matching regex found: " + file);
                await exec.exec(`"${psqlPath}" -f ` + targetDirectory + '\\' + file + ` ${connectionString}`);
            }
        });
    });
}

run();