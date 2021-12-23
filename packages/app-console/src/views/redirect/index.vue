<script>
import { openSystemClient } from '@/api'
export default {
  created() {
    const { params, query } = this.$route
    const { path } = params

    console.log(path)
    if (!path || path === '/') {
      return openSystemClient()
    }
    this.$router.replace({ path: '/' + path, query })
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
