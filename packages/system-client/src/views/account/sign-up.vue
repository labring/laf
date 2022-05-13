<template>
  <div class="signup-container">
    <el-form
      ref="signupForm"
      :model="signupForm"
      :rules="loginRules"
      class="signup-form"
      label-position="top"
    >
      <div class="title-container">
        <h3 class="title">LaF 云开发账户注册</h3>
      </div>

      <el-form-item prop="username" label="用户名">
        <el-input
          ref="username"
          v-model="signupForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="off"
        />
      </el-form-item>

      <el-form-item prop="name" label="姓名">
        <el-input
          ref="name"
          v-model="signupForm.name"
          placeholder="姓名"
          name="name"
          type="text"
          tabindex="2"
        />
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input
          ref="password"
          v-model="signupForm.password"
          type="password"
          placeholder="登录密码"
          name="password"
          tabindex="3"
        />
      </el-form-item>
      <el-form-item prop="confirm_password" label="确认密码">
        <el-input
          ref="confirm_password"
          v-model="signupForm.confirm_password"
          type="password"
          placeholder="确认密码"
          name="confirm_password"
          tabindex="4"
        />
      </el-form-item>
      <el-button
        :loading="loading"
        plain
        type="success"
        style="width:100%;margin-top: 30px;"
        @click="handleSignUp"
      >注册</el-button>
    </el-form>

  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { signup } from '@/api/user'

export default {
  name: 'SignUp',
  components: { },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 8) {
        callback(new Error('密码长度不得少于8位'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.signupForm.password) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }

    return {
      signupForm: {
        username: '',
        password: '',
        confirm_password: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        name: [
          { required: true, trigger: 'blur', message: '姓名不可为空' }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        confirm_password: [
          { required: true, trigger: 'blur', validator: validateConfirmPassword }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  mounted() {
    if (this.signupForm.username === '') {
      this.$refs.username.focus()
    } else if (this.signupForm.password === '') {
      this.$refs.password.focus()
    }
  },

  methods: {
    handleSignUp() {
      if (this.signupForm.password !== this.signupForm.confirm_password) {
        return this.$message.error('两次密码不一致')
      }

      this.$refs.signupForm.validate(async valid => {
        if (!valid) {
          console.log('error submit!!')
          return this.$message.error('请输入正确的账户密码')
        }

        this.loading = true
        const res = await signup(this.signupForm)
          .finally(() => { this.loading = false })
        if (res.error) {
          return this.$message.error(res.error)
        }
        this.$router.push({
          path: this.redirect || '/',
          query: this.otherQuery
        })
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.signup-container {
  .signup-form {
    width: 500px;
    margin: 0 auto;

    .title-container {
      text-align: center;
      margin-top: 100px;
      margin-bottom: 50px;
    }
  }
}
</style>
