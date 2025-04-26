<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getRouteByPage, updateRouteInfo, deleteByUrl } from '../api/admin'
import { getRouteByIdService } from '../api/route';
import { ElMessageBox } from 'element-plus'

// 定义路由详情数据接口
interface RouteItem {
  id: number;
  name: string;
  cover: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  detailPic: string[];
}

// 搜索关键字（按路线名称搜索）
const searchText = ref('')

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(6)
const hasMore = ref(true)

// 存储加载的路线详情数据（累积追加）
const routeList = ref<RouteItem[]>([])

// 调用后端分页查询接口（懒加载方式，每次加载后追加数据）
const fetchRoutes = async () => {
  const params = {
    index: currentPage.value,
    size: pageSize.value,
    search: searchText.value === '' ? null : searchText.value
  }
  const result = await getRouteByPage(params)
  const res = result.data
  if (res.length < pageSize.value) {
    hasMore.value = false
  }
  routeList.value = routeList.value.concat(res)
}
const loadMore = () => {
  currentPage.value += 1
  fetchRoutes()
}
const handleSearch = () => {
  currentPage.value = 1
  routeList.value = []
  hasMore.value = true
  fetchRoutes()
}

// 控制修改对话框显示
const editDialogVisible = ref(false)

// 当前编辑的路线详情数据（用于表单绑定）
let currentRoute = reactive<RouteItem>({
  id: 0,
  name: '',
  cover: '',
  category: '',
  description: '',
  price: 0,
  duration: 0,
  detailPic: []
})

// ---------- 新增部分：封面图上传 ----------
const coverInput = ref<HTMLInputElement | null>(null)
const tempCoverFile = ref<File | null>(null)
const coverPreview = computed(() => {
  // 若上传了新封面，则预览新文件；否则显示原来的封面链接
  return tempCoverFile.value ? URL.createObjectURL(tempCoverFile.value) : currentRoute.cover
})
const triggerCoverUpload = () => {
  coverInput.value?.click()
}
const handleCoverSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files ? input.files[0] : null
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件')
    return
  }
  // 可加入其他处理（如压缩、裁剪等）
  tempCoverFile.value = file
}

// ---------- 新增部分：详情图上传（多选） ----------
const detailInput = ref<HTMLInputElement | null>(null)
const detailFiles = ref<File[]>([])
const detailPreviews = ref<string[]>([])
const triggerDetailUpload = () => {
  detailInput.value?.click()
}
const handleDetailSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  // 多文件上传，全部存入 detailFiles 和生成预览图链接
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i]
    if (!file.type.startsWith('image/')) continue
    detailFiles.value.push(file)
    detailPreviews.value.push(URL.createObjectURL(file))
  }
}

// 删除某个详情图片（根据数组索引删除）
const removeDetailImage = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      '确定删除这张详情图片吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 计算原始服务器图片数量（即 currentRoute.detailPic 的长度）
    const originalCount = currentRoute.detailPic.length;

    if (index < originalCount) {
      // 删除服务器原有的图片，需要向后端提交删除请求
      await deleteByUrl(currentRoute.detailPic[index], currentRoute.id);
      // 删除对应的原图数据
      currentRoute.detailPic.splice(index, 1);
      detailPreviews.value.splice(index, 1);
    } else {
      // 删除用户新上传的图片，只在本地删除
      // 注意：新上传的图片在 detailPreviews 中的下标为 index
      // 而在 detailFiles 中为 index - originalCount
      const localIndex = index - originalCount;
      detailFiles.value.splice(localIndex, 1);
      detailPreviews.value.splice(index, 1);
    }
  } catch (error) {
    // 用户取消删除，无需处理
  }
}

