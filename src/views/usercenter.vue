<script setup>
import { ref, shallowRef, markRaw ,watch} from 'vue'
import { User, Lock ,Star} from '@element-plus/icons-vue'
import Profile from './Profile.vue'
import Password from './Password.vue'
import Favorite from './Favorite.vue'
import { useTokenStore } from '@/store/token'
import { useRoute } from 'vue-router'

// 配置化菜单项
const menuItems = [
  {
    key: 'profile',
    label: '个人资料',
    icon: markRaw(User),
    component: markRaw(Profile)
  },
  {
    key: 'password',
    label: '修改密码',
    icon: markRaw(Lock),
    component: markRaw(Password)
  },
  {
    key: 'favorite',
    label: '我的收藏',
    icon: markRaw(Star),
    component: markRaw(Favorite)
  }
]
const route = useRoute()
// 响应式状态
const activeMenu = ref( route.query.tab || menuItems[0].key )
const currentComponent = shallowRef(
  menuItems.find(item => item.key === activeMenu.value)?.component || menuItems[0].component
)

// 菜单选择处理
const handleMenuSelect = (key) => {
  const target = menuItems.find(item => item.key === key)
  if (target) {
    currentComponent.value = target.component
    activeMenu.value = key
  }
}

// 监听路由参数变化，更新选中
watch(() => route.query.tab, (newVal) => {
  if(newVal) {
    activeMenu.value = newVal
    const target = menuItems.find(item => item.key === newVal)
    if (target) {
      currentComponent.value = target.component
    }
  }
})


    const islogin = ref(false)
    const tokenStore = useTokenStore()
    if(tokenStore.token.length>0){
        islogin.value=true
    }
</script>

<template>
  <div class="settings-container" v-if="islogin">
    <el-container style="height: 100vh;">
      <!-- 左侧侧边栏 -->
      <el-aside width="220px" class="left-aside">
        <el-menu
          :default-active="activeMenu"
          class="settings-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item 
            v-for="item in menuItems"
            :key="item.key"
            :index="item.key"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="right-main">
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </div>
  </template>

  
<style scoped>
.settings-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.left-aside {
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.1);
  height: 100vh;
}

.right-main {
  background-color: #fff;
  margin: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.settings-menu {
  height: 100%;
  border-right: none;
}
</style>