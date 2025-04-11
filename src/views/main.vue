<script setup>
import 'element-plus/dist/index.css'
import { ElNotification } from 'element-plus'
import { ref,onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
let islogin = ref(false)
const userInfo = reactive({
    username:'',
    avatar:'',
    role:'',
    id:''
})


import {jwtDecode} from 'jwt-decode';
import { useTokenStore } from '@/store/token'
const tokenStore = useTokenStore();
const decodejwt=()=>{
    return jwtDecode(tokenStore.token)
}


onMounted(()=>{
    //islogin.value = route.meta.isjwtexp //接受路由的forenter
    try{
        const jwtResult = decodejwt();
    Object.keys(userInfo).forEach(key =>{
        if(jwtResult[key]!== undefined){
            userInfo[key]=jwtResult[key]
        }
        islogin.value=true
    })
    }catch{
        islogin.value=false
    }
})

const isnoneDate = ref(false)
const itemList=reactive([])
const page = reactive({
    index:1,
    size:'8'
})
import { routeLoadService } from '@/api/route';


const isLoading = ref(false)//加载锁判别是否完成加载
const load=async ()=>{


  // 1. 前置检查（加锁）
  if (isLoading.value || page.index < 1) return // 确保页码合法
  isLoading.value = true
  
  try {
    let retryCount = 0
    const MAX_RETRY = 3 // 最大重试次数
    
    // 2. 明确循环终止条件
    while (retryCount < MAX_RETRY) {
      try {
        // 3. 发起请求
        const result = await routeLoadService(page)
        
        // 4. 处理响应
        if (result?.code === 200) {
          // 数据有效性检查
          if (!result.data?.length) {
            console.log('没有数据了')
            isnoneDate.value=true
            break 
          }
                     itemList.push(...result.data)
                     page.index++
          
          // 6. 成功时退出循环
          break 
        }
      } catch (error) {
        // 7. 错误处理（带指数退避重试）
        console.error(`Attempt ${retryCount + 1} failed:`, error)
        if (++retryCount >= MAX_RETRY) throw error
        await new Promise(r => setTimeout(r, 1000 * 2 ** retryCount)) // 指数退避
      } 
      //finally {
        // 8. 请求间隔控制（仅成功后延迟）
        // if (retryCount === 0) {
        //   await new Promise(r => setTimeout(r, 500)) // 正常间隔
        // }
//      } 使用elementplus自带的节流实现成功延迟
    }
  } finally {
    // 9. 安全释放锁
    isLoading.value = false
  }
}

import { useRouter } from 'vue-router'
import { userLogoff } from '@/api/user';
const router = useRouter();

const pushlogin =()=>{
    router.push("/login")
}
const pushcenter = ()=>{
    router.push({path:"/usercenter",query:{tab:'profile'}})
}
const pushFavorite = ()=>{
    router.push({path:"/usercenter",query:{tab:'favorite'}})
}

const logoff = async()=>{
    try{
        await userLogoff()
        tokenStore.removeToken()
        islogin.value=false
    }catch(error){
        ElNotification({
    title: '',
    message: error.message ? error.message : "退出失败",
    type: 'warning',
  })
    }
}

const itemroute=(itemId)=>{
    // updateFavicon(require('../../public/favicon.ico'));
    const resolved = router.resolve({name:'Detail',params:{id:itemId}})
    window.open(resolved.href,'_blank')
}


</script>

<template>
<el-container>
    <el-header class="header">
        <el-row justify="space-between" style="height: 100%;">
            <el-col :span="4" style="display: flex;align-items: center;">
                <div class="logo"></div>
                    <span style="font-size: 20px;margin-top: 10px;font-family: Inter, 'Helvetica Neue', Helvetica, 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;">你要撞大运了</span>
            </el-col>
            <el-col :span="8" >
                <div v-if="islogin" class="userinfo">
                    <span style="margin-right: 16%;">
                    {{userInfo.username}}
                    </span>
                    <div style="margin-right: 5%;margin-top: 1%;">
                        <el-dropdown>
                            <el-avatar :src="userInfo.avatar"/>

                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="pushcenter()">个人中心</el-dropdown-item>
                                    <el-dropdown-item @click="pushFavorite()">收藏夹</el-dropdown-item>
                                    <el-dropdown-item divided @click="logoff()">退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                                </template>
                        </el-dropdown>
                    </div>
                </div >
                <div v-else @click="pushlogin()" class="userinfo" style="margin-right: 100px;cursor: pointer;" >
                    登录|注册
                </div>
            </el-col>
        </el-row>
    </el-header>
    <el-main style="width: 100%;height: 85vh;display: flex;justify-content:end;margin-top: 50px;">
        <ul v-infinite-scroll="load" infinite-scroll-delay="500" class="infinite-list" style="overflow: auto">
            <li v-for="item in itemList" :key="item.id" class="infinite-list-item" @click="itemroute(item.id)">
                    <el-image fit="fill" style="height: 65%;width: 100%;display: block;border-radius: 15px;" :src="item.cover"/>
                <div class="item-text">
                    <div class="item-title">{{ item.name }}</div>
                    <div class="item-introduce">{{ item.description }}</div>
                    <div class="item-price_rating">
                        <span style="margin-left: 20px;display: flex;align-items: center;"><el-icon><Star color="orange"/></el-icon>{{ item.rating }}</span>
                        <span style="color: brown;font-size: 20px;">￥{{ item.price }}</span>
                    </div>
                </div>
            </li>
        </ul>
    </el-main>
</el-container>

</template>
<style>
html,
body {
    margin: 0;
    padding: 0;
}
</style>
<style scoped>
.el-header,
.el-main,
.el-footer {
    margin: 0;
    padding: 0;
}
.header{
    height: 7vh;
    box-shadow: 0 20px 50px 0 hsla(0, 0%, 64%, .1);
}
.logo {
    display: inline-block;
    height: 60%;
    width: 30%;
    background-image: url("/src/assets/logo.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}
.infinite-list{
    width: 90%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 100px;
    list-style: none;
    margin: 0;
    padding: 0;
}
.infinite-list .infinite-list-item{
    flex: 0 0 calc(25% - 100px);
    box-sizing: border-box;
    height: 300px;
    cursor: pointer;
}
.infinite-list-item:hover{
    border-radius: 15px;
    border-width: 1px;
    border-color: rgb(10, 175, 175);
    border-style: solid;
    
}
.item-text{
    width: 100%;
    height: 35%;
}
.item-title{
    width: 100%;
    height: 25%;
    margin-top: 10px;
    text-align: center;

    font-size: 16px;
    font-weight: 500;

}
.item-introduce{
    width: 100%;
    height: 45%;

    line-height: 1.2em;         /* 显式定义行高 */
    max-height: 2.4em;          /* 行高 1.2em × 2 行 */

    word-break: break-all;
    display: -webkit-box;             /* 旧版弹性盒 */
  -webkit-box-orient: vertical;     /* 垂直排列 */
  -webkit-line-clamp: 2;            /* 显示行数 */
  overflow: hidden;                 /* 隐藏溢出 */
}
.item-price_rating{
    height: 30%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.userinfo{
    height: 100%;
    /* width: 100%; */
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
}
/* .item-image el-image{
    
} */
</style>