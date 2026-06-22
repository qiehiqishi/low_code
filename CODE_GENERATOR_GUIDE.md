# 代码生成器使用指南

## 概述

代码生成器是一个将低代码编辑器中的组件树转换为真实 Vue 源码的工具。支持生成完整的 Vue 文件或仅生成 Template 部分，并提供一键复制和下载功能。

## 核心功能

### 1. 代码生成
- 将组件树 JSON 转换为 Vue 代码
- 支持生成完整 Vue 文件（template + script + style）
- 支持仅生成 template 部分
- 自动处理缩进和换行

### 2. 嵌套支持
- 支持嵌套容器组件
- 自动递归生成子组件代码
- 保持正确的缩进层级

### 3. 属性转换
- 自动转换组件属性为 HTML 属性
- 支持布尔值属性（如 disabled、loading）
- 支持字符串和数字属性

### 4. 样式转换
- 将样式对象转换为 CSS 样式字符串
- 自动转换驼峰命名到短横线命名（如 backgroundColor → background-color）
- 过滤无效样式值

### 5. 代码预览
- 弹窗展示生成的代码
- 显示行号
- 支持一键复制到剪贴板
- 支持下载代码文件

## 使用方法

### 1. 打开代码生成器

**步骤**：
1. 在编辑器顶部工具栏点击"生成代码"按钮
2. 弹窗显示生成的代码

### 2. 选择代码类型

**选项**：
- **完整 Vue 文件**：包含 template、script、style 三部分
- **仅 Template**：仅包含 template 内容

### 3. 复制代码

**方法**：
- 点击"一键复制"按钮
- 代码自动复制到剪贴板
- 可直接粘贴到 Vue 项目中使用

### 4. 下载代码

**方法**：
- 点击"下载文件"按钮
- 自动下载为 `.vue` 或 `.html` 文件
- 文件名根据代码类型自动生成

## 代码生成示例

### 1. 简单组件

**输入数据**：
```json
{
  "id": "button-1",
  "componentName": "el-button",
  "props": {
    "type": "primary",
    "size": "default"
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
<el-button type="primary" size="default">按钮</el-button>
```

### 2. 嵌套容器

**输入数据**：
```json
{
  "id": "container-1",
  "componentName": "div",
  "props": {},
  "styles": {
    "width": "100%",
    "padding": "20px",
    "display": "flex",
    "flexDirection": "column"
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
<div style="width: 100%; padding: 20px; display: flex; flex-direction: column">
  <el-input placeholder="请输入用户名" style="width: 100%"></el-input>
  <el-button type="primary">按钮</el-button>
</div>
```

### 3. 完整 Vue 文件

**生成代码**：
```vue
<template>
  <div style="width: 100%; padding: 20px; display: flex; flex-direction: column">
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

## 核心实现

### 1. generateVueCode 函数

**功能**：生成完整的 Vue 文件代码

**参数**：
- `componentTree`：组件树数组

**返回值**：
- Vue 文件代码字符串

**流程**：
1. 检查组件树是否为空
2. 生成 template 部分
3. 添加 script 和 style 部分
4. 返回完整代码

### 2. generateTemplate 函数

**功能**：生成 template 内容

**参数**：
- `components`：组件数组
- `indent`：缩进层级（默认 1）

**返回值**：
- template 字符串

**流程**：
1. 遍历组件数组
2. 跳过根容器（root）
3. 生成标签开始部分
4. 递归处理子组件
5. 生成标签结束部分
6. 处理缩进

### 3. generateTagStart 函数

**功能**：生成标签开始部分

**参数**：
- `component`：组件数据
- `indentStr`：缩进字符串

**返回值**：
- 标签开始字符串（如 `<el-button type="primary">`）

**流程**：
1. 获取标签名称
2. 生成属性字符串
3. 生成样式字符串
4. 合并属性和样式

### 4. generateAttributes 函数

**功能**：生成属性字符串

**参数**：
- `component`：组件数据

**返回值**：
- 属性字符串（如 `type="primary" size="default"`）

**流程**：
1. 遍历 props 对象
2. 跳过特殊属性（text、class、style）
3. 处理布尔值属性
4. 处理字符串和数字属性

### 5. generateStyles 函数

**功能**：生成样式字符串

**参数**：
- `styles`：样式对象

**返回值**：
- 样式字符串（如 `width: 100%; padding: 20px`）

**流程**：
1. 遍历 styles 对象
2. 过滤无效值（undefined、null、空字符串、auto）
3. 转换驼峰命名到短横线命名
4. 拼接样式字符串

### 6. camelToKebab 函数

**功能**：驼峰命名转短横线命名

**参数**：
- `str`：驼峰字符串（如 backgroundColor）

**返回值**：
- 短横线字符串（如 background-color）

**示例**：
- `backgroundColor` → `background-color`
- `fontSize` → `font-size`
- `borderRadius` → `border-radius`

## 属性转换规则

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
}

// 输出
<el-button disabled>按钮</el-button>
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
}

// 输出
<el-button type="primary">
<el-input placeholder="请输入内容">
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
}

// 输出
<el-input rows="3">
<el-input-number max="100">
```

