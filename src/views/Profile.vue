<template>
    <div class="profile-form">
      <h2 class="form-title">个人资料</h2>
      <el-form :model="formData" label-width="100px" label-position="top">

              <!-- 头像上传 -->
      <el-form-item label="头像">
        <div class="avatar-uploader">
          <div class="avatar-preview" @click="triggerAvatarUpload">
            <img :src="avatarPreview" class="preview-image"/>
            <div class="upload-mask">

            </div>
          </div>
          <input
            type="file"
            ref="avatarInput"
            accept="image/*"
            @change="handleAvatarSelect"
            hidden
          />
          <div v-if="hasAvatarChanged" class="avatar-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>头像已修改，请保存变更</span>
          </div>
        </div>
      </el-form-item>

        <!-- 表单字段 -->
        <el-form-item label="用户名">
          <el-input v-model="formData.username" />
        </el-form-item>
  
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
  
        <el-form-item label="电话">
          <el-input v-model="formData.phoneNumber" />
        </el-form-item>
  
        <el-form-item label="性别">
          <el-select v-model="formData.gender" placeholder="请选择性别">
            <el-option label="男" value="Male" />
            <el-option label="女" value="Female" />
            <el-option label="其他" value="Other" />
          </el-select>
        </el-form-item>
  
        <el-form-item>
          <el-button @click="handleSubmit" type="primary" >保存修改</el-button>
          <el-button style="margin-left: 100px;" @click="handleReset">重置修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  

  
 interface formDate{
  id: number,
  username: string,
  email: string,
  phoneNumber:string,
  gender:string,
  avatar:string
 }

//  const formData = ref<formDate>({
//   id:0,
//   username: '',
//   email:'',
//   phone:'',
//   gender:'',
//   avatar:''
//  })

 interface jwtPayload{
  id: number,
  username: string,
  role: string,
  avatar : string
 }



import {jwtDecode} from 'jwt-decode';
import { useTokenStore } from '../store/token'
import { getUserService, userUpdateInfo } from '../api/user'
const tokenStore = useTokenStore();
const tokenpayload:jwtPayload = jwtDecode<jwtPayload>(tokenStore.token)
const formData = ref<formDate>({
  id: 0,
  username: '',
  email: '',
  phoneNumber: '',
  gender: '',
  avatar: ''
})

const fetchUserData = async () => {
  const result = await getUserService(tokenpayload.id)
  formData.value = result.data
  originalAvatar.value = result.data.avatar
  Object.assign(originalform, result.data)
}

fetchUserData()

// 头像相关状态
const avatarInput = ref<HTMLInputElement | null>(null)
const originalAvatar = ref('')
const tempAvatarFile = ref<File | null>(null)

//表单初始信息
const originalform=reactive<formDate>({
  id: 0, username: '',
  email: '',
  phoneNumber: '',
  gender: '',
  avatar: ''
})

// 计算属性
const avatarPreview = computed(() => {
  return tempAvatarFile.value 
    ? URL.createObjectURL(tempAvatarFile.value)
    : formData.value.avatar
})

const hasAvatarChanged = computed(() => {
  return tempAvatarFile.value !== null
})

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像选择
const handleAvatarSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

    // 创建图片对象
    const image = new Image();
  const reader = new FileReader();

  reader.onload = () => {
    image.src = reader.result as string;
  };

  reader.onloadend = async () => {
    // 等待图片加载完成
    image.onload = () => {
      // 创建 canvas 元素
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        ElMessage.error("图片处理失败");
        return;
      }

      // 设置 canvas 尺寸为 180x180
      canvas.width = 180;
      canvas.height = 180;

      // 计算裁剪区域
      const size = Math.min(image.width, image.height); // 取最小边
      const offsetX = (image.width - size) / 2; // 水平居中
      const offsetY = (image.height - size) / 2; // 垂直居中

      // 绘制裁剪后的图片到 canvas
      ctx.drawImage(image, offsetX, offsetY, size, size, 0, 0, 180, 180);

      // 将 canvas 转换为 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          // 将裁剪后的图片作为文件存储
          tempAvatarFile.value = new File([blob], file.name, { type: file.type });
        }
      }, file.type);
    };
  };

  reader.readAsDataURL(file);
  
  // tempAvatarFile.value = file
}

// 提交处理
const handleSubmit = async () => {
  try {
    const updateResult = await userUpdateInfo(formData.value,tempAvatarFile.value)
    if (tempAvatarFile.value) {
    URL.revokeObjectURL(avatarPreview.value)
    tempAvatarFile.value = null
  }
    console.log(updateResult)  
    tokenStore.setToken(updateResult.data)
    if (avatarInput.value) avatarInput.value.value = ''
    ElMessage.success('资料更新成功')
    const inforesult = await getUserService(tokenpayload.id)
    formData.value = inforesult.data
  } catch (err) {
    ElMessage.error('更新失败')
  }
}

// 重置处理
const handleReset = () => {
  if (tempAvatarFile.value) {
    URL.revokeObjectURL(avatarPreview.value)
    tempAvatarFile.value = null
  }
  Object.assign(formData.value, originalform)

  if (avatarInput.value) avatarInput.value.value = ''
}


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


  .avatar-preview {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  
  /* 新增居中代码 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa; /* 添加背景色避免透明区域显示异常 */
}

.preview-image {
  /* 关键样式 */
  object-fit: contain; /* 修改为contain保持完整比例 */
  max-width: 100%;
  max-height: 100%;
  
  /* 可选动画效果 */
  transition: transform 0.3s ease;
}

/* 悬停放大效果（可选） */
.avatar-preview:hover .preview-image {
  transform: scale(1.05);
}
  </style>