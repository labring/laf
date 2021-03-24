# 读数据
ab -n 1000 -c 100 -p ./db_read.json -T application/json -H "Authorization: Bearer eyJ1aWQiOiI2MDU1YTJhYWYyODhhNzQyNjEyNjA1MmYiLCJ0eXBlIjoiYWRtaW4iLCJleHBpcmUiOjE2MTcxNTY1MjY0MDJ9.a2ef2628165b3071a1694151111ca921" http://localhost:8080/admin/entry


# 云函数调用
ab -n 1000 -c 100 -p ./empty.json -T application/json -H "Authorization: Bearer eyJ1aWQiOiI2MDU1YTJhYWYyODhhNzQyNjEyNjA1MmYiLCJ0eXBlIjoiYWRtaW4iLCJleHBpcmUiOjE2MTcxNTY1MjY0MDJ9.a2ef2628165b3071a1694151111ca921" http://localhost:8080/admin//func/invoke/hello