// 点击“修改”按钮时，仅打开对话框并绑定数据
const openEditDialog =async (item: RouteItem) => {
  const result =  await getRouteByIdService(item.id)
  Object.assign(currentRoute, result.data)
  // 清空前次上传的文件
  tempCoverFile.value = null
  detailFiles.value = []
  detailPreviews.value = []
  editDialogVisible.value = true
  if(result.data.detailPic) {
    // 如果有详情图片，则预览原来的图片链接
    detailPreviews.value=currentRoute.detailPic.slice()
  }else{
    currentRoute.detailPic = []
  }
}

const saveEdit =async () => {
  // TODO: 请根据需要组装 FormData 提交 currentRoute 与文件数据
  // 示例：
  // const formData = new FormData()
  // formData.append('id', String(currentRoute.id))
  // formData.append('name', currentRoute.name)
  // formData.append('cover', tempCoverFile.value || currentRoute.cover)
  // detailFiles.value.forEach((file, index) => {
  //   formData.append(`detailPic${index}`, file)
  // })
  await updateRouteInfo(currentRoute,tempCoverFile.value, detailFiles.value);
  ElMessage.success('修改保存成功')
  editDialogVisible.value = false
}

// 首次加载数据
fetchRoutes()
</script>

<template>
  <div class="edit-detail-page">
    <!-- 搜索区域 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center;">
      <el-input v-model="searchText" placeholder="请输入路线名称进行搜索" style="width: 300px; margin-right: 10px;" clearable></el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 表格显示数据 -->
    <el-table :data="routeList" border style="width: 100%">
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="name" label="路线名称" />
      <el-table-column prop="category" label="行程类型" />
      <el-table-column prop="price" label="价格" width="100" />
      <el-table-column prop="duration" label="行程天数" width="120" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 加载更多按钮 -->
    <div v-if="hasMore" style="margin-top: 20px; text-align: center;">
      <el-button type="primary" @click="loadMore">加载更多</el-button>
    </div>
    <div v-else style="margin-top: 20px; text-align: center;">
      <span>已加载全部数据</span>
    </div>

    <!-- 修改对话框 -->
    <el-dialog title="修改路线详情" v-model:model-value="editDialogVisible">
      <el-form :model="currentRoute" label-width="100px">
        <el-form-item label="路线名称">
          <el-input v-model="currentRoute.name" placeholder="请输入路线名称" />
        </el-form-item>
        <!-- 封面图片上传 -->
        <el-form-item label="封面图片">
          <div class="uploader" @click="triggerCoverUpload" style="cursor: pointer;">
            <img :src="coverPreview" alt="封面预览" style="width: 200px; height: auto;" />
          </div>
          <input type="file" ref="coverInput" accept="image/*" style="display: none;" @change="handleCoverSelect" />
        </el-form-item>
        <!-- 详情图上传 -->
        <el-form-item label="详情图片">
          <div class="uploader" @click="triggerDetailUpload" style="cursor: pointer; border: 1px dashed #dcdfe6; padding: 10px;">
            <span>点击上传详情图片</span>
          </div>
          <input type="file" ref="detailInput" accept="image/*" multiple style="display: none;" @change="handleDetailSelect" />
          <div class="detail-previews" style="margin-top: 10px; display: flex; flex-wrap: wrap;">
            <div v-for="(url, index) in detailPreviews" :key="index" style="margin-right: 10px; position: relative;">
              <img :src="url" style="width:100px;height:auto;" />
              <!-- 删除按钮 -->
              <el-button
                size="mini"
                type="danger"
                icon="Close"
                style="position: absolute; top: 0; right: 0;width: 20px;height: 20px;"
                @click="removeDetailImage(index)">
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="行程类型">
          <el-input v-model="currentRoute.category" placeholder="请输入行程类型" />
        </el-form-item>
        <el-form-item label="路线描述">
          <el-input type="textarea" v-model="currentRoute.description" placeholder="请输入路线描述" rows="3" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="currentRoute.price" type="number" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="行程天数">
          <el-input v-model="currentRoute.duration" type="number" placeholder="请输入行程天数" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.edit-detail-page {
  padding: 20px;
}
.uploader img {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.detail-previews img {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>