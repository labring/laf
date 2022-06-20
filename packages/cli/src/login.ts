
import { program } from 'commander'
import {loginapi} from './api/login'
import  * as path  from 'node:path'
import * as fs from 'node:fs'
import {homedir} from 'node:os'
const CREDENTIALs_file = '.laf-credentials';

program
.command('login')
.option('-u, --username <username>', 'username')
.option('-p, --password <password>', 'password')
.action(async ( options) => {
    const envdir = path.resolve(homedir(), CREDENTIALs_file)
    fs.access(envdir, fs.constants.F_OK,(err) => {
      console.log(`${envdir} ${err ? 'does not exist' : 'exists'}`);
      if(err){
        fs.mkdir(envdir, { recursive: true }, (err) => {
          if (err) throw err;
        });
      }
    });
    const username = options.username
    const password = options.password
    if(!username) {
      console.error('username is required')
      process.exit(1)
    }
    if(!password) {
      console.error('password is required')
      process.exit(1)
    }

    const result = await loginapi({username,password})

    const response =  result.data

    if(response.code!=0){
        console.error('username or password is wrong')
        process.exit(1)
    }
    const content = {access_token:response.data.access_token}

    const envFile  = path.resolve(envdir, 'auth.json')

    fs.writeFileSync(envFile, JSON.stringify(content),{ flag: 'w+' })
    console.log(`Generated: ${envFile}`)
});

program.parse(process.argv);
