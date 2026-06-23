<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEditorStore } from '@/store/editor'
import ComponentRenderer from '../core/ComponentRenderer.vue'
import type { ComponentData, MaterialComponent } from '@/types/editor'
import { createComponentFromMaterial } from '@/utils/componentUtils'
import { Box, Refresh, FullScreen } from '@element-plus/icons-vue'

const editorStore = useEditorStore()

const isDragging = ref(false)

onMounted(() => {
  if (editorStore.components.length === 0) {
    editorStore.initComponents()
  }
})

const rootComponent = computed(() => {
  return editorStore.components[0] || null
})

const rootChildren = computed(() => {
  return rootComponent.value?.children || []
})

const isDragOver = ref(false)

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
  isDragging.value = true
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragOver.value = false
    isDragging.value = false
    editorStore.hoverComponent(null)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  isDragging.value = false

  try {
    const data = event.dataTransfer?.getData('application/json')
    if (!data) return

    const parsed = JSON.parse(data)

    if (parsed.type === 'material') {
      const material: MaterialComponent = parsed.data
      console.log('接收到拖拽的物料:', material)

      const component = createComponentFromMaterial(material)
      console.log('创建的组件:', component)

      if (rootComponent.value) {
        let targetParentId = 'root'
        
        const hoveredComponent = editorStore.hoveredComponent
        if (hoveredComponent && hoveredComponent.isContainer) {
          targetParentId = hoveredComponent.id
          console.log('将组件添加到容器:', hoveredComponent.label || hoveredComponent.id)
        } else {
          console.log('将组件添加到根容器')
        }

        editorStore.addComponent(component, targetParentId)
        editorStore.selectComponent(component)
        console.log('组件添加成功')
      }
    } else if (parsed.type === 'component') {
      const sourceComponentId = parsed.componentId
      const sourceComponent = editorStore.findComponentById(sourceComponentId)
      
      if (sourceComponent && rootComponent.value) {
        let targetParentId = 'root'
        
        const hoveredComponent = editorStore.hoveredComponent
        if (hoveredComponent && hoveredComponent.isContainer && hoveredComponent.id !== sourceComponentId) {
          targetParentId = hoveredComponent.id
          console.log('将组件移动到容器:', hoveredComponent.label || hoveredComponent.id)
        } else {
          console.log('将组件移动到根容器')
        }
        
        const targetParent = editorStore.findComponentById(targetParentId)
        
        if (targetParent?.children) {
          const targetIndex = targetParent.children.length
          editorStore.moveComponent(sourceComponentId, targetParentId, targetIndex)
          editorStore.selectComponent(sourceComponent)
          console.log('组件移动成功:', sourceComponent.label || sourceComponent.id, '->', targetParentId)
        }
      }
    }
  } catch (error) {
    console.error('处理拖拽数据失败:', error)
  }
}

const handleSelect = (id: string) => {
  const component = editorStore.findComponentById(id)
  editorStore.selectComponent(component)
}

const handleHover = (id: string | null) => {
  if (id) {
    const component = editorStore.findComponentById(id)
    editorStore.hoverComponent(component)
  } else {
    editorStore.hoverComponent(null)
  }
}
</script>

<template>
  <div class="canvas">
    <div class="canvas__header">
      <h3 class="canvas__title">画布区域</h3>
      <div class="canvas__info">
        <span class="canvas__count">
          组件数: {{ editorStore.componentCount }}
        </span>
      </div>
    </div>

    <div class="canvas__content">
      <div class="canvas__draggable"
        :class="{ 'canvas__draggable--drag-over': isDragOver }"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div v-if="rootChildren.length === 0" class="canvas__empty">
          <el-icon class="canvas__empty-icon" :size="64">
            <Box />
          </el-icon>
          <p class="canvas__empty-title">画布为空</p>
          <p class="canvas__empty-text">
            从左侧物料库拖拽组件到此处开始设计页面
          </p>
          <div class="canvas__empty-tips">
            <div class="canvas__empty-tip">
              <el-icon><Refresh /></el-icon>
              <span>支持拖拽添加组件</span>
            </div>
            <div class="canvas__empty-tip">
              <el-icon><Refresh /></el-icon>
              <span>容器组件可嵌套子组件</span>
            </div>
            <div class="canvas__empty-tip">
              <el-icon><FullScreen /></el-icon>
              <span>组件可拖拽排序和移动</span>
            </div>
            <div class="canvas__empty-tip">
              <el-icon><FullScreen /></el-icon>
              <span>选中组件后可拖拽边缘调整大小</span>
            </div>
          </div>
        </div>

        <ComponentRenderer
          v-for="component in rootChildren"
          :key="component.id"
          :component="component"
          mode="design"
          @select="handleSelect"
          @hover="handleHover"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.canvas__header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f7fa;
}

.canvas__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.canvas__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas__count {
  font-size: 13px;
  color: #909399;
  padding: 4px 12px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.canvas__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f2f5;
}

.canvas__draggable {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 2px dashed #dcdfe6;
  transition: all 0.3s ease;
}

.canvas__draggable:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.canvas__draggable--drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
}

.canvas__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fafafa;
  padding: 40px;
  cursor: copy;
  transition: all 0.3s ease;
}

.canvas__empty:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.canvas__empty-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.canvas__empty-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 0 0 8px 0;
}

.canvas__empty-text {
  font-size: 14px;
  color: #909399;
  margin: 0 0 20px 0;
  text-align: center;
}

.canvas__empty-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.canvas__empty-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
}

.canvas__empty-tip-icon {
  font-size: 14px;
}
</style>
