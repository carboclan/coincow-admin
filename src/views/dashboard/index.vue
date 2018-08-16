<template>
  <div class="dashboard-container">
    <div class="dashboard-text">Username: {{name}}</div>
    <div class="dashboard-text">Roles: <el-tag v-for='role in roles' :key='role'>{{role}}</el-tag></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'dashboard',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 14px;
    line-height: 46px;
  }
}
</style>
