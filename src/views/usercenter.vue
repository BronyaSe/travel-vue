<script setup lang="ts">
import { computed, ref, shallowRef, markRaw, watch } from 'vue'
import { User, Lock, Star, Setting } from '@element-plus/icons-vue'
import Profile from './Profile.vue'
import Password from './Password.vue'
import Favorite from './Favorite.vue'
import EditDetail from './EditDetail.vue' // 管理员专用页面
import { useTokenStore } from '../store/token'
import { useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode';


// 定义菜单项类型
interface MenuItem {
  key: string,
  label: string,
  icon: any,
  component: any
}

const tokenStore = useTokenStore()

// 根据token解析角色信息（假定token中含有role字段）
const userRole = computed(() => {
  if (!tokenStore.token) return null
  try {
    const decoded: any = jwtDecode(tokenStore.token)
    return decoded.role
  } catch (error) {
    return null
  }
})

// 定义普通用户的菜单
const baseMenu: MenuItem[] = [
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

// 定义管理员额外菜单项
const adminExtraMenu: MenuItem[] = [
  {
    key: 'EditDetail',
    label: '管理项目',
    icon: markRaw(Setting),
    component: markRaw(EditDetail)
  }
]

// 根据解析角色动态生成菜单项
const menuItems = computed<MenuItem[]>(() => {
  if (userRole.value === 'ADMIN') {
    return [...baseMenu, ...adminExtraMenu]
  } else {
    return baseMenu
  }
})

const route = useRoute()
const activeMenu = ref( route.query.tab || menuItems.value[0].key )
const currentComponent = shallowRef(
  menuItems.value.find(item => item.key === activeMenu.value)?.component || menuItems.value[0].component
)

// 菜单选择处理
const handleMenuSelect = (key: string) => {
  const target = menuItems.value.find(item => item.key === key)
  if (target) {
    currentComponent.value = target.component
    activeMenu.value = key
  }
}

// 监听路由参数变化，更新选中
watch(() => route.query.tab, (newVal) => {
  if(newVal) {
    activeMenu.value = newVal as string
    const target = menuItems.value.find(item => item.key === newVal)
    if (target) {
      currentComponent.value = target.component
    }
  }
})

const islogin = ref(false)
if(tokenStore.token && tokenStore.token.length>0){
    islogin.value = true
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