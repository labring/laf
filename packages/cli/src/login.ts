
import { program } from 'commander'
import {loginapi} from './api/login'
import * as fs from 'node:fs'
import {CREDENTIALS_DIR,AUTH_FILE} from './config/config'
program
.command('login')
.option('-u, --username <username>', 'username')
.option('-p, --password <password>', 'password')
.action(async ( options) => {
    
    fs.access(CREDENTIALS_DIR, fs.constants.F_OK,(err) => {
      console.log(`${CREDENTIALS_DIR} ${err ? 'does not exist' : 'exists'}`);
      if(err){
        fs.mkdir(CREDENTIALS_DIR, { recursive: true }, (err) => {
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



    fs.writeFileSync(AUTH_FILE, JSON.stringify(content),{ flag: 'w+' })
    console.log(`Generated: ${AUTH_FILE}`)
});

program.parse(process.argv);
