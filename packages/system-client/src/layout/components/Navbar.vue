<template>
  <div class="navbar">
    <div class="logo">LaF 开发控制台</div>
    <div class="tags-view-container">
      <tags-view v-if="needTagsView" />
    </div>
    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>
      <div class="github right-menu-item">
        <a target="_blank" href="https://github.com/Maslow/laf/">
          Github
        </a>
      </div>
      <el-dropdown class="profile-container right-menu-item hover-effect" trigger="click">
        <div class="profile-wrapper">
          <div class="user-name">Maslow</div>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">

          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Screenfull from '@/components/Screenfull'
import TagsView from './TagsView'
export default {
  components: {
    Screenfull,
    TagsView
  },
  computed: {
    ...mapGetters([
      'name',
      'device'
    ]),
    ...mapState({
      needTagsView: state => state.settings.tagsView
    })
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  display: flex;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);

  .logo {
    min-width: 180px;
    width: 180px;
    line-height: 50px;
    text-align: center;
  }

  .tags-view-container {
    width: 100%;
  }

  .right-menu {
    float: right;
    height: 100%;
    width: 200px;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 16px;
      color: #5a5e66;
      vertical-align: text-bottom;
      align-self: center;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .github {
      font-size: 16px;
    }

    .profile-container {
      margin-right: 20px;
      .profile-wrapper {
        display: flex;

        .user-name {
          cursor: pointer;
          font-size: 16px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          font-size: 12px;
          align-self: center;
        }
      }
    }
  }
}
</style>
