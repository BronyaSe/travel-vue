<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted,reactive,ref } from 'vue';
import { getRouteByIdService,getratingcountByIdService, routecommentLoadService } from '@/api/route';
import { useTokenStore } from '@/store/token';
import dayjs from 'dayjs'
const route = useRoute()

//const id = route.params.id;
let item = reactive({
  id:0,
  cover:'',
  category:'',
  createdAt:'',
  description:'',
  detailPic:[],
  duration:0,
  name:'',
  price:0,
  rating:0,
  updateTime:''
})

item.id = route.params?.id // 获取路由参数
const rating_count = ref(0);

const page = reactive({
    index:1,
    size:'3',
    routeid:item.id
})
const commentist=reactive([])
const isLoading = ref(false)//加载锁判别是否完成加载
const isnoneDate = ref(false)

const commentistIsEmpty = computed(()=>commentist.length===0)

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
      const result = await routecommentLoadService(page)
      // 4. 处理响应
      if (result?.code === 200) {
        // 数据有效性检查
        if (!result.data?.length) {
          console.log('没有数据了')
          isnoneDate.value=true
          break 
        }
                      commentist.push(...result.data)
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


const loadData = async () => {
      try {
        const ratingcount = await getratingcountByIdService(item.id)
        rating_count.value = ratingcount.data
        const response =await getRouteByIdService(item.id)
        Object.assign(item,response.data)
        // 动态设置页面标题
        document.title = item?.name + ' - 详情页' || '默认标题'
      } catch (error) {
        console.error('数据加载失败:', error)
        document.title = '加载失败'
      }
    }

onMounted(() => {
  loadData()
})

</script>

<template>
  <div class="tour-detail-container">
    <!-- 图片轮播 -->
    <el-carousel :interval="5000" height="400px" indicator-position="outside">
      <el-carousel-item>
      <img :src="item?.cover" class="carousel-image" alt="旅游图片"/>
    </el-carousel-item>
      <el-carousel-item v-for="(image, index) in item?.detailPic" :key="index">
        <img :src="image" class="carousel-image" alt="旅游图片"/>
      </el-carousel-item>
    </el-carousel>

    <!-- 详细信息展示 -->
    <el-row :gutter="30" class="detail-section">
      <el-col :md="16" :sm="24">
        <h1 class="tour-title">{{ item.name }}</h1>
        <!-- 评分系统 -->
        <div class="rating-section">
          <el-rate  disabled v-model="item.rating" allow-half show-score text-color="#ff9900" score-template="{value} 分"/>
          <span class="rating-count">({{ rating_count }}人评分)</span>
        </div>
        <div class="price-section">
          <span class="price-label">价格：</span>
          <span class="price">¥{{ item?.price }}</span>
        </div>
        <div class="description-section">
          <h3>行程介绍</h3>
          <p>{{ item.description }}</p>
        </div>
        <div v-infinite-scroll="load" style="overflow: auto;height: 90vh;">
          <h3>评论详情</h3>
          <div v-for="comment in commentist" :key="comment.id" v-if="!commentistIsEmpty">
            <div style="display: flex;align-items: center;padding-top: 5%;">
              <el-avatar :size="50" :src="comment.avatar" /><span style="height: auto;">{{ comment.username }}</span>
            </div>
            <div style="margin-left: 8%;">{{ comment.content }}</div>
            <div style="display: flex;align-items:end; justify-content: space-between;">
            <el-rate style="margin-left: 7%;" disabled v-model="comment.rating" allow-half show-score text-color="#ff9900" score-template="{value} 分"/>
            <h style="font-size: 12px;color: gray;line-height: auto">{{ dayjs(comment.createdAt).format('YYYY年MM月DD日') }}</h>
            </div>
            <el-divider/>
          </div>
          <div v-else style="margin-left: 30%;margin-top: 10%;color: gray;">
            暂无更多评论......
          </div>
        </div>
      </el-col>
      <el-col :md="8" :sm="24">
        <div class="info-card">
          <h3>基本信息</h3>
          <el-divider/>
          <div class="info-item">
            <span class="label">行程类型：</span>
            <span class="value">{{ item.category }}</span>
          </div>
          <div class="info-item">
            <span class="label">行程天数：</span>
            <span class="value">{{ item.duration }}天</span>
          </div>
          <!-- <div class="info-item">
            <span class="label">行程日期：</span>
          </div> -->
          <el-button style="margin-left: 30%;" type="primary" size="large" round>我要订购</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>


<style>

</style>


<style scoped>



.tour-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-section {
  margin-top: 30px;
}
.tour-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}
.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.rating-count {
  color: #666;
  margin-left: 15px;
}
.price-section {
  margin-bottom: 25px;
}
.price-label {
  font-size: 16px;
  color: #666;
}
.price {
  font-size: 24px;
  color: #ff4444;
  font-weight: bold;
}
.description-section {
  line-height: 1.8;
  color: #666;
}
.info-card {
  position: sticky;
  top: 0; /* 触发固定的位置 */
  z-index: 100;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.info-item {
  margin: 15px 0;
}
.label {
  color: #888;
  margin-right: 10px;
}
.value {
  color: #333;
}
ul {
  padding-left: 20px;
  margin: 10px 0;
}
li {
  line-height: 1.6;
  color: #666;
}
.comment-infinite-list{
  height: 30vh;
}
</style>