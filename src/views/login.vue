<script setup>
import 'element-plus/dist/index.css'
import { ElNotification } from 'element-plus'
import { reactive, ref, computed, onBeforeUnmount,h } from 'vue'

const islogin = ref(true)
const user = reactive({
    username: '',
    password: '',
    email: '' ,
    verifycode:''
})




const countdown = ref(0)
const timer = ref(null)

const isCounting = computed(() => countdown.value > 0)  //computed声明式响应式依赖计算 当其中计算的所需要的变量发生变化时 会执行该段代码重新计算结果
const buttonText = computed(() => {
    return isCounting.value ? `${countdown.value}秒后重新获取` : '获取验证码'
})

onBeforeUnmount(() => {
    if (timer.value) clearInterval(timer.value)
})

const startCountdown = (seconds = 60) => {    //开启计时器
    countdown.value = seconds
    timer.value = setInterval(() => {
        countdown.value -= 1
        if (countdown.value <= 0) {
            clearInterval(timer.value)
            timer.value = null
        }
    }, 1000)
}


const rules = {
    username: [{ message: '请输入用户名', trigger: 'blur' ,required:true}, { min: 5, max: 16, message: '长度为5-16字符', trigger: 'blur' }],
    password: [{ message: '请输入密码', trigger: 'blur' ,required:true}, { min: 8, max: 15, message: '长度为8-15字符', trigger: 'blur' }],
    email: [{ type: 'email', trigger: 'blur', message: '请输入邮箱' ,required:true}],
    verifycode: [{type:'number', message: '请输入验证码',trigger: 'blur',required:true }],
}


    // 获取表单实例的引用
    const regform = ref(null)
//注册功能
import { userRegService, userSendCodeService,userLoginservice } from '@/api/user.js'
const register = () => {
    console.log()
    regform.value.validate(async (valid) => {
        if (!valid) {
            ElNotification({
    title: '',
    message: "缺少必填项",
    type: 'warning',
  })
          return;  // 表单校验未通过时，终止后续操作
        }
    const result = await userRegService(user)
    if (result.code === 200) {
        ElNotification({
    title: '',
    message: '注册成功',
    type: 'success',
  })
    } else {
        ElNotification({
    title: '',
    message: result.message ? result.message : "注册失败",
    type: 'warning',
  })
    }
    })
}
//发送验证码
const sendcode = () => {

    regform.value.validateField('email',async (vaild)=>{
        if(!vaild){
            ElNotification({
    title: '',
    message: "请输入邮箱",
    type: 'warning',
  })
            return;
        }
        startCountdown()
    const result = await userSendCodeService(user)
    if(result.code===200){
        ElNotification({
    title: '',
    message: '验证码已发送！',
    type: 'success',
  })
    }
    })
}

import { useTokenStore } from '@/store/token'
import { useRouter } from 'vue-router'
const tokenStore = useTokenStore()
const router = useRouter()

const validateMultipleFields = (fields) => {
  const promises = fields.map(field => {
    return new Promise((resolve, reject) => {
      regform.value.validateField(field, (valid) => {
        if (valid) {
          resolve();
        } else {
          reject(`${field} 校验未通过`);
        }
      });
    });
  });
  return Promise.all(promises)
};

//登录

const login = () =>{
    validateMultipleFields(['email','password']).then(
        async res=>{
            const result = await userLoginservice(user)
    if(result.code===200){
    tokenStore.setToken(result.data)
        ElNotification({
    title: '',
    message: '登录成功',
    type: 'success',
  })
    
    router.push("/")
    } else {
        ElNotification({
    title: '',
    message: result.message ? result.message : "登录失败",
    type: 'warning',
  })
    }
        }
    ).catch(
        error=>{
            console.log('字段验证失败:', error)
        }
    )


}

