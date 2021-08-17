module.exports = {
  apps: {
    script: 'dist/index.js',
    name: 'app_server',
    interpreter_args: '--max_old_space_size=256',
    watch: './dist',
    // max_memory_restart: '256M'
  }
};
