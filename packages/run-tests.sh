docker run --rm -p 27018:27017 --name mongotest -d mongo
npx mocha ./*/tests/**/*.test.js 
docker rm -f mongotest