import * as fs from 'fs';
import * as core from '@actions/core';

export default class FileListCreator
{
    public static getFileList(targetDirectory: string, regEx: RegExp)
    {
        let fileList: string[] = [];

        let files = fs.readdirSync(targetDirectory);

        files.forEach(function(file){
    
            if(regEx.test(file))
            {
                //console.log("File matching regex found: " + file);
                fileList.push(file);
                //console.log("Current file list: " + fileList);
            }
        });

        console.log("Final file list is: " + fileList);
        return fileList;
    }
}


//TEST CODE

async function run()
{    
    let fileList = FileListCreator.getFileList('C:\\Users\\anish\\Documents\\GitHub\\psql_try\\src', RegExp(`sql[0-9]\.sql`));
    console.log("Answer: " + fileList);
}

run();

//END OF TEST CODE