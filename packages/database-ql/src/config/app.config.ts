export default {
  db_doc_size_limit: 512 * 1024, // 512 KB: Max document size in database. Used in add & update
  db_realtime_ping_interval: 15 * 1000,
  db_realtime_pong_wait_timeout: 15 * 1000,
  // upload_max_file_size: 20 * 1024 * 1024, // 20 MB: Max file size for upload
  // get_temp_file_url_max_requests: 50, // 20: Max number of file IDs in one single getTempFileURL request
  // call_function_poll_max_retry: 10, // polling for slow callFunction retries at most 10 times
  // call_function_max_req_data_size: 5 * 1024 * 1024, // 5 MB
  // call_function_client_poll_timeout: 15 * 1000, // client-side one-time polling timeout
  // call_function_valid_start_retry_gap: 60 * 1000 // if poll request is sent <60s> after the initial call, meaningless
}