### 4. 特殊属性

**跳过属性**：
- `text`：按钮文本内容（作为标签内容）
- `class`：类名（暂不处理）
- `style`：样式（单独处理）

## 样式转换规则

### 1. CSS 属性名转换

**驼峰 → 短横线**：
- `backgroundColor` → `background-color`
- `fontSize` → `font-size`
- `borderRadius` → `border-radius`
- `flexDirection` → `flex-direction`
- `justifyContent` → `justify-content`

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
  height: 'auto',
  backgroundColor: '#ffffff',
  fontSize: undefined,
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
}

// 输出
style="width: 100%; padding: 20px; display: flex"
```

## 嵌套容器处理

### 1. 递归生成

**流程**：
1. 检查组件是否有 children
2. 如果有子组件，递归调用 generateTemplate
3. 增加缩进层级（indent + 1）
4. 生成子组件代码

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

## 代码预览弹窗

### 1. 功能特性

**核心功能**：
- 显示生成的代码
- 显示行号
- 支持代码类型切换
- 一键复制功能
- 下载文件功能

### 2. 界面设计

**顶部操作栏**：
- 代码类型选择（完整 Vue 文件 / 仅 Template）
- 一键复制按钮
- 下载文件按钮

**代码展示区**：
- 深色背景（类似 VS Code）
- 显示行号
- 代码高亮（可扩展）

**底部提示**：
- 使用提示信息
- 告知用户如何使用生成的代码

### 3. 复制功能

**实现方式**：
- 优先使用 `navigator.clipboard.writeText`
- 降级使用 `document.execCommand('copy')`
- 显示成功/失败提示

### 4. 下载功能

**实现方式**：
- 创建 Blob 对象
- 生成下载链接
- 自动触发下载
- 文件名根据代码类型生成

## 配置选项

### 1. 缩进配置

```typescript
export const codeGeneratorConfig = {
  indentSize: 2, // 缩进大小
  indentChar: ' ', // 缩进字符
  lineBreak: '\n', // 换行符
}
```

### 2. 自定义配置

**可调整参数**：
- `indentSize`：缩进空格数（默认 2）
- `indentChar`：缩进字符（默认空格）
- `lineBreak`：换行符（默认 `\n`）

## 最佳实践

### 1. 组件命名

**建议**：
- 使用标准的 Element Plus 组件名（如 el-button）
- 使用标准的 HTML 标签名（如 div、span）

### 2. 属性设置

**建议**：
- 仅设置必要的属性
- 避免设置无效属性值
- 使用合理的默认值

### 3. 样式设置

**建议**：
- 使用标准的 CSS 属性名
- 设置合理的样式值
- 避免冗余样式

### 4. 嵌套层级

**建议**：
- 控制嵌套层级（最多 3 层）
- 使用语义化的容器组件
- 保持清晰的组件结构

## 常见问题

### Q1: 生成的代码格式不正确？

**原因**：缩进配置错误
**解决**：检查 codeGeneratorConfig 的 indentSize

### Q2: 属性未生成？

**原因**：属性值为空或被跳过
**解决**：检查 props 对象的值

### Q3: 样式未生成？

**原因**：样式值为 auto 或无效
**解决**：检查 styles 对象的值

### Q4: 嵌套组件未生成？

**原因**：children 数组为空
**解决**：检查组件的 children 属性

### Q5: 复制失败？

**原因**：浏览器不支持 clipboard API
**解决**：使用降级方案或手动复制

## 扩展建议

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

## 相关文件

- [codeGenerator.ts](file:///d:\web\my-app\low-code-electron\src\utils\codeGenerator.ts) - 代码生成器
- [CodePreviewDialog.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\CodePreviewDialog.vue) - 代码预览弹窗
- [Editor.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Editor.vue) - 编辑器主页面
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\types\editor.ts) - 类型定义

## 总结

代码生成器已完全实现，具有以下核心特性：

- ✅ 将组件树转换为 Vue 代码
- ✅ 支持完整 Vue 文件和仅 Template
- ✅ 自动处理缩进和换行
- ✅ 支持嵌套容器组件
- ✅ 自动转换属性和样式
- ✅ 驼峰命名转短横线命名
- ✅ 过滤无效属性和样式
- ✅ 代码预览弹窗
- ✅ 显示行号
- ✅ 一键复制功能
- ✅ 下载文件功能
- ✅ 代码类型切换

可以立即用于低代码平台的代码生成！