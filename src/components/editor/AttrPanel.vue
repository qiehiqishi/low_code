<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/store/editor'
import type { PropSchema } from '@/types/editor'

const editorStore = useEditorStore()

// 当前选中的组件
const selectedComponent = computed(() => editorStore.selectedComponent)

// 当前选中组件的物料定义
const selectedMaterial = computed(() => {
  if (!selectedComponent.value) return null
  
  return editorStore.materials.find(
    material => material.type === selectedComponent.value?.componentName
  )
})

// 属性配置 schema
const propSchema = computed(() => {
  return selectedMaterial.value?.schema || []
})

// 样式配置 schema
const styleSchema = computed(() => {
  return selectedMaterial.value?.styleSchema || []
})

// 组件名称
const componentName = computed(() => {
  return selectedComponent.value?.label || selectedComponent.value?.componentName || '未知组件'
})

/**
 * 处理属性更新
 */
const handlePropChange = (propName: string, value: any) => {
  if (!selectedComponent.value) return
  
  console.log('更新属性:', propName, value)
  
  editorStore.updateComponentProps(selectedComponent.value.id, {
    [propName]: value,
  })
}

/**
 * 处理样式更新
 */
const handleStyleChange = (styleName: string, value: any) => {
  if (!selectedComponent.value) return
  
  console.log('更新样式:', styleName, value)
  
  editorStore.updateComponentStyles(selectedComponent.value.id, {
    [styleName]: value,
  })
}

/**
 * 获取属性值
 */
const getPropValue = (schema: PropSchema): any => {
  if (!selectedComponent.value) return schema.default
  
  return selectedComponent.value.props[schema.name] ?? schema.default
}

/**
 * 获取样式值
 */
const getStyleValue = (schema: PropSchema): any => {
  if (!selectedComponent.value) return schema.default
  
  return selectedComponent.value.styles[schema.name] ?? schema.default
}

/**
 * 处理事件更新
 */
const handleEventChange = (eventName: string, value: string) => {
  if (!selectedComponent.value) return
  
  console.log('更新事件:', eventName, value)
  
  editorStore.updateComponentEvents(selectedComponent.value.id, {
    [eventName]: value,
  })
}
</script>

