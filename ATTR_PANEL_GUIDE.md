# AttrPanel 属性面板使用指南

## 概述

AttrPanel 是一个动态属性配置面板，用于编辑选中组件的属性和样式。支持根据组件类型自动生成表单，实时更新画布上的组件。

## 核心特性

### 1. 动态表单生成
- 根据物料库的 schema 自动生成表单
- 支持多种表单类型（string、number、boolean、select、color）
- 自动识别组件类型并显示对应的配置项

### 2. 实时更新
- 表单值变化时立即触发 store 的 updateComponentProps
- 画布上的组件实时更新
- 支持撤销/重做操作

### 3. 双配置支持
- **组件属性**：配置组件的 props（如按钮类型、输入框占位符）
- **组件样式**：配置组件的 styles（如宽度、高度、背景色）

### 4. 交互功能
- 显示组件信息（类型、ID）
- 删除组件按钮
- 锁定/解锁组件按钮

## Props 定义

```typescript
// 无需 props，直接从 Pinia store 获取选中组件
```

## 使用示例

### 1. 在编辑器中使用

```vue
<template>
  <div class="editor-layout">
    <!-- 左侧物料库 -->
    <MaterialPanel class="w-64" />
    
    <!-- 中间画布 -->
    <Canvas class="flex-1" />
    
    <!-- 右侧属性面板 -->
    <AttrPanel class="w-64" />
  </div>
</template>

<script setup lang="ts">
import MaterialPanel from '@/components/editor/MaterialPanel.vue'
import Canvas from '@/components/editor/Canvas.vue'
import AttrPanel from '@/components/editor/AttrPanel.vue'
</script>
```

### 2. 独立使用

```vue
<template>
  <AttrPanel />
</template>

<script setup lang="ts">
import AttrPanel from '@/components/editor/AttrPanel.vue'
</script>
```

## 功能详解

### 1. 未选中状态

当没有选中任何组件时，显示空状态提示：

```vue
<div class="attr-panel__empty">
  <div class="attr-panel__empty-icon">📦</div>
  <p class="attr-panel__empty-title">未选中组件</p>
  <p class="attr-panel__empty-text">请在画布中点击选中一个组件</p>
</div>
```

### 2. 已选中状态

选中组件后，显示以下内容：

#### 组件信息
```vue
<div class="attr-panel__info">
  <div>组件类型: {{ componentName }}</div>
  <div>组件ID: {{ selectedComponent.id }}</div>
</div>
```

#### 属性配置
根据物料库的 `schema` 自动生成表单：

**支持的表单类型**：
- `string`：文本输入框（`<el-input>`）
- `number`：数字输入框（`<el-input-number>`）
- `boolean`：开关（`<el-switch>`）
- `select`：下拉选择框（`<el-select>`）
- `color`：颜色选择器（`<el-color-picker>`）

#### 样式配置
根据物料库的 `styleSchema` 自动生成表单，支持相同的表单类型。

### 3. 操作按钮

底部提供两个操作按钮：

```vue
<div class="attr-panel__footer">
  <el-button type="danger" plain @click="deleteComponent">
    删除组件
  </el-button>
  <el-button type="warning" plain @click="toggleLock">
    {{ isLocked ? '解锁组件' : '锁定组件' }}
  </el-button>
</div>
```

## 表单类型详解

### 1. String 类型

**用途**：文本输入（如按钮文字、输入框占位符）

**示例**：
```typescript
{
  name: 'placeholder',
  label: '占位文本',
  type: 'string',
  default: '请输入内容',
}
```

**渲染**：
```vue
<el-input
  :model-value="getPropValue(schema)"
  @update:model-value="handlePropChange(schema.name, val)"
  placeholder="请输入占位文本"
  size="small"
/>
```

### 2. Number 类型

**用途**：数字输入（如宽度、高度）

**示例**：
```typescript
{
  name: 'fontSize',
  label: '字体大小',
  type: 'number',
  default: 14,
}
```

**渲染**：
```vue
<el-input-number
  :model-value="getPropValue(schema)"
  @update:model-value="handlePropChange(schema.name, val)"
  size="small"
  controls-position="right"
/>
```

### 3. Boolean 类型

**用途**：开关选项（如禁用状态、加载状态）

**示例**：
```typescript
{
  name: 'disabled',
  label: '禁用状态',
  type: 'boolean',
  default: false,
}
```

**渲染**：
```vue
<el-switch
  :model-value="getPropValue(schema)"
  @update:model-value="handlePropChange(schema.name, val)"
  size="small"
/>
```

### 4. Select 类型

**用途**：下拉选择（如按钮类型、尺寸）

**示例**：
```typescript
{
  name: 'type',
  label: '类型',
  type: 'select',
  default: 'primary',
  options: [
    { label: '主要', value: 'primary' },
    { label: '成功', value: 'success' },
    { label: '警告', value: 'warning' },
    { label: '危险', value: 'danger' },
    { label: '信息', value: 'info' },
  ],
}
```

**渲染**：
```vue
<el-select
  :model-value="getPropValue(schema)"
  @update:model-value="handlePropChange(schema.name, val)"
  placeholder="请选择类型"
  size="small"
  clearable
>
  <el-option
    v-for="option in schema.options"
    :key="option.value"
    :label="option.label"
    :value="option.value"
  />
</el-select>
```

### 5. Color 类型

**用途**：颜色选择（如背景色、文字颜色）

**示例**：
```typescript
{
  name: 'backgroundColor',
  label: '背景色',
  type: 'color',
  default: '#ffffff',
}
```

**渲染**：
```vue
<el-color-picker
  :model-value="getPropValue(schema)"
  @update:model-value="handlePropChange(schema.name, val)"
  size="small"
  show-alpha
/>
```

## 实际配置示例

### 1. ElButton 配置

**属性配置**：
- **类型**（select）：primary、success、warning、danger、info
- **尺寸**（select）：large、default、small
- **朴素按钮**（boolean）
- **圆角按钮**（boolean）
- **圆形按钮**（boolean）
- **加载状态**（boolean）
- **禁用状态**（boolean）

**样式配置**：
- **宽度**（string）
- **高度**（string）
- **背景色**（color）
- **文字颜色**（color）
- **字体大小**（string）
- **圆角**（string）

### 2. ElInput 配置

**属性配置**：
- **占位文本**（string）
- **尺寸**（select）：large、default、small
- **禁用状态**（boolean）
- **可清空**（boolean）
- **显示密码切换**（boolean）

**样式配置**：
- **宽度**（string）
- **高度**（string）
- **背景色**（color）
- **边框**（string）
- **圆角**（string）

### 3. Div 容器配置

**样式配置**：
- **宽度**（string）
- **高度**（string）
- **内边距**（string）
- **背景色**（color）
- **显示方式**（select）：block、inline、flex、grid
- **Flex方向**（select）：row、column
- **主轴对齐**（select）：flex-start、center、flex-end、space-between
- **交叉轴对齐**（select）：stretch、flex-start、center、flex-end
- **间距**（string）
- **边框**（string）
- **圆角**（string）

## 数据流

### 1. 获取选中组件

```typescript
const selectedComponent = computed(() => editorStore.selectedComponent)
```

### 2. 获取物料定义

```typescript
const selectedMaterial = computed(() => {
  return editorStore.materials.find(
    material => material.type === selectedComponent.value?.componentName
  )
})
```

### 3. 获取配置 Schema

```typescript
const propSchema = computed(() => {
  return selectedMaterial.value?.schema || []
})

const styleSchema = computed(() => {
  return selectedMaterial.value?.styleSchema || []
})
```

### 4. 获取属性值

```typescript
const getPropValue = (schema: PropSchema): any => {
  if (!selectedComponent.value) return schema.default
  
  return selectedComponent.value.props[schema.name] ?? schema.default
}
```

### 5. 更新属性

```typescript
const handlePropChange = (propName: string, value: any) => {
  if (!selectedComponent.value) return
  
  editorStore.updateComponentProps(selectedComponent.value.id, {
    [propName]: value,
  })
}
```

## 核心方法

### 1. handlePropChange

**功能**：处理属性更新

**参数**：
- `propName`：属性名称
- `value`：新值

**流程**：
1. 检查是否有选中组件
2. 调用 `editorStore.updateComponentProps`
3. 保存历史记录（用于撤销/重做）

### 2. handleStyleChange

**功能**：处理样式更新

**参数**：
- `styleName`：样式名称
- `value`：新值

**流程**：
1. 检查是否有选中组件
2. 调用 `editorStore.updateComponentStyles`
3. 保存历史记录（用于撤销/重做）

### 3. getPropValue

**功能**：获取属性值

**参数**：
- `schema`：属性配置 schema

**返回值**：
- 当前组件的属性值，如果没有则返回默认值

### 4. getStyleValue

**功能**：获取样式值

**参数**：
- `schema`：样式配置 schema

**返回值**：
- 当前组件的样式值，如果没有则返回默认值

## 样式说明

### 1. Tailwind CSS 类

**布局**：
- `h-full`：高度 100%
- `flex flex-col`：Flex 布局，纵向排列
- `bg-white`：白色背景
- `border-l border-gray-200`：左侧灰色边框

**头部**：
- `px-4 py-3`：内边距
- `border-b border-gray-200`：底部边框
- `bg-gray-50`：浅灰色背景

**内容区域**：
- `flex-1`：占据剩余空间
- `overflow-y-auto`：垂直滚动
- `p-4`：内边距

**表单项**：
- `space-y-4`：垂直间距
- `block`：块级元素
- `text-sm font-medium`：小字体，中等粗细

### 2. 自定义 CSS

**滚动条样式**：
```css
.attr-panel__content::-webkit-scrollbar {
  width: 6px;
}

.attr-panel__content::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}
```

**组件信息样式**：
```css
.attr-panel__info {
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  padding: 12px;
}
```

## 最佳实践

### 1. Schema 定义

**建议**：
- 为每个物料定义完整的 schema 和 styleSchema
- 使用合理的默认值
- 提供清晰的 label 和 description
- 为 select 类型提供完整的 options

### 2. 表单布局

**建议**：
- 按类型分组显示表单项
- 使用一致的间距和样式
- 提供清晰的标签和提示

### 3. 实时更新

**建议**：
- 使用 `@update:model-value` 监听变化
- 立即调用 store 的更新方法
- 保存历史记录支持撤销/重做

### 4. 用户体验

**建议**：
- 显示组件信息（类型、ID）
- 提供删除和锁定功能
- 空状态时显示友好提示
- 无配置时显示提示信息

## 常见问题

### Q1: 表单不显示？

**原因**：物料库没有定义 schema
**解决**：在 materials 中添加 schema 和 styleSchema

### Q2: 值不更新？

**原因**：没有调用 updateComponentProps
**解决**：确保 handlePropChange 正确调用

### Q3: 默认值不生效？

**原因**：使用 `||` 而不是 `??`
**解决**：使用 `??` 运算符处理 null/undefined

### Q4: 表单类型错误？

**原因**：schema.type 不匹配
**解决**：检查 schema.type 是否正确

### Q5: 样式不生效？

**原因**：样式值格式错误
**解决**：确保样式值符合 CSS 规范

## 相关文件

- [AttrPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\AttrPanel.vue) - 属性面板组件
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\types\editor.ts) - 类型定义
- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件
- [ComponentRenderer.vue](file:///d:\web\my-app\low-code-electron\src\components\core\ComponentRenderer.vue) - 组件渲染器

## 扩展建议

### 1. 添加更多表单类型

- `date`：日期选择器
- `time`：时间选择器
- `slider`：滑块
- `rate`：评分
- `upload`：文件上传

### 2. 添加验证功能

- 必填字段验证
- 格式验证
- 范围验证

### 3. 添加高级功能

- 批量编辑
- 样式预设
- 属性继承
- 组件复制

### 4. 优化用户体验

- 表单分组折叠
- 搜索过滤
- 快捷键支持
- 拖拽排序

## 总结

AttrPanel 属性面板已完全实现，具有以下核心特性：

- ✅ 动态表单生成（根据 schema）
- ✅ 实时更新（触发 store 方法）
- ✅ 多种表单类型支持（string、number、boolean、select、color）
- ✅ 双配置支持（属性 + 样式）
- ✅ 组件信息显示（类型、ID）
- ✅ 操作按钮（删除、锁定）
- ✅ 空状态提示
- ✅ Tailwind CSS 样式
- ✅ 撤销/重做支持

可以立即用于低代码平台的属性编辑！