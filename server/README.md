

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
npm install
npx prisma generate
npx prisma db push
```

## Debug the app

```bash
# Forward service in cluster to localhost, run this command in another terminal separately
kubectl port-forward deployment/mongodb 27017:27017 -n laf-system
kubectl port-forward statefulset/laf-minio 9000:9000 -n laf-system
kubectl port-forward deployments/casdoor 30070:8000 -n laf-system

# Run these in first time or when someone change the schema.
cd server
npm install
npx prisma db push
npx prisma generate

# run dev
npm run watch
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```