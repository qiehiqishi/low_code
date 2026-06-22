<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useEditorStore } from '@/store/editor'
import { generateVueCode, generateTemplateCode } from '@/utils/codeGenerator'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

const editorStore = useEditorStore()

// 代码类型选择
const codeType = ref<'vue' | 'template'>('vue')

// 生成的代码
const generatedCode = computed(() => {
  if (codeType.value === 'vue') {
    return generateVueCode(editorStore.components)
  } else {
    return generateTemplateCode(editorStore.components)
  }
})

// 代码显示（带行号）
const codeWithLineNumbers = computed(() => {
  const lines = generatedCode.value.split('\n')
  return lines.map((line, index) => ({
    number: index + 1,
    content: line,
  }))
})

/**
 * 复制代码到剪贴板
 */
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    // 降级方案：使用传统方法
    const textarea = document.createElement('textarea')
    textarea.value = generatedCode.value
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('代码已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
    }
    document.body.removeChild(textarea)
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  emit('close')
}

/**
 * 下载代码文件
 */
const handleDownload = () => {
  const fileName = codeType.value === 'vue' ? 'generated-component.vue' : 'generated-template.html'
  const blob = new Blob([generatedCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('代码已下载')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="生成代码"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 顶部操作栏 -->
    <div class="code-preview__toolbar">
      <div class="code-preview__type-selector">
        <el-radio-group v-model="codeType" size="small">
          <el-radio-button value="vue">完整 Vue 文件</el-radio-button>
          <el-radio-button value="template">仅 Template</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="code-preview__actions">
        <el-button type="primary" size="small" @click="handleCopy">
          <el-icon><DocumentCopy /></el-icon>
          一键复制
        </el-button>
        <el-button type="success" size="small" @click="handleDownload">
          <el-icon><Download /></el-icon>
          下载文件
        </el-button>
      </div>
    </div>

    <!-- 代码展示区域 -->
    <div class="code-preview__content">
      <div class="code-preview__header">
        <span class="code-preview__title">
          {{ codeType === 'vue' ? 'Vue 组件代码' : 'Template 代码' }}
        </span>
        <span class="code-preview__info">
          共 {{ codeWithLineNumbers.length }} 行
        </span>
      </div>

      <div class="code-preview__code-container">
        <pre class="code-preview__code"><code v-for="line in codeWithLineNumbers" :key="line.number" class="code-preview__line">
<span class="code-preview__line-number">{{ line.number }}</span>
<span class="code-preview__line-content">{{ line.content }}</span>
</code></pre>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="code-preview__footer">
      <el-alert
        title="提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          生成的代码可以直接复制到 Vue 项目中使用。如需修改，请在编辑器中调整组件后重新生成。
        </template>
      </el-alert>
    </div>
  </el-dialog>
</template>

<style scoped>
.code-preview__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.code-preview__type-selector {
  display: flex;
  align-items: center;
}

.code-preview__actions {
  display: flex;
  gap: 8px;
}

.code-preview__content {
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.code-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.code-preview__title {
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
}

.code-preview__info {
  font-size: 12px;
  color: #858585;
}

.code-preview__code-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
}

.code-preview__code {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  background: transparent;
}

.code-preview__line {
  display: block;
  margin: 0;
  padding: 0;
}

.code-preview__line-number {
  display: inline-block;
  width: 40px;
  text-align: right;
  color: #858585;
  margin-right: 16px;
  user-select: none;
}

.code-preview__line-content {
  color: #d4d4d4;
}

.code-preview__footer {
  margin-top: 16px;
}

/* 滚动条样式 */
.code-preview__code-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-preview__code-container::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}

.code-preview__code-container::-webkit-scrollbar-track {
  background-color: #1e1e1e;
}

/* 代码高亮（简单版本） */
.code-preview__line-content {
  /* 标签 */
  color: #d4d4d4;
}

/* 可以添加更复杂的语法高亮 */
</style>