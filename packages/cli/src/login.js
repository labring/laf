
const { Command } = require('commander');
const request = require('axios')
const path  = require('path')
const fs = require('fs')
const program = new Command();
const homedir=  require("os").homedir()
const CREDENTIALs_file = '.laf-credentials';
program
.command('login')
.option('-u, --username <username>', 'username')
.option('-p, --password <password>', 'password')
.action(async ( options) => {
    const envdir = path.resolve(homedir, CREDENTIALs_file)
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

    const url = `https://www.lafyun.com/sys-extension-api/func/password-login`;
    const result = await request.post(url,{username,password})
    const response = result.data;
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
