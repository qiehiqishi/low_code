<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useEditorStore } from '@/store/editor';
import type { ComponentData, MaterialComponent } from '@/types/editor';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { createComponentFromMaterial } from '@/utils/componentUtils';
import { componentRegistry, registerElementPlusComponents } from './componentRegistry';
import ComponentContent from './ComponentContent.vue';
interface Props {
 component: ComponentData;
 mode?: 'design' | 'preview';
}
const props = withDefaults(defineProps<Props>(), {
 mode: 'design',
});
const emit = defineEmits<{
 select: [
 id: string
 ];
 hover: [
 id: string | null
 ];
}>();
const editorStore = useEditorStore();
const isDragOver = ref(false);
const isResizing = ref(false);
const resizeDirection = ref<string>('');
const startX = ref(0);
const startY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const isDragging = ref(false);
onMounted(() => {
 registerElementPlusComponents();
});
const dynamicComponent = computed(() => {
 const componentName = props.component.componentName;
 if (componentName.startsWith('el-')) {
 const component = componentRegistry.get(componentName);
 if (component) {
 return component;
 }
 return null;
 }
 if (componentName === 'div' || componentName === 'span' || componentName === 'p') {
 return componentName;
 }
 return null;
});
const componentAttrs = computed(() => {
  const attrs: Record<string, any> = {
    ...props.component.props,
    style: props.component.styles,
  };
  
  if (props.component.events) {
    for (const [eventName, handler] of Object.entries(props.component.events)) {
      if (handler) {
        attrs[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`] = () => {
          try {
            eval(handler);
          } catch (e) {
            console.error('执行事件处理失败:', e);
          }
        };
      }
    }
  }
  
  return attrs;
});
const containerComponents = [
 'div', 'span', 'el-card', 'el-form', 'el-row', 
 'el-space', 'el-container', 'el-header', 'el-main', 
 'el-aside', 'el-footer', 'el-tabs', 'el-table', 'el-tree'
];
const isContainer = computed(() => {
 return props.component.isContainer ||
 containerComponents.includes(props.component.componentName);
});
const hasChildren = computed(() => {
 return props.component.children && props.component.children.length > 0;
});
const isSelected = computed(() => {
 return editorStore.selectedComponent?.id === props.component.id;
});
const isHovered = computed(() => {
 return editorStore.hoveredComponent?.id === props.component.id;
});
const handleSelect = (event: Event) => {
 event.stopPropagation();
 if (props.mode === 'design') {
 emit('select', props.component.id);
 editorStore.selectComponent(props.component);
 }
};
const handleHover = (event: Event) => {
 event.stopPropagation();
 if (props.mode === 'design') {
 emit('hover', props.component.id);
 editorStore.hoverComponent(props.component);
 }
};
const handleLeave = (event: Event) => {
 event.stopPropagation();
 if (props.mode === 'design' && !isDragging.value) {
 emit('hover', null);
 editorStore.hoverComponent(null);
 }
};
const handleDragStart = (event: DragEvent) => {
 if (props.component.isLocked) {
 event.preventDefault();
 return;
 }
 isDragging.value = true;
 if (event.dataTransfer) {
 event.dataTransfer.setData('application/json', JSON.stringify({
 type: 'component',
 componentId: props.component.id,
 }));
 event.dataTransfer.effectAllowed = 'move';
 }
};
const handleDragEnd = () => {
 isDragging.value = false;
 isDragOver.value = false;
};
const handleDragOver = (event: DragEvent) => {
 event.preventDefault();
 if (isContainer.value) {
 isDragOver.value = true;
 }
};
const handleDragLeave = () => {
 isDragOver.value = false;
};
const handleDrop = (event: DragEvent) => {
 event.preventDefault();
 isDragOver.value = false;
 try {
 const data = event.dataTransfer?.getData('application/json');
 if (!data)
 return;
 const parsed = JSON.parse(data);
 if (parsed.type === 'material') {
 const material: MaterialComponent = parsed.data;
 const component = createComponentFromMaterial(material);
 editorStore.addComponent(component, props.component.id);
 editorStore.selectComponent(component);
 event.stopPropagation();
 }
 else if (parsed.type === 'component') {
 const sourceComponentId = parsed.componentId;
 if (sourceComponentId === props.component.id) {
 return;
 }
 const sourceComponent = editorStore.findComponentById(sourceComponentId);
 if (sourceComponent && isContainer.value) {
 const targetParent = editorStore.findComponentById(props.component.id);
 if (targetParent?.children) {
 const targetIndex = targetParent.children.length;
 editorStore.moveComponent(sourceComponentId, props.component.id, targetIndex);
 editorStore.selectComponent(sourceComponent);
 event.stopPropagation();
 }
 }
 }
 }
 catch (error) {
 console.error('处理拖拽数据失败:', error);
 }
};
const handleResizeStart = (event: MouseEvent, direction: string) => {
 event.stopPropagation();
 isResizing.value = true;
 resizeDirection.value = direction;
 startX.value = event.clientX;
 startY.value = event.clientY;
 const width = props.component.styles.width || 'auto';
 const height = props.component.styles.height || 'auto';
 startWidth.value = width === 'auto' ? 100 : parseFloat(width);
 startHeight.value = height === 'auto' ? 50 : parseFloat(height);
 document.addEventListener('mousemove', handleResizeMove);
 document.addEventListener('mouseup', handleResizeEnd);
};
const handleResizeMove = (event: MouseEvent) => {
 if (!isResizing.value)
 return;
 const deltaX = event.clientX - startX.value;
 const deltaY = event.clientY - startY.value;
 let newWidth = startWidth.value;
 let newHeight = startHeight.value;
 switch (resizeDirection.value) {
 case 'se':
 newWidth = Math.max(50, startWidth.value + deltaX);
 newHeight = Math.max(30, startHeight.value + deltaY);
 break;
 case 'sw':
 newWidth = Math.max(50, startWidth.value - deltaX);
 newHeight = Math.max(30, startHeight.value + deltaY);
 break;
 case 'ne':
 newWidth = Math.max(50, startWidth.value + deltaX);
 newHeight = Math.max(30, startHeight.value - deltaY);
 break;
 case 'nw':
 newWidth = Math.max(50, startWidth.value - deltaX);
 newHeight = Math.max(30, startHeight.value - deltaY);
 break;
 case 'e':
 newWidth = Math.max(50, startWidth.value + deltaX);
 break;
 case 'w':
 newWidth = Math.max(50, startWidth.value - deltaX);
 break;
 case 'n':
 newHeight = Math.max(30, startHeight.value - deltaY);
 break;
 case 's':
 newHeight = Math.max(30, startHeight.value + deltaY);
 break;
 }
 editorStore.updateComponentStyles(props.component.id, {
 width: `${newWidth}px`,
 height: `${newHeight}px`,
 });
};
const handleResizeEnd = () => {
 isResizing.value = false;
 resizeDirection.value = '';
 document.removeEventListener('mousemove', handleResizeMove);
 document.removeEventListener('mouseup', handleResizeEnd);
};
const handleMoveUp = (event: Event) => {
 event.stopPropagation();
 editorStore.moveComponentUp(props.component.id);
};
const handleMoveDown = (event: Event) => {
 event.stopPropagation();
 editorStore.moveComponentDown(props.component.id);
};
const handleChildSelect = (id: string) => {
 emit('select', id);
};
const handleChildHover = (id: string | null) => {
 emit('hover', id);
};
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
      'component-renderer-wrapper--dragging': isDragging,
    }"
    @click.stop="handleSelect"
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div 
      v-if="isSelected || isHovered"
      class="component-renderer-label"
    >
      {{ component.label || component.componentName }}
      
      <div v-if="isSelected" class="component-renderer-actions">
        <button 
          class="component-renderer-action-btn"
          @click="handleMoveUp"
          title="上移"
        >
          <el-icon><ArrowUp /></el-icon>
        </button>
        <button 
          class="component-renderer-action-btn"
          @click="handleMoveDown"
          title="下移"
        >
          <el-icon><ArrowDown /></el-icon>
        </button>
      </div>
    </div>
    
    <component
      v-if="dynamicComponent"
      :is="dynamicComponent"
      v-bind="componentAttrs"
      class="component-renderer"
    >
      <ComponentContent
        :component="component"
        :mode="mode"
        @select="handleChildSelect"
        @hover="handleChildHover"
      />
      
      <div 
        v-if="isContainer && !hasChildren && !['el-alert', 'el-select', 'el-tabs', 'el-steps', 'el-table', 'el-breadcrumb'].includes(component.componentName)"
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
    
    <div v-if="isSelected" class="component-renderer-resize-handles">
      <div 
        class="resize-handle resize-handle--nw"
        @mousedown="(e) => handleResizeStart(e, 'nw')"
      ></div>
      <div 
        class="resize-handle resize-handle--n"
        @mousedown="(e) => handleResizeStart(e, 'n')"
      ></div>
      <div 
        class="resize-handle resize-handle--ne"
        @mousedown="(e) => handleResizeStart(e, 'ne')"
      ></div>
      <div 
        class="resize-handle resize-handle--w"
        @mousedown="(e) => handleResizeStart(e, 'w')"
      ></div>
      <div 
        class="resize-handle resize-handle--e"
        @mousedown="(e) => handleResizeStart(e, 'e')"
      ></div>
      <div 
        class="resize-handle resize-handle--sw"
        @mousedown="(e) => handleResizeStart(e, 'sw')"
      ></div>
      <div 
        class="resize-handle resize-handle--s"
        @mousedown="(e) => handleResizeStart(e, 's')"
      ></div>
      <div 
        class="resize-handle resize-handle--se"
        @mousedown="(e) => handleResizeStart(e, 'se')"
      ></div>
    </div>
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
.component-renderer-wrapper {
  position: relative;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: move;
  min-height: 20px;
}

.component-renderer-wrapper:hover {
  border-color: #c0c4cc;
}

.component-renderer-wrapper--hovered {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.02);
}

.component-renderer-wrapper--selected {
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.05);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.component-renderer-wrapper--container {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  padding: 12px;
}

.component-renderer-wrapper--drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
}

.component-renderer-wrapper--dragging {
  opacity: 0.5;
  cursor: grabbing;
}

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
  display: flex;
  align-items: center;
  gap: 4px;
}

.component-renderer-actions {
  display: flex;
  gap: 2px;
  margin-left: 8px;
}

.component-renderer-action-btn {
  width: 18px;
  height: 18px;
  border: none;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 2px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
}

.component-renderer-action-btn:hover {
  background-color: #409eff;
  color: #ffffff;
}

.component-renderer {
  width: 100%;
}

.component-renderer__unknown {
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  color: #999;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
}

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

.component-renderer-resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #409eff;
  border: 1px solid #ffffff;
  border-radius: 2px;
  pointer-events: auto;
  cursor: nwse-resize;
}

.resize-handle--nw {
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
}

.resize-handle--n {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resize-handle--ne {
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
}

.resize-handle--w {
  top: 50%;
  left: -4px;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.resize-handle--e {
  top: 50%;
  right: -4px;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.resize-handle--sw {
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
}

.resize-handle--s {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.resize-handle--se {
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
}

.component-renderer-wrapper--preview {
  border: none;
  cursor: default;
}

.component-renderer-wrapper--preview:hover {
  border: none;
  background-color: transparent;
}
</style>