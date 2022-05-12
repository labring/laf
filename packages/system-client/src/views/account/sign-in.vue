<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">LaF 云开发账户登录</h3>
      </div>

      <el-form-item prop="username" label="用户名">
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip
        v-model="capsTooltip"
        content="大写打开"
        placement="right"
        manual
      >
        <el-form-item prop="password" label="密码">
          <el-input
            ref="password"
            v-model="loginForm.password"
            type="password"
            placeholder="登录密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
      </el-tooltip>

      <div class="btn-row">
        <el-button
          :loading="loading"
          type="success"
          plain
          style="width:80%;font-weight: bold;"
          @click.native.prevent="handleLogin"
        >登录</el-button>

        <el-button
          type="text"
          style="width:20%;font-weight: bold;text-align: right;"
          @click="toSignUp"
        >去注册？</el-button>
      </div>
    </el-form>

  </div>
</template>

<script>

export default {
  name: 'SignIn',
  components: { },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入用户名' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' }
        ]
      },
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && key >= 'A' && key <= 'Z'
    },
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('请输入正确的账户密码')
        }

        this.loading = true
        try {
          await this.$store.dispatch('user/login', this.loginForm)

          this.$router.push({
            path: this.redirect || '/',
            query: this.otherQuery
          })
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      })
    },
    toSignUp() {
      this.$router.push({
        path: '/sign-up'
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
 .login-form {
    width: 500px;
    margin: 0 auto;

    .title-container {
      text-align: center;
      margin-top: 100px;
      margin-bottom: 50px;
    }

    .btn-row {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