</script>
<template>
    <el-container class="layout-container">
        <el-aside width="20%">
            <div class="login_aside_img">
            </div>
        </el-aside>
        <el-container width="80%">
            <el-header class="login_header">
                <div class="left_logo">
                    <div class="logo"></div>
                    <span style="display: flex;align-items: center;font-size: 30px;font-family: Inter, 'Helvetica Neue', Helvetica, 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;">云途旅程</span>
                </div>

                <div class="right_more">

                </div>
            </el-header>
            <el-main>
                <div class="main_form">
                    <div class="sw_log_reg">
                        <span @click="islogin = true" :class="[islogin ? 'chose' : 'nonechose']"
                            style="margin-left: 10%;cursor: pointer;">登录</span>
                        <span @click="islogin = false" :class="[islogin == false ? 'chose' : 'nonechose']"
                            style="margin-left: 8%;cursor: pointer;">注册</span>
                    </div>
                    <el-form :rules="rules" ref="regform" hide-required-asterisk="true" v-if="islogin" class="form" :model="user">
                        <el-form-item prop="email" label="邮箱" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px">
                            <el-input size="large" style="width: 70%;margin-left: 5%;margin-top: 2%;"
                                v-model="user.email" />
                        </el-form-item>
                        <el-form-item prop="password" label="密码" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px;">
                            <el-input type="password" size="large" style="width: 70%;margin-left: 5%;margin-top: 2%;"
                                v-model="user.password" />
                        </el-form-item>
                        <el-form-item style="margin-top: 17%;" size="large">
                            <el-button @click="login()" type="primary" style="margin: 0 40%;">
                                登录
                            </el-button>
                        </el-form-item>
                    </el-form>
                    <el-form :rules="rules" hide-required-asterisk="true" ref="regform" v-else class="form" :model="user" style="margin-top: 6%;height: 80%;">
                        <el-form-item prop="username" label="用户名" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px">
                            <el-input size="large" style="width: 70%;margin-left: 5%;margin-top: 2%;"
                                v-model="user.username" />
                        </el-form-item>
                        <el-form-item type="text" prop="email" label="邮箱" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px">
                            <el-input size="large" style="width: 70%;margin-left: 5%;margin-top: 2%;"
                                v-model="user.email" />
                        </el-form-item>
                        <el-form-item prop="password" label="密码" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px;">
                            <el-input type="password" size="large" style="width: 70%;margin-left: 5%;margin-top: 2%;"
                                v-model="user.password" />
                        </el-form-item>
                        <el-form-item prop="verifycode" label="验证码" label-position="top"
                            style="margin-left: 10%;--el-form-label-font-size: 17px">
                            <el-input type="text" size="large" style="width: 40%;margin-left: 5%;margin-top: 2%;"
                                v-model.number="user.verifycode" />
                            <el-button type="success" round size="large" style="margin:2% 0 0 5%;"
                                :disabled="isCounting" @click="sendcode()">
                                {{ buttonText }}
                            </el-button>
                        </el-form-item>
                        <el-form-item style="margin-top: 5%;" size="large">
                            <el-button type="primary" style="margin: 0 40%;" @click="register()">
                                注册
                            </el-button>
                        </el-form-item>
                    </el-form>
                    <div v-if="islogin" style="margin:30px 0 0 35px;">
                        <span class="forget_password">忘记密码</span>
                    </div>
                </div>
            </el-main>
            <el-footer>
                
            </el-footer>
        </el-container>
    </el-container>
</template>
<style>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>
<style scoped>
.layout-container {
    height: 100vh;
    overflow: hidden;
}

.el-header,
.el-main,
.el-footer {
    margin: 0;
    padding: 0 0 0 5%;
}

.login_aside_img {
    width: 100%;
    height: 100%;
    background-image: url("/src/assets/login.png");
    background-size: cover;
    background-position: center 20%;
}

.login_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10%;
}

.login_header div {
    height: 80%;
}

.left_logo {
    width: 40%;
    display: flex;
    align-items: center;
    gap: 20px;
}

.logo {
    background-image: url("/src/assets/logo.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    width: 25%;
}

.main_form {
    height: 70%;
    margin: 10% auto 0 25%;
    width: 35%;
    box-shadow: 0 20px 50px 0 hsla(0, 0%, 64%, .1);
    border-radius: 4px;
}

.sw_log_reg {
    display: flex;
    height: 10%;
}

.sw_log_reg span {
    display: flex;
    align-items: center;
}

.chose {
    color: black;
    text-decoration-line: underline;
    text-decoration-color: aqua;
    text-underline-offset: 0.5em;
    font-size: 25px;
}

.nonechose {
    color: gray;
    font-size: 20px;
}

.form {
    height: 60%;
    margin-top: 12%;
}

.forget_password:hover {
    cursor: pointer;
    color: rgb(57, 57, 225);
    font-weight: bold;
}
</style>