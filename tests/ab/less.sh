# 读数据
ab -n 10000 -c 100 -p ./db_read.json -T application/json -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDg1MzhkMjhlMWI0MTM2YjEyMzIyZjIiLCJ0eXBlIjoiYWRtaW4iLCJleHAiOjE2Mjc1NTEyNzksImlhdCI6MTYyNjk0NjQ3OX0.BFJPeJYb9-tifpKWKW2C0ipWSwy9pEFvrORqrIbNh9s" http://localhost:8080/admin/entry


# 云函数调用
ab -n 1000 -c 100 -p ./empty.json -T application/json -H "Authorization: Bearer eyJ1aWQiOiI2MDU1YTJhYWYyODhhNzQyNjEyNjA1MmYiLCJ0eXBlIjoiYWRtaW4iLCJleHBpcmUiOjE2MTcxNTY1MjY0MDJ9.a2ef2628165b3071a1694151111ca921" http://localhost:8080/admin//func/invoke/hello


ab -n 1000 -c 100 -p ./empty.json -T application/json  http://localhost:8000/prod-api/func/invoke/user-passwd-login
