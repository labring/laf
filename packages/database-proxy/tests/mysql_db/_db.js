
// docker run --name mysqldb -e MYSQL_ROOT_PASSWORD=kissme -e MYSQL_DATABASE=testdb -d -p 3306:3306 mysql
const dbconfig = {
  db: 'testdb',
  user: 'root',
  password: 'kissme',
  host: 'localhost',
  port: 3306,
  connectionLimit: 30,
}

module.exports = dbconfig