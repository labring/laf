module.exports = {
  apps: {
    script: 'dist/index.js',
    name: 'laf-devops',
    interpreter_args: '--max_old_space_size=256',
    watch: './dist'
  }
};
