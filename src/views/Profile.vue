<template>
    <div class="profile-form">
      <h2 class="form-title">个人资料</h2>
      <el-form :model="form" label-width="100px" label-position="top">
        <!-- 表单字段 -->
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
  
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
  
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
  
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" >保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  
  const form = ref({
    username: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    gender: 'male',
    avatar: 'https://nas.bronyahan.top:30036/public/Project/avatar/default.png' // 默认头像
  })
  
  
  </script>
  
  <style>
  
  .el-form-item {
    margin-bottom: 22px;
  }
  .el-form-item .el-input{
    width: 20%;
  }
  
  .el-select {
    width: 5%;
  }
  </style>