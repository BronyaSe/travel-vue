import { createRouter,createWebHistory } from "vue-router";

import loginVue from '@/views/login.vue'
import mainVue from '@/views/main.vue'
import RouteDetailVue from "./views/RouteDetail.vue";
import usercenterVue from '@/views/usercenter.vue'
const routes =[
    {path:'/login',name:'Login',component:loginVue,meta:{title:"登录"}},
    {path:'/',name:'Main',component:mainVue,meta:{title:"主页"}},
    {path:'/route/detail/:id',name:'Detail',meta:{title:"无标题"},component:RouteDetailVue},
    {path:'/usercenter',name:'userinfo',meta:{title:'用户中心'},component:usercenterVue}
    ]
    //,beforeEnter: (to, from, next) => {

    //    to.meta.isjwtexp = true;
    //    next()
    //}

//路由规则



const router = createRouter({
    history: createWebHistory(),
    routes // ES6简写，等同于 routes: routes
  });
  router.beforeEach((to,from,next) => {
    document.title = to.meta.title;
    next()
  });
  export default router; // 导出实例而非函数