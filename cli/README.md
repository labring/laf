## Project Introduction

laf-cli is a command-line tool designed to help developers quickly create, deploy, and manage applications on laf.

## Quick Start

To install laf-cli, use npm:
```bash
npm install -g laf-cli
```

Once installation is complete, verify the installation using:
```bash
laf -v
```

To log in, use the login command with your personal access token (PAT), which can be obtained from User Settings -> Personal Access Tokens:
```bash
laf login <pat>
```

View the list of applications and initialize an application:
```bash
laf app list
laf app init <appId>
```

For more commands and usage:
```bash
laf -h
```

## Development

To begin development, follow the steps below:

1. Navigate to the cli directory in the terminal:
```bash
cd cli
```

2. Install the required dependencies: 
```bash
npm install
```

3. Run the watch command:
```bash
npm run watch
```

4. Open a new terminal and run link command:
```bash
npm link
```

5. Finally, verify that everything is working as expected:
```bash
laf -v
```

## File Tree

```
├── src
|  ├── action
|  |  ├── application
|  |  ├── auth
|  |  ├── dependency
|  |  ├── function
|  |  ├── policy
|  |  ├── storage
|  |  └── website
|  ├── api
|  |  └── v1
|  ├── command
|  |  ├── application
|  |  ├── auth
|  |  ├── dependency
|  |  ├── function
|  |  ├── policy
|  |  ├── storage
|  |  └── website
|  ├── common
|  ├── config
|  └── util
└── template
```
