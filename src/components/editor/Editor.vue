<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEditorStore } from '@/store/editor'
import MaterialPanel from './MaterialPanel.vue'
import Canvas from './Canvas.vue'
import AttrPanel from './AttrPanel.vue'
import CodePreviewDialog from './CodePreviewDialog.vue'

const editorStore = useEditorStore()

// 代码预览弹窗状态
const showCodePreview = ref(false)

// 初始化页面
onMounted(() => {
  editorStore.initComponents()
})

/**
 * 打开代码预览弹窗
 */
const handleGenerateCode = () => {
  showCodePreview.value = true
}

/**
 * 关闭代码预览弹窗
 */
const handleCloseCodePreview = () => {
  showCodePreview.value = false
}
</script>

<template>
  <div class="editor">
    <!-- 顶部工具栏 -->
    <div class="editor__toolbar">
      <div class="toolbar-left">
        <h2 class="toolbar-title">低代码编辑器</h2>
      </div>
      <div class="toolbar-right">
        <el-button 
          :disabled="!editorStore.canUndo"
          @click="editorStore.undo"
        >
          撤销
        </el-button>
        <el-button 
          :disabled="!editorStore.canRedo"
          @click="editorStore.redo"
        >
          重做
        </el-button>
        <el-button type="primary" @click="handleGenerateCode">
          生成代码
        </el-button>
        <el-button type="success">
          预览
        </el-button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="editor__body">
      <!-- 左侧物料区 -->
      <div class="editor__sidebar">
        <MaterialPanel />
      </div>

      <!-- 中间画布区 -->
      <div class="editor__canvas">
        <Canvas />
      </div>

      <!-- 右侧属性区 -->
      <div class="editor__props">
        <AttrPanel />
      </div>
    </div>

    <!-- 代码预览弹窗 -->
    <CodePreviewDialog 
      :visible="showCodePreview"
      @close="handleCloseCodePreview"
    />
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.editor__toolbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.editor__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor__sidebar {
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.editor__canvas {
  flex: 1;
  background-color: #ffffff;
  overflow: auto;
  padding: 20px;
}

.editor__props {
  width: 300px;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}
</style>