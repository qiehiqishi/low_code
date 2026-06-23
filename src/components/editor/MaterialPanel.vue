<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/store/editor'
import type { MaterialComponent } from '@/types/editor'
import {
  Switch,
  EditPen,
  Box,
  Postcard,
  Document,
  Folder,
  Select,
  Check,
  CircleCheck,
  Timer,
  Calendar,
  Star,
  Grid,
  CopyDocument,
  AlarmClock,
  PriceTag,
  Bell,
  ArrowRight,
  List,
  FolderOpened,
} from '@element-plus/icons-vue'

const editorStore = useEditorStore()

const categories = computed(() => {
  const cats = new Set(editorStore.materials.map(m => m.category))
  return Array.from(cats)
})

const materialsByCategory = computed(() => {
  const grouped: Record<string, MaterialComponent[]> = {}
  categories.value.forEach(cat => {
    grouped[cat] = editorStore.materials.filter(m => m.category === cat)
  })
  return grouped
})

const getIconComponent = (icon: string) => {
  const iconMap: Record<string, any> = {
    button: Switch,
    input: EditPen,
    container: Box,
    card: Postcard,
    form: Document,
    select: Select,
    checkbox: Check,
    radio: CircleCheck,
    switch: Switch,
    date: Calendar,
    time: Timer,
    rate: Star,
    row: Grid,
    col: Grid,
    space: CopyDocument,
    text: EditPen,
    divider: AlarmClock,
    alert: AlarmClock,
    tag: PriceTag,
    badge: Bell,
    tabs: ArrowRight,
    steps: List,
    table: Grid,
    tree: FolderOpened,
    pagination: ArrowRight,
    breadcrumb: ArrowRight,
  }
  return iconMap[icon] || Box
}

const handleDragStart = (event: DragEvent, material: MaterialComponent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'material',
      data: material,
    }))
    event.dataTransfer.effectAllowed = 'copy'
    console.log('开始拖拽物料:', material.label)
  }
}

const handleDragEnd = () => {
  console.log('拖拽结束')
}
</script>

<template>
  <div class="material-panel">
    <div class="material-panel__header">
      <h3 class="material-panel__title">物料库</h3>
      <div class="material-panel__tips">
        拖拽组件到画布区域
      </div>
    </div>

    <div class="material-panel__content">
      <div 
        v-for="category in categories" 
        :key="category"
        class="material-category"
      >
        <div class="material-category__title">
          <el-icon class="material-category__icon">
            <Folder />
          </el-icon>
          <span class="material-category__text">{{ category }}</span>
        </div>

        <div class="material-list">
          <div 
            v-for="material in materialsByCategory[category]"
            :key="material.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart($event, material)"
            @dragend="handleDragEnd"
          >
            <div class="material-item__icon">
              <el-icon :size="28">
                <component :is="getIconComponent(material.icon || '')" />
              </el-icon>
            </div>
            
            <div class="material-item__label">
              {{ material.label }}
            </div>
            
            <div v-if="material.isContainer" class="material-item__badge">
              容器
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.material-panel__header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.material-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.material-panel__tips {
  font-size: 12px;
  color: #909399;
}

.material-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.material-category {
  margin-bottom: 20px;
}

.material-category__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
  padding: 4px 8px;
  background-color: #ffffff;
  border-radius: 4px;
}

.material-category__icon {
  font-size: 14px;
}

.material-category__text {
  flex: 1;
}

.material-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  min-height: 40px;
}

.material-item {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.material-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.material-item:active {
  cursor: grabbing;
}

.material-item__icon {
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-item__label {
  font-size: 13px;
  color: #606266;
  text-align: center;
  font-weight: 500;
}

.material-item__badge {
  font-size: 11px;
  color: #67c23a;
  background-color: #f0f9ff;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #67c23a;
}

.material-panel__content::-webkit-scrollbar {
  width: 6px;
}

.material-panel__content::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.material-panel__content::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}
</style>
