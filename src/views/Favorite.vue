<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { deleteUserFavorites, getUserFavoritesByPage } from '../api/user'

// 定义收藏项数据类型
interface FavoriteItem {
  id: number,
  category: string,
  name: string // 内容名称
}

// 响应式数据
const favorites = ref<FavoriteItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const router = useRouter()

// 请求收藏夹数据的方法（示例代码，不实现实际请求）
const fetchFavorites = async () => {
  try {
    // 模拟网络请求
    // 实际应调用后端接口，例如：const response = await request.get(...)
    const page = {
        current: currentPage.value,
        size: pageSize.value
    }
    const result = await getUserFavoritesByPage(page)
    favorites.value = result.data?.favorites // 假设返回的数据格式符合 FavoriteItem[]
    total.value = result.data?.total // 假设返回的数据格式符合总数
  } catch (error) {
    // 网络异常处理
    ElMessage.error('加载收藏夹数据失败，请检查网络或稍后再试')
  }
}

// 处理页码变化
const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchFavorites()
}

// 点击跳转按钮的处理
const handleJump = (item: FavoriteItem) => {
  // 示例跳转到详情页，传递 id 参数
  const resolved = router.resolve({name:'Detail',params:{id:item.id}})
  window.open(resolved.href,'_blank')
}

// 删除按钮处理函数，调用后端接口删除收藏（具体实现留空）
const handleDelete = async (item: FavoriteItem) => {
  try {
    // 示例：调用后端删除收藏接口
    // await request.post('/user/deleteFavorite', { id: item.id })
    // 模拟接口调用成功，此处留空不实现实际请求
    await deleteUserFavorites(item.id)
    ElMessage.success('删除收藏成功')
    await fetchFavorites()
  } catch (error) {
    // 捕获网络或其他异常
    ElMessage.error('删除收藏失败，请检查网络或稍后重试')
  }
}

onMounted(() => {
  fetchFavorites()
})
</script>

<template>
  <div class="favorite-page">
    <el-table :data="favorites" border style="width: 100%">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="category" label="类型" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleJump(scope.row)">跳转</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" style="margin-left: 10px;">删除收藏</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px; text-align: right;">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange">
      </el-pagination>
    </div>
  </div>
</template>

<style scoped>
.favorite-page {
  padding: 20px;
  background-color: #fff;
}
</style>