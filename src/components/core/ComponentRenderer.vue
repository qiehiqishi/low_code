<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/store/editor'
import type { ComponentData, MaterialComponent } from '@/types/editor'
import { ElButton, ElInput, ElCard, ElForm, ElFormItem } from 'element-plus'
import { createComponentFromMaterial } from '@/utils/componentUtils'

interface Props {
  component: ComponentData
  mode?: 'design' | 'preview'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'design',
})

const emit = defineEmits<{
  select: [id: string]
  hover: [id: string | null]
}>()

const editorStore = useEditorStore()

const isDragOver = ref(false)

const elementPlusComponents: Record<string, any> = {
  'el-button': ElButton,
  'el-input': ElInput,
  'el-card': ElCard,
  'el-form': ElForm,
  'el-form-item': ElFormItem,
}

const dynamicComponent = computed(() => {
  const componentName = props.component.componentName
  
  if (componentName.startsWith('el-')) {
    const component = elementPlusComponents[componentName]
    if (component) {
      return component
    }
    return null
  }
  
  if (componentName === 'div' || componentName === 'span' || componentName === 'p') {
    return componentName
  }
  
  return null
})

const componentAttrs = computed(() => {
  return {
    ...props.component.props,
    style: props.component.styles,
  }
})

const isContainer = computed(() => {
  return props.component.isContainer || 
         props.component.componentName === 'div' ||
         props.component.componentName === 'el-card'
})

const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0
})

const isSelected = computed(() => {
  return editorStore.selectedComponent?.id === props.component.id
})

const isHovered = computed(() => {
  return editorStore.hoveredComponent?.id === props.component.id
})

const handleSelect = (event: Event) => {
  event.stopPropagation()
  
  if (props.mode === 'design') {
    emit('select', props.component.id)
    editorStore.selectComponent(props.component)
  }
}

const handleHover = (event: Event) => {
  event.stopPropagation()
  
  if (props.mode === 'design') {
    emit('hover', props.component.id)
    editorStore.hoverComponent(props.component)
  }
}

const handleLeave = (event: Event) => {
  event.stopPropagation()
  
  if (props.mode === 'design') {
    emit('hover', null)
    editorStore.hoverComponent(null)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (isContainer.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  try {
    const materialData = event.dataTransfer?.getData('application/json')
    if (materialData && isContainer.value) {
      const material: MaterialComponent = JSON.parse(materialData)
      const component = createComponentFromMaterial(material)
      
      editorStore.addComponent(component, props.component.id)
      editorStore.selectComponent(component)
      console.log('组件添加到容器:', props.component.label || props.component.id)
    }
  } catch (error) {
    console.error('处理拖拽数据失败:', error)
  }
}

const handleChildSelect = (id: string) => {
  emit('select', id)
}

const handleChildHover = (id: string | null) => {
  emit('hover', id)
}
</script>

<template>
  <div 
    v-if="mode === 'design'"
    class="component-renderer-wrapper"
    :class="{
      'component-renderer-wrapper--selected': isSelected,
      'component-renderer-wrapper--hovered': isHovered,
      'component-renderer-wrapper--container': isContainer,
      'component-renderer-wrapper--drag-over': isDragOver,
    }"
    @click.stop="handleSelect"
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div 
      v-if="isSelected || isHovered"
      class="component-renderer-label"
    >
      {{ component.label || component.componentName }}
    </div>
    
    <component
      v-if="dynamicComponent"
      :is="dynamicComponent"
      v-bind="componentAttrs"
      class="component-renderer"
    >
      <template v-if="hasChildren">
        <ComponentRenderer
          v-for="child in component.children"
          :key="child.id"
          :component="child"
          :mode="mode"
          @select="handleChildSelect"
          @hover="handleChildHover"
        />
      </template>
      
      <div 
        v-if="isContainer && !hasChildren"
        class="component-renderer__empty"
      >
        <span class="component-renderer__empty-text">
          拖拽组件到容器内
        </span>
      </div>
    </component>
    
    <div 
      v-else
      class="component-renderer__unknown"
    >
      未知组件: {{ component.componentName }}
    </div>
    
    <div 
      v-if="isSelected"
      class="component-renderer-indicator component-renderer-indicator--selected"
    ></div>
    
    <div 
      v-if="isHovered && !isSelected"
      class="component-renderer-indicator component-renderer-indicator--hovered"
    ></div>
  </div>
  
  <component
    v-else-if="dynamicComponent"
    :is="dynamicComponent"
    v-bind="componentAttrs"
    class="component-renderer"
  >
    <template v-if="hasChildren">
      <ComponentRenderer
        v-for="child in component.children"
        :key="child.id"
        :component="child"
        :mode="mode"
      />
    </template>
  </component>
  
  <div 
    v-else
    class="component-renderer__unknown"
  >
    未知组件: {{ component.componentName }}
  </div>
</template>

<style scoped>
/* 包装层样式 */
.component-renderer-wrapper {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: move;  /* 改为 move 以支持拖拽 */
  min-height: 20px;
}

/* hover 状态 */
.component-renderer-wrapper:hover {
  border-color: #c0c4cc;
}

/* hover 蓝色边框 */
.component-renderer-wrapper--hovered {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.02);
}

/* 选中状态 */
.component-renderer-wrapper--selected {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.05);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 容器组件样式 */
.component-renderer-wrapper--container {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  padding: 12px;
}

/* 拖拽悬停容器样式 */
.component-renderer-wrapper--drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
}

/* 组件标签 */
.component-renderer-label {
  position: absolute;
  top: -8px;
  left: 8px;
  font-size: 11px;
  color: #909399;
  background-color: #ffffff;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid #e4e7ed;
  z-index: 10;
  white-space: nowrap;
}

/* 组件渲染器 */
.component-renderer {
  width: 100%;
}

/* 未知组件占位符 */
.component-renderer__unknown {
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  color: #999;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
}

/* 容器空状态 */
.component-renderer__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  background-color: #f9f9f9;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin-top: 8px;
}

.component-renderer__empty-text {
  font-size: 12px;
  color: #c0c4cc;
}

/* 指示器 */
.component-renderer-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 999;
  transition: all 0.2s ease;
}

.component-renderer-indicator--selected {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.component-renderer-indicator--hovered {
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.02);
}

/* 预览态样式 */
.component-renderer-wrapper--preview {
  border: none;
  cursor: default;
}

.component-renderer-wrapper--preview:hover {
  border: none;
  background-color: transparent;
}
</style>