import * as Table  from 'cli-table2'

import {appList} from '../api/apps'

export async function appListCommand() {

    // get list
    const response = await appList()

    //init table
    const table = new Table({
        head: ['APPId', 'name','status'],
    });

    // create app
    if(response.data.created){
        response.data.created.forEach(app => {
            table.push([app.appid,app.name,app.status])
        });
    }

    // join app
    if(response.data.joined){
        response.data.joined.forEach(app => {
            table.push([app.appid,app.name,app.status])
        });
    }
    
    // show table
    console.log(table.toString())
    
}