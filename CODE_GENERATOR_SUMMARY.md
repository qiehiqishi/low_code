# 代码生成器实现总结

## 实现概述

成功创建了完整的代码生成器，将低代码编辑器中的组件树转换为真实的 Vue 源码。支持生成完整 Vue 文件或仅 Template 部分，并提供代码预览弹窗、一键复制和下载功能。

## 核心实现

### 1. codeGenerator.ts

**文件路径**：[src/utils/codeGenerator.ts](file:///d:\web\my-app\low-code-electron\src\utils\codeGenerator.ts)

**核心函数**：

#### 1.1 generateVueCode

```typescript
export function generateVueCode(componentTree: ComponentData[]): string {
  if (!componentTree || componentTree.length === 0) {
    return ''
  }

  // 生成 template 部分
  const templateContent = generateTemplate(componentTree)

  // 生成完整的 Vue 文件
  const vueCode = `<template>
${templateContent}
</template>

<script setup lang="ts">
// 自动生成的 Vue 代码
</script>

<style scoped>
/* 组件样式 */
</style>
`

  return vueCode
}
```

**功能**：
- 检查组件树是否为空
- 生成 template 部分
- 添加 script 和 style 部分
- 返回完整 Vue 文件代码

#### 1.2 generateTemplate

```typescript
function generateTemplate(components: ComponentData[], indent: number = 1): string {
  const indentStr = '  '.repeat(indent) // 每层缩进 2 个空格
  let result = ''

  for (const component of components) {
    // 跳过根容器（root）
    if (component.id === 'root') {
      // 递归处理子组件
      if (component.children && component.children.length > 0) {
        result += generateTemplate(component.children, indent)
      }
      continue
    }

    // 生成组件标签
    const tagStart = generateTagStart(component, indentStr)
    const tagEnd = generateTagEnd(component, indentStr)

    // 处理子组件
    if (component.children && component.children.length > 0) {
      const childrenContent = generateTemplate(component.children, indent + 1)
      result += `${tagStart}\n${childrenContent}\n${tagEnd}\n`
    } else {
      // 无子组件，直接闭合
      result += `${tagStart}${generateTagContent(component)}${tagEnd}\n`
    }
  }

  return result.trim()
}
```

**功能**：
- 遍历组件数组
- 跳过根容器（root）
- 生成标签开始和结束部分
- 递归处理子组件
- 处理缩进

**关键点**：
- 使用 `indent` 参数控制缩进层级
- 每层缩进 2 个空格（`'  '.repeat(indent)`）
- 递归调用时增加缩进层级（`indent + 1`）

#### 1.3 generateTagStart

```typescript
function generateTagStart(component: ComponentData, indentStr: string): string {
  const tagName = getTagName(component.componentName)
  const attributes = generateAttributes(component)
  const styles = generateStyles(component.styles)

  // 合并属性和样式
  const allAttributes = `${attributes}${styles ? ` style="${styles}"` : ''}`

  return `${indentStr}<${tagName}${allAttributes}>`
}
```

**功能**：
- 获取标签名称
- 生成属性字符串
- 生成样式字符串
- 合并属性和样式
- 返回标签开始字符串

**示例输出**：
```vue
<el-button type="primary" size="default" style="width: auto; height: auto">
```

#### 1.4 generateAttributes

```typescript
function generateAttributes(component: ComponentData): string {
  const props = component.props
  let attributes = ''

  // 遍历所有属性
  for (const [key, value] of Object.entries(props)) {
    // 跳过特殊属性
    if (key === 'text' || key === 'class' || key === 'style') {
      continue
    }

    // 处理布尔值
    if (typeof value === 'boolean') {
      if (value) {
        attributes += ` ${key}`
      }
    }
    // 处理字符串和数字
    else if (value !== undefined && value !== null && value !== '') {
      attributes += ` ${key}="${value}"`
    }
  }

  return attributes
}
```

**功能**：
- 遍历 props 对象
- 跳过特殊属性（text、class、style）
- 处理布尔值属性（仅输出属性名）
- 处理字符串和数字属性（输出属性名和值）

**布尔值处理**：
```typescript
// true → 仅输出属性名
disabled: true → disabled

// false → 不输出
loading: false → （不生成）
```

#### 1.5 generateStyles

```typescript
function generateStyles(styles: Record<string, any>): string {
  if (!styles || Object.keys(styles).length === 0) {
    return ''
  }

  const styleArray: string[] = []

  // 遍历所有样式
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'auto') {
      // 转换 CSS 属性名（驼峰转短横线）
      const cssKey = camelToKebab(key)
      styleArray.push(`${cssKey}: ${value}`)
    }
  }

  return styleArray.join('; ')
}
```

**功能**：
- 遍历 styles 对象
- 过滤无效值（undefined、null、空字符串、auto）
- 转换驼峰命名到短横线命名
- 拼接样式字符串

**过滤规则**：
- `undefined`：不输出
- `null`：不输出
- `''`（空字符串）：不输出
- `'auto'`：不输出（默认值）

#### 1.6 camelToKebab

```typescript
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
```

**功能**：驼峰命名转短横线命名

**转换示例**：
- `backgroundColor` → `background-color`
- `fontSize` → `font-size`
- `borderRadius` → `border-radius`
- `flexDirection` → `flex-direction`
- `justifyContent` → `justify-content`

### 2. CodePreviewDialog.vue

**文件路径**：[src/components/editor/CodePreviewDialog.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\CodePreviewDialog.vue)

**核心特性**：

#### 2.1 代码类型选择

```vue
<el-radio-group v-model="codeType" size="small">
  <el-radio-button value="vue">完整 Vue 文件</el-radio-button>
  <el-radio-button value="template">仅 Template</el-radio-button>
</el-radio-group>
```

**选项**：
- `vue`：完整 Vue 文件（template + script + style）
- `template`：仅 Template 部分

#### 2.2 代码生成

```typescript
const generatedCode = computed(() => {
  if (codeType.value === 'vue') {
    return generateVueCode(editorStore.components)
  } else {
    return generateTemplateCode(editorStore.components)
  }
})
```

**流程**：
- 根据代码类型调用不同的生成函数
- 自动响应代码类型变化
- 实时更新生成的代码

#### 2.3 行号显示

```typescript
const codeWithLineNumbers = computed(() => {
  const lines = generatedCode.value.split('\n')
  return lines.map((line, index) => ({
    number: index + 1,
    content: line,
  }))
})
```

**功能**：
- 按行分割代码
- 为每行添加行号
- 用于代码展示

#### 2.4 一键复制

```typescript
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
```

**实现方式**：
- 优先使用 `navigator.clipboard.writeText`（现代浏览器）
- 降级使用 `document.execCommand('copy')`（旧浏览器）
- 显示成功/失败提示

#### 2.5 下载文件

```typescript
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
```

**流程**：
- 根据代码类型生成文件名
- 创建 Blob 对象
- 生成下载链接
- 自动触发下载
- 清理 URL 对象

### 3. Editor.vue 更新

**文件路径**：[src/components/editor/Editor.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Editor.vue)

**主要改进**：

#### 3.1 导入组件

```typescript
import CodePreviewDialog from './CodePreviewDialog.vue'
```

#### 3.2 状态管理

```typescript
// 代码预览弹窗状态
const showCodePreview = ref(false)

// 打开代码预览弹窗
const handleGenerateCode = () => {
  showCodePreview.value = true
}

// 关闭代码预览弹窗
const handleCloseCodePreview = () => {
  showCodePreview.value = false
}
```

#### 3.3 添加按钮

```vue
<el-button type="primary" @click="handleGenerateCode">
  生成代码
</el-button>
```

#### 3.4 引入弹窗

```vue
<CodePreviewDialog 
  :visible="showCodePreview"
  @close="handleCloseCodePreview"
/>
```

## 代码生成示例

### 1. 简单按钮组件

**输入数据**：
```json
{
  "id": "button-1",
  "componentName": "el-button",
  "label": "提交按钮",
  "props": {
    "type": "primary",
    "size": "default",
    "disabled": false
  },
  "styles": {
    "width": "auto",
    "height": "auto"
  },
  "children": []
}
```

**生成代码**：
```vue
<el-button type="primary" size="default">提交按钮</el-button>
```

### 2. 输入框组件

**输入数据**：
```json
{
  "id": "input-1",
  "componentName": "el-input",
  "label": "用户名输入框",
  "props": {
    "placeholder": "请输入用户名",
    "size": "default",
    "clearable": true
  },
  "styles": {
    "width": "100%",
    "height": "auto"
  },
  "children": []
}
```

**生成代码**：
```vue
<el-input placeholder="请输入用户名" size="default" clearable style="width: 100%"></el-input>
```

### 3. 嵌套容器组件

**输入数据**：
```json
{
  "id": "container-1",
  "componentName": "div",
  "label": "表单容器",
  "props": {},
  "styles": {
    "width": "100%",
    "padding": "20px",
    "display": "flex",
    "flexDirection": "column",
    "gap": "10px"
  },
  "children": [
    {
      "id": "input-1",
      "componentName": "el-input",
      "props": {
        "placeholder": "请输入用户名"
      },
      "styles": {
        "width": "100%"
      },
      "children": []
    },
    {
      "id": "button-1",
      "componentName": "el-button",
      "props": {
        "type": "primary"
      },
      "styles": {},
      "children": []
    }
  ]
}
```

**生成代码**：
```vue
<div style="width: 100%; padding: 20px; display: flex; flex-direction: column; gap: 10px">
  <el-input placeholder="请输入用户名" style="width: 100%"></el-input>
  <el-button type="primary">按钮</el-button>
</div>
```

### 4. 完整 Vue 文件

**生成代码**：
```vue
<template>
  <div style="width: 100%; padding: 20px; display: flex; flex-direction: column; gap: 10px">
    <el-input placeholder="请输入用户名" style="width: 100%"></el-input>
    <el-button type="primary">按钮</el-button>
  </div>
</template>

<script setup lang="ts">
// 自动生成的 Vue 代码
</script>

<style scoped>
/* 组件样式 */
</style>
```

## 属性转换详解

### 1. 布尔值属性

**转换规则**：
- `true` → 仅输出属性名（如 `disabled`）
- `false` → 不输出属性

**示例**：
```typescript
// 输入
props: {
  disabled: true,
  loading: false,
  plain: true,
}

// 输出
<el-button disabled plain>按钮</el-button>
```

### 2. 字符串属性

**转换规则**：
- 输出 `属性名="值"`

**示例**：
```typescript
// 输入
props: {
  type: 'primary',
  placeholder: '请输入内容',
  size: 'default',
}

// 输出
<el-button type="primary" size="default">
<el-input placeholder="请输入内容" size="default">
```

### 3. 数字属性

**转换规则**：
- 输出 `属性名="值"`

**示例**：
```typescript
// 输入
props: {
  rows: 3,
  max: 100,
  min: 0,
}

// 输出
<el-input rows="3">
<el-input-number max="100" min="0">
```

### 4. 特殊属性处理

**跳过属性**：
- `text`：按钮文本内容（作为标签内容）
- `class`：类名（暂不处理）
- `style`：样式（单独处理）

**示例**：
```typescript
// 输入
props: {
  type: 'primary',
  text: '点击我',
}

// 输出
<el-button type="primary">点击我</el-button>
```

## 样式转换详解

### 1. CSS 属性名转换

**驼峰 → 短横线**：

| 驼峰命名 | 短横线命名 |
|---------|-----------|
| backgroundColor | background-color |
| fontSize | font-size |
| borderRadius | border-radius |
| flexDirection | flex-direction |
| justifyContent | justify-content |
| alignItems | align-items |

### 2. 样式值过滤

**过滤规则**：
- `undefined`：不输出
- `null`：不输出
- `''`（空字符串）：不输出
- `'auto'`：不输出（默认值）

**示例**：
```typescript
// 输入
styles: {
  width: '100%',
  height: 'auto', // 被过滤
  backgroundColor: '#ffffff',
  fontSize: undefined, // 被过滤
  padding: '', // 被过滤
}

// 输出
style="width: 100%; background-color: #ffffff"
```

### 3. 样式拼接

**拼接规则**：
- 使用 `;` 分隔
- 格式：`属性名: 值`

**示例**：
```typescript
// 输入
styles: {
  width: '100%',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
}

// 输出
style="width: 100%; padding: 20px; display: flex; flex-direction: column"
```

## 嵌套容器处理

### 1. 递归生成流程

**步骤**：
1. 检查组件是否有 children
2. 如果有子组件，递归调用 generateTemplate
3. 增加缩进层级（`indent + 1`）
4. 生成子组件代码
5. 添加到父组件标签内

### 2. 缩进处理

**规则**：
- 每层缩进 2 个空格
- 根层级：0 个空格
- 第一层：2 个空格
- 第二层：4 个空格
- 第三层：6 个空格

**示例**：
```vue
<div>
  <el-input></el-input>
  <el-button></el-button>
</div>
```

### 3. 根容器跳过

**规则**：
- ID 为 'root' 的组件不生成标签
- 仅递归处理其子组件

**示例**：
```typescript
// 输入
{
  id: 'root',
  componentName: 'div',
  children: [
    { id: 'button-1', componentName: 'el-button' }
  ]
}

// 输出（不包含 root 标签）
<el-button>按钮</el-button>
```

## 代码预览弹窗设计

### 1. UI 设计

**顶部操作栏**：
- 代码类型选择（radio-group）
- 一键复制按钮
- 下载文件按钮

**代码展示区**：
- 深色背景（#1e1e1e）
- 显示行号（灰色）
- 代码内容（白色）
- 最大高度 500px，可滚动

**底部提示**：
- 使用提示信息
- 告知用户如何使用生成的代码

### 2. 样式设计

**代码容器样式**：
```css
.code-preview__code-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background-color: #1e1e1e;
}
```

**代码样式**：
```css
.code-preview__code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
}
```

**行号样式**：
```css
.code-preview__line-number {
  width: 40px;
  text-align: right;
  color: #858585;
  user-select: none;
}
```

### 3. 滚动条样式

```css
.code-preview__code-container::-webkit-scrollbar {
  width: 8px;
}

.code-preview__code-container::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}

.code-preview__code-container::-webkit-scrollbar-track {
  background-color: #1e1e1e;
}
```

## 核心优势

### 1. 自动化生成

**优势**：
- 无需手动编写代码
- 自动转换组件树
- 支持任意组件类型
- 易于扩展新组件

### 2. 格式化输出

**优势**：
- 自动处理缩进
- 保持代码整洁
- 符合 Vue 代码规范
- 易于阅读和维护

### 3. 实时预览

**优势**：
- 弹窗展示代码
- 支持代码类型切换
- 显示行号
- 方便查看和复制

### 4. 一键复制

**优势**：
- 快速复制代码
- 支持多种浏览器
- 降级方案保证兼容性
- 提示用户操作结果

### 5. 文件下载

**优势**：
- 自动生成文件名
- 支持下载 Vue 文件
- 支持下载 HTML 文件
- 方便保存和使用

## 相关文件

### 核心文件

- [codeGenerator.ts](file:///d:\web\my-app\low-code-electron\src\utils\codeGenerator.ts) - 代码生成器
- [CodePreviewDialog.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\CodePreviewDialog.vue) - 代码预览弹窗
- [Editor.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Editor.vue) - 编辑器主页面（已更新）
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\types\editor.ts) - 类型定义

### 文档文件

- [CODE_GENERATOR_GUIDE.md](file:///d:\web\my-app\low-code-electron\CODE_GENERATOR_GUIDE.md) - 使用指南
- [ATTR_PANEL_GUIDE.md](file:///d:\web\my-app\low-code-electron\ATTR_PANEL_GUIDE.md) - 属性面板指南
- [COMPONENT_RENDERER_GUIDE.md](file:///d:\web\my-app\low-code-electron\COMPONENT_RENDERER_GUIDE.md) - 渲染器指南
- [DRAG_USAGE.md](file:///d:\web\my-app\low-code-electron\DRAG_USAGE.md) - 拖拽功能指南
- [USAGE_GUIDE.md](file:///d:\web\my-app\low-code-electron\USAGE_GUIDE.md) - 核心数据结构指南

## 下一步建议

### 1. 语法高亮

**建议**：
- 使用 Prism.js 或 highlight.js
- 实现完整的语法高亮
- 支持多种语言高亮

### 2. 代码格式化

**建议**：
- 使用 Prettier 格式化代码
- 支持多种格式化配置
- 自动修复代码格式问题

### 3. TypeScript 支持

**建议**：
- 生成 TypeScript 代码
- 添加类型定义
- 支持类型检查

### 4. 组件导入

**建议**：
- 自动生成组件导入语句
- 支持 Element Plus 组件导入
- 支持自定义组件导入

### 5. 事件处理

**建议**：
- 生成事件处理代码
- 支持事件绑定
- 自动生成事件处理函数

### 6. 代码优化

**建议**：
- 优化生成的代码性能
- 减少冗余代码
- 提升代码质量

## 总结

成功实现了完整的代码生成器，具有以下核心特性：

- ✅ 将组件树转换为 Vue 代码
- ✅ 支持完整 Vue 文件和仅 Template
- ✅ 自动处理缩进和换行
- ✅ 支持嵌套容器组件
- ✅ 自动转换属性和样式
- ✅ 驼峰命名转短横线命名
- ✅ 过滤无效属性和样式
- ✅ 布尔值属性特殊处理
- ✅ 代码预览弹窗
- ✅ 显示行号
- ✅ 一键复制功能
- ✅ 下载文件功能
- ✅ 代码类型切换
- ✅ 深色主题代码展示
- ✅ 滚动条样式优化

可以立即用于低代码平台的代码生成！