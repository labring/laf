import * as Table from 'cli-table2'
import { appList } from '../api/apps'

/**
 * apps list
 * @returns
 */
export async function handleAppListCommand() {
    // get list
    const response = await appList()

    //init table
    const table = new Table({
        head: ['appid', 'name', 'status'],
    })

    // user create app
    if (response.data.created) {
        response.data.created.forEach(app => {
            table.push([app.appid, app.name, app.status])
        })
    }

    // user join app
    if (response.data.joined) {
        response.data.joined.forEach(app => {
            table.push([app.appid, app.name, app.status])
        })
    }

    // show table
    console.log(table.toString())
}