
import { program } from 'commander'
import { syncApp } from './api/sync'
import { getApplicationByAppid } from './api/apps'
import { handleInitAppCommand ,handleSyncAppCommand} from './actions/initActiont'

program
    .command('init <appid>')
    .option('-s, --sync', 'sync app', false)
    .action(async (appid, options) => {
        try {
            // get app
            const result = await getApplicationByAppid(appid)
            const appName = result.data.application.name
        
            await handleInitAppCommand(appName,appid,result.data.app_deploy_host)

            // sync app data
            if (options.sync) {
                //sync app
                const data = await syncApp(appid)
                
                await handleSyncAppCommand(appName,data)
            }
        }
        catch (err) {
            console.log(err.message)
        }

    })

program.parse(process.argv)
