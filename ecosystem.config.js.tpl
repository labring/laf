module.exports = {
  apps: {
    script: 'dist/index.js',
    name: 'less',
    interpreter_args: '--experimental-vm-modules',
    watch: './dist',
    // max_memory_restart: '256M'
  }
};
