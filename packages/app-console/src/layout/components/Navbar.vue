<template>
  <div class="navbar">
    <div class="nav-leading">
      <div class="logo">
        <a @click="gotoSystemClient">
          <img src="../../assets/logo.png">
        </a>
      </div>
      <div class="title">{{ title }}</div>
    </div>
    <div class="sep" />
    <div class="tags-view-container">
      <tags-view v-if="!hideTags" />
    </div>
    <div class="right-menu">
      <screenfull id="screenfull" class="right-menu-item hover-effect" />
      <el-dropdown class="profile-container right-menu-item hover-effect" trigger="click">
        <div class="profile-wrapper">
          <div class="user-name">{{ name }}</div>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item divided>
            <div class="content">
              <a target="_blank" href="https://github.com/labring/laf/">
                GitHub <i class="el-icon-link" />
              </a>
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;color: red;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Screenfull from '@/components/Screenfull'
import TagsView from './TagsView'
import { openSystemClient } from '@/api'
export default {
  components: {
    Screenfull,
    TagsView
  },
  props: {
    hideTags: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'LaF 云开发'
    }
  },
  computed: {
    name() {
      const profile = this.$store.state.user.user_profile
      return profile?.username || profile?.name
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
    },
    gotoSystemClient() {
      openSystemClient()
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  display: flex;
  background: #fff;
  // border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  align-items: center;

  .nav-leading {
    width: 210px;
    min-width: 210px;
    line-height: 50px;
    justify-content: flex-start;
    display: flex;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;

    .logo {
      width: 28px;
      height: 40px;
      img {
        width: 28px;
        height: 28px;
      }
    }

    .title {
      margin-left: 4px;
      font-size: 14px;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .sep {
    height: 50px;
    border-right: 1px solid rgba(196, 196, 196, 0.15);
  }

  .tags-view-container {
    width: 100%;
  }

  .right-menu {
    float: right;
    height: 100%;
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
      font-size: 14px;
    }

    .profile-container {
      margin-right: 20px;
      .profile-wrapper {
        display: flex;

        .user-name {
          cursor: pointer;
          font-size: 16px;
          white-space: nowrap;
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