<template>
  <div class="attr-panel h-full flex flex-col bg-white border-l border-gray-200">
    <!-- 头部 -->
    <div class="attr-panel__header px-4 py-3 border-b border-gray-200 bg-gray-50">
      <h3 class="text-base font-semibold text-gray-800">属性面板</h3>
    </div>

    <!-- 内容区域 -->
    <div class="attr-panel__content flex-1 overflow-y-auto p-4">
      <!-- 未选中组件状态 -->
      <div v-if="!selectedComponent" class="attr-panel__empty flex flex-col items-center justify-center h-full text-center">
        <div class="attr-panel__empty-icon text-6xl text-gray-300 mb-4">📦</div>
        <p class="attr-panel__empty-title text-base font-medium text-gray-600 mb-2">未选中组件</p>
        <p class="attr-panel__empty-text text-sm text-gray-500">
          请在画布中点击选中一个组件
        </p>
      </div>

      <!-- 已选中组件状态 -->
      <div v-else class="attr-panel__selected">
        <!-- 组件信息 -->
        <div class="attr-panel__info mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-blue-700">组件类型:</span>
            <span class="text-sm text-blue-600">{{ componentName }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-blue-700">组件ID:</span>
            <span class="text-xs text-blue-500">{{ selectedComponent.id }}</span>
          </div>
        </div>

        <!-- 属性配置 -->
        <div v-if="propSchema.length > 0" class="attr-panel__props mb-6">
          <div class="attr-panel__section-title text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            组件属性
          </div>
          
          <div class="attr-panel__form space-y-4">
            <!-- String 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'string')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-input
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                :placeholder="'请输入' + schema.label"
                size="small"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Number 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'number')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-input-number
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                size="small"
                controls-position="right"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Boolean 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'boolean')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-switch
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                size="small"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Select 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'select')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-select
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                :placeholder="'请选择' + schema.label"
                size="small"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="option in schema.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Color 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'color')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-color-picker
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                size="small"
                show-alpha
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Textarea 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'textarea')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-input
                type="textarea"
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                :placeholder="'请输入' + schema.label"
                :rows="schema.rows || 3"
                size="small"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Slider 类型 -->
            <div v-for="schema in propSchema.filter(s => s.type === 'slider')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
                <span v-if="schema.required" class="text-red-500 ml-1">*</span>
              </label>
              <el-slider
                :model-value="getPropValue(schema)"
                @update:model-value="(val) => handlePropChange(schema.name, val)"
                :min="schema.min || 0"
                :max="schema.max || 100"
                :step="schema.step || 1"
                :show-input="true"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- 样式配置 -->
        <div v-if="styleSchema.length > 0" class="attr-panel__styles">
          <div class="attr-panel__section-title text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            组件样式
          </div>
          
          <div class="attr-panel__form space-y-4">
            <!-- String 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'string')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-input
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                :placeholder="'请输入' + schema.label"
                size="small"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Number 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'number')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-input-number
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                size="small"
                controls-position="right"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Boolean 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'boolean')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-switch
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                size="small"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Select 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'select')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-select
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                :placeholder="'请选择' + schema.label"
                size="small"
                clearable
                class="w-full"
              >
                <el-option
                  v-for="option in schema.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Color 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'color')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-color-picker
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                size="small"
                show-alpha
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Textarea 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'textarea')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-input
                type="textarea"
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                :placeholder="'请输入' + schema.label"
                :rows="schema.rows || 3"
                size="small"
                class="w-full"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>

            <!-- Slider 类型 -->
            <div v-for="schema in styleSchema.filter(s => s.type === 'slider')" :key="schema.name" class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                {{ schema.label }}
              </label>
              <el-slider
                :model-value="getStyleValue(schema)"
                @update:model-value="(val) => handleStyleChange(schema.name, val)"
                :min="schema.min || 0"
                :max="schema.max || 100"
                :step="schema.step || 1"
                :show-input="true"
              />
              <p v-if="schema.description" class="attr-panel__desc text-xs text-gray-500 mt-1">
                {{ schema.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- 事件配置 -->
        <div class="attr-panel__events mb-6">
          <div class="attr-panel__section-title text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            事件配置
          </div>
          
          <div class="attr-panel__form space-y-4">
            <div class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                点击事件 (click)
              </label>
              <el-input
                type="textarea"
                :model-value="selectedComponent?.events?.click || ''"
                @update:model-value="(val) => handleEventChange('click', val)"
                placeholder="输入点击事件处理逻辑，如: alert('点击了')"
                :rows="3"
                size="small"
                class="w-full"
              />
            </div>
            <div class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                输入事件 (input)
              </label>
              <el-input
                type="textarea"
                :model-value="selectedComponent?.events?.input || ''"
                @update:model-value="(val) => handleEventChange('input', val)"
                placeholder="输入输入事件处理逻辑"
                :rows="3"
                size="small"
                class="w-full"
              />
            </div>
            <div class="attr-panel__field">
              <label class="attr-panel__label block text-sm font-medium text-gray-700 mb-2">
                变化事件 (change)
              </label>
              <el-input
                type="textarea"
                :model-value="selectedComponent?.events?.change || ''"
                @update:model-value="(val) => handleEventChange('change', val)"
                placeholder="输入变化事件处理逻辑"
                :rows="3"
                size="small"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- 无配置提示 -->
        <div v-if="propSchema.length === 0 && styleSchema.length === 0" class="attr-panel__no-config mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p class="text-sm text-gray-500">该组件暂无可配置的属性和样式</p>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div v-if="selectedComponent" class="attr-panel__footer px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div class="flex gap-2">
        <el-button size="small" type="primary" plain @click="editorStore.cloneComponent(selectedComponent.id)">
          克隆组件
        </el-button>
        <el-button size="small" type="danger" plain @click="editorStore.deleteComponent(selectedComponent.id)">
          删除组件
        </el-button>
        <el-button 
          size="small" 
          type="warning" 
          plain 
          @click="selectedComponent.isLocked ? editorStore.unlockComponent(selectedComponent.id) : editorStore.lockComponent(selectedComponent.id)"
        >
          {{ selectedComponent.isLocked ? '解锁组件' : '锁定组件' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attr-panel {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.attr-panel__header {
  background-color: #f5f7fa;
}

.attr-panel__content {
  background-color: #ffffff;
}

.attr-panel__empty {
  min-height: 200px;
}

.attr-panel__empty-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.attr-panel__empty-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.attr-panel__empty-text {
  font-size: 14px;
  color: #909399;
}

.attr-panel__info {
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  padding: 12px;
}

.attr-panel__section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.attr-panel__field {
  margin-bottom: 16px;
}

.attr-panel__label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  display: block;
}

.attr-panel__input {
  width: 100%;
}

.attr-panel__desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.attr-panel__no-config {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.attr-panel__footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

/* 滚动条样式 */
.attr-panel__content::-webkit-scrollbar {
  width: 6px;
}

.attr-panel__content::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.attr-panel__content::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

/* Element Plus 组件样式调整 */
.attr-panel__input .el-input,
.attr-panel__input .el-select,
.attr-panel__input .el-input-number {
  width: 100%;
}

.attr-panel__input .el-color-picker {
  width: 100%;
}
</style>