# AttrPanel 属性面板实现总结

## 实现概述

成功创建了动态属性配置面板 `AttrPanel.vue`，用于编辑选中组件的属性和样式。支持根据物料库的 schema 自动生成表单，实时更新画布上的组件。

## 核心实现

### 1. AttrPanel.vue

**文件路径**：[src/components/editor/AttrPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\AttrPanel.vue)

**核心特性**：

#### 1.1 动态表单生成

```vue
<!-- String 类型 -->
<el-input
  :model-value="getPropValue(schema)"
  @update:model-value="(val) => handlePropChange(schema.name, val)"
  placeholder="请输入..."
  size="small"
/>

<!-- Select 类型 -->
<el-select
  :model-value="getPropValue(schema)"
  @update:model-value="(val) => handlePropChange(schema.name, val)"
  placeholder="请选择..."
  size="small"
>
  <el-option
    v-for="option in schema.options"
    :key="option.value"
    :label="option.label"
    :value="option.value"
  />
</el-select>
```

**支持的表单类型**：
- `string`：文本输入框（`<el-input>`）
- `number`：数字输入框（`<el-input-number>`）
- `boolean`：开关（`<el-switch>`）
- `select`：下拉选择框（`<el-select>`）
- `color`：颜色选择器（`<el-color-picker>`）

#### 1.2 实时更新机制

```typescript
const handlePropChange = (propName: string, value: any) => {
  if (!selectedComponent.value) return
  
  console.log('更新属性:', propName, value)
  
  editorStore.updateComponentProps(selectedComponent.value.id, {
    [propName]: value,
  })
}
```

**关键点**：
- 使用 `@update:model-value` 监听变化
- 立即调用 `editorStore.updateComponentProps`
- 自动保存历史记录（支持撤销/重做）
- 画布上的组件实时更新

#### 1.3 双配置支持

**组件属性**：
```vue
<div v-if="propSchema.length > 0" class="attr-panel__props">
  <div class="attr-panel__section-title">组件属性</div>
  
  <!-- 根据 schema 自动生成表单 -->
  <div v-for="schema in propSchema" :key="schema.name">
    <!-- 表单项 -->
  </div>
</div>
```

**组件样式**：
```vue
<div v-if="styleSchema.length > 0" class="attr-panel__styles">
  <div class="attr-panel__section-title">组件样式</div>
  
  <!-- 根据 styleSchema 自动生成表单 -->
  <div v-for="schema in styleSchema" :key="schema.name">
    <!-- 表单项 -->
  </div>
</div>
```

#### 1.4 组件信息显示

```vue
<div class="attr-panel__info">
  <div>组件类型: {{ componentName }}</div>
  <div>组件ID: {{ selectedComponent.id }}</div>
</div>
```

#### 1.5 操作按钮

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

### 2. Editor Store 更新

**文件路径**：[src/store/editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts)

**新增方法**：

#### 2.1 lockComponent

```typescript
/**
 * 锁定组件
 * @param id 组件ID
 */
const lockComponent = (id: string) => {
  const component = findComponentById(id)
  if (!component) {
    console.error(`组件 ${id} 不存在`)
    return
  }

  component.isLocked = true
  saveHistory()
}
```

**功能**：
- 查找指定组件
- 设置 `isLocked = true`
- 保存历史记录

#### 2.2 unlockComponent

```typescript
/**
 * 解锁组件
 * @param id 组件ID
 */
const unlockComponent = (id: string) => {
  const component = findComponentById(id)
  if (!component) {
    console.error(`组件 ${id} 不存在`)
    return
  }

  component.isLocked = false
  saveHistory()
}
```

**功能**：
- 查找指定组件
- 设置 `isLocked = false`
- 保存历史记录

### 3. 数据流设计

#### 3.1 获取选中组件

```typescript
const selectedComponent = computed(() => editorStore.selectedComponent)
```

**流程**：
- 从 Pinia store 获取 `selectedComponent`
- 自动响应选中状态变化
- 无选中时显示空状态

#### 3.2 获取物料定义

```typescript
const selectedMaterial = computed(() => {
  return editorStore.materials.find(
    material => material.type === selectedComponent.value?.componentName
  )
})
```

**流程**：
- 根据组件名称查找物料定义
- 获取 schema 和 styleSchema
- 用于生成表单配置

#### 3.3 获取配置 Schema

```typescript
const propSchema = computed(() => {
  return selectedMaterial.value?.schema || []
})

const styleSchema = computed(() => {
  return selectedMaterial.value?.styleSchema || []
})
```

**流程**：
- 从物料定义中提取 schema
- 用于动态生成表单
- 无配置时显示提示

#### 3.4 获取属性值

```typescript
const getPropValue = (schema: PropSchema): any => {
  if (!selectedComponent.value) return schema.default
  
  return selectedComponent.value.props[schema.name] ?? schema.default
}
```

**关键点**：
- 使用 `??` 运算符（而不是 `||`）
- 正确处理 null/undefined
- 返回默认值作为 fallback

#### 3.5 更新属性

```typescript
const handlePropChange = (propName: string, value: any) => {
  if (!selectedComponent.value) return
  
  editorStore.updateComponentProps(selectedComponent.value.id, {
    [propName]: value,
  })
}
```

**流程**：
- 检查是否有选中组件
- 调用 store 的更新方法
- 自动保存历史记录

## 表单类型详解

### 1. String 类型

**用途**：文本输入

**示例配置**：
```typescript
{
  name: 'placeholder',
  label: '占位文本',
  type: 'string',
  default: '请输入内容',
}
```

**渲染组件**：`<el-input>`

**适用场景**：
- 按钮文字
- 输入框占位符
- 宽度、高度（如 "100px"、"auto"）

### 2. Number 类型

**用途**：数字输入

**示例配置**：
```typescript
{
  name: 'fontSize',
  label: '字体大小',
  type: 'number',
  default: 14,
}
```

**渲染组件**：`<el-input-number>`

**适用场景**：
- 字体大小
- 边框宽度
- 透明度

### 3. Boolean 类型

**用途**：开关选项

**示例配置**：
```typescript
{
  name: 'disabled',
  label: '禁用状态',
  type: 'boolean',
  default: false,
}
```

**渲染组件**：`<el-switch>`

**适用场景**：
- 禁用状态
- 加载状态
- 朴素按钮
- 圆角按钮

### 4. Select 类型

**用途**：下拉选择

**示例配置**：
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

**渲染组件**：`<el-select>`

**适用场景**：
- 按钮类型
- 按钮尺寸
- 显示方式（block、flex、grid）
- Flex 方向（row、column）

### 5. Color 类型

**用途**：颜色选择

**示例配置**：
```typescript
{
  name: 'backgroundColor',
  label: '背景色',
  type: 'color',
  default: '#ffffff',
}
```

**渲染组件**：`<el-color-picker>`

**适用场景**：
- 背景色
- 文字颜色
- 边框颜色

## 实际配置示例

### 1. ElButton 配置

**物料定义**：
```typescript
{
  type: 'el-button',
  label: '按钮',
  schema: [
    { name: 'type', label: '类型', type: 'select', default: 'primary', options: [...] },
    { name: 'size', label: '尺寸', type: 'select', default: 'default', options: [...] },
    { name: 'plain', label: '朴素按钮', type: 'boolean', default: false },
    { name: 'round', label: '圆角按钮', type: 'boolean', default: false },
    { name: 'circle', label: '圆形按钮', type: 'boolean', default: false },
    { name: 'loading', label: '加载状态', type: 'boolean', default: false },
    { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
  ],
  styleSchema: [
    { name: 'width', label: '宽度', type: 'string', default: 'auto' },
    { name: 'height', label: '高度', type: 'string', default: 'auto' },
    { name: 'backgroundColor', label: '背景色', type: 'color' },
    { name: 'color', label: '文字颜色', type: 'color' },
    { name: 'fontSize', label: '字体大小', type: 'string', default: '14px' },
    { name: 'borderRadius', label: '圆角', type: 'string', default: '4px' },
  ],
}
```

**生成的表单**：
- **组件属性**：7 个表单项（类型、尺寸、5 个开关）
- **组件样式**：6 个表单项（宽度、高度、2 个颜色、字体大小、圆角）

### 2. ElInput 配置

**物料定义**：
```typescript
{
  type: 'el-input',
  label: '输入框',
  schema: [
    { name: 'placeholder', label: '占位文本', type: 'string', default: '请输入内容' },
    { name: 'size', label: '尺寸', type: 'select', default: 'default', options: [...] },
    { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
    { name: 'clearable', label: '可清空', type: 'boolean', default: false },
    { name: 'show-password', label: '显示密码切换', type: 'boolean', default: false },
  ],
  styleSchema: [
    { name: 'width', label: '宽度', type: 'string', default: '100%' },
    { name: 'height', label: '高度', type: 'string', default: 'auto' },
    { name: 'backgroundColor', label: '背景色', type: 'color' },
    { name: 'border', label: '边框', type: 'string', default: '1px solid #dcdfe6' },
    { name: 'borderRadius', label: '圆角', type: 'string', default: '4px' },
  ],
}
```

**生成的表单**：
- **组件属性**：5 个表单项（占位文本、尺寸、3 个开关）
- **组件样式**：5 个表单项（宽度、高度、背景色、边框、圆角）

### 3. Div 容器配置

**物料定义**：
```typescript
{
  type: 'div',
  label: '容器',
  schema: [],  // 无属性配置
  styleSchema: [
    { name: 'width', label: '宽度', type: 'string', default: '100%' },
    { name: 'height', label: '高度', type: 'string', default: 'auto' },
    { name: 'padding', label: '内边距', type: 'string', default: '10px' },
    { name: 'backgroundColor', label: '背景色', type: 'color' },
    { name: 'display', label: '显示方式', type: 'select', default: 'block', options: [...] },
    { name: 'flexDirection', label: 'Flex方向', type: 'select', default: 'row', options: [...] },
    { name: 'justifyContent', label: '主轴对齐', type: 'select', default: 'flex-start', options: [...] },
    { name: 'alignItems', label: '交叉轴对齐', type: 'select', default: 'stretch', options: [...] },
    { name: 'gap', label: '间距', type: 'string', default: '10px' },
    { name: 'border', label: '边框', type: 'string', default: 'none' },
    { name: 'borderRadius', label: '圆角', type: 'string', default: '0' },
  ],
}
```

**生成的表单**：
- **组件属性**：无（显示提示）
- **组件样式**：11 个表单项（宽度、高度、内边距、背景色、7 个下拉选择、边框、圆角）

## UI 布局设计

### 1. Tailwind CSS 类

**整体布局**：
```vue
<div class="attr-panel h-full flex flex-col bg-white border-l border-gray-200">
```

- `h-full`：高度 100%
- `flex flex-col`：Flex 布局，纵向排列
- `bg-white`：白色背景
- `border-l border-gray-200`：左侧灰色边框

**头部**：
```vue
<div class="attr-panel__header px-4 py-3 border-b border-gray-200 bg-gray-50">
```

- `px-4 py-3`：内边距
- `border-b border-gray-200`：底部边框
- `bg-gray-50`：浅灰色背景

**内容区域**：
```vue
<div class="attr-panel__content flex-1 overflow-y-auto p-4">
```

- `flex-1`：占据剩余空间
- `overflow-y-auto`：垂直滚动
- `p-4`：内边距

**表单项**：
```vue
<div class="attr-panel__form space-y-4">
```

- `space-y-4`：垂直间距

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

## 核心优势

### 1. 动态生成

**优势**：
- 无需手动编写表单代码
- 根据物料库自动生成
- 支持任意组件类型
- 易于扩展新组件

### 2. 实时更新

**优势**：
- 表单值变化立即生效
- 画布上的组件实时更新
- 支持撤销/重做
- 无需手动刷新

### 3. 类型安全

**优势**：
- 使用 TypeScript 类型定义
- PropSchema 明确类型
- 编译时错误检查
- IDE 自动提示

### 4. 用户友好

**优势**：
- 清晰的组件信息显示
- 空状态友好提示
- 操作按钮便捷
- 样式美观统一

## 使用流程

### 1. 选中组件

**步骤**：
1. 在画布中点击组件
2. 组件被选中（蓝色边框）
3. 属性面板自动显示配置

### 2. 编辑属性

**步骤**：
1. 在属性面板中修改表单值
2. 表单值变化触发 `handlePropChange`
3. 调用 `editorStore.updateComponentProps`
4. 画布上的组件实时更新

### 3. 编辑样式

**步骤**：
1. 在样式配置中修改表单值
2. 表单值变化触发 `handleStyleChange`
3. 调用 `editorStore.updateComponentStyles`
4. 画布上的组件样式实时更新

### 4. 操作组件

**删除组件**：
1. 点击"删除组件"按钮
2. 调用 `editorStore.deleteComponent`
3. 组件从画布中移除
4. 属性面板显示空状态

**锁定组件**：
1. 点击"锁定组件"按钮
2. 调用 `editorStore.lockComponent`
3. 组件被锁定（防止误操作）
4. 按钮变为"解锁组件"

## 技术亮点

### 1. 计算属性缓存

```typescript
const selectedComponent = computed(() => editorStore.selectedComponent)
const selectedMaterial = computed(() => ...)
const propSchema = computed(() => ...)
const styleSchema = computed(() => ...)
```

**优势**：
- 自动缓存计算结果
- 避免重复计算
- 提升性能

### 2. 类型过滤

```vue
<div v-for="schema in propSchema.filter(s => s.type === 'string')" :key="schema.name">
```

**优势**：
- 按类型分组渲染
- 代码结构清晰
- 易于维护

### 3. 空值处理

```typescript
return selectedComponent.value.props[schema.name] ?? schema.default
```

**优势**：
- 使用 `??` 运算符
- 正确处理 null/undefined
- 避免 `||` 的 0 值问题

### 4. 事件监听

```vue
@update:model-value="(val) => handlePropChange(schema.name, val)"
```

**优势**：
- 使用 Vue 3 的 `@update:model-value`
- 统一的事件监听方式
- 支持双向绑定

## 相关文件

### 核心文件

- [AttrPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\AttrPanel.vue) - 属性面板组件
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理（已更新）
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\types\editor.ts) - 类型定义
- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件
- [ComponentRenderer.vue](file:///d:\web\my-app\low-code-electron\src\components\core\ComponentRenderer.vue) - 组件渲染器

### 文档文件

- [ATTR_PANEL_GUIDE.md](file:///d:\web\my-app\low-code-electron\ATTR_PANEL_GUIDE.md) - 使用指南
- [COMPONENT_RENDERER_GUIDE.md](file:///d:\web\my-app\low-code-electron\COMPONENT_RENDERER_GUIDE.md) - 渲染器指南
- [DRAG_USAGE.md](file:///d:\web\my-app\low-code-electron\DRAG_USAGE.md) - 拖拽功能指南
- [USAGE_GUIDE.md](file:///d:\web\my-app\low-code-electron\USAGE_GUIDE.md) - 核心数据结构指南

## 下一步建议

### 1. 功能扩展

- 添加更多表单类型（date、time、slider、rate）
- 实现表单验证功能
- 添加批量编辑功能
- 实现样式预设功能

### 2. 用户体验

- 表单分组折叠
- 搜索过滤功能
- 快捷键支持
- 拖拽排序表单项

### 3. 性能优化

- 大量表单项时使用虚拟滚动
- 优化计算属性性能
- 减少不必要的重新渲染

### 4. 高级功能

- 属性继承机制
- 组件复制功能
- 样式模板库
- 响应式设计支持

## 总结

成功实现了完整的动态属性配置面板 AttrPanel.vue，具有以下核心特性：

- ✅ 动态表单生成（根据物料库 schema）
- ✅ 实时更新（触发 store 方法）
- ✅ 多种表单类型支持（string、number、boolean、select、color）
- ✅ 双配置支持（组件属性 + 组件样式）
- ✅ 组件信息显示（类型、ID）
- ✅ 操作按钮（删除、锁定/解锁）
- ✅ 空状态友好提示
- ✅ Tailwind CSS 样式
- ✅ 撤销/重做支持
- ✅ TypeScript 类型安全

同时更新了 editor store，添加了 lockComponent 和 unlockComponent 方法。

可以立即用于低代码平台的属性编辑！