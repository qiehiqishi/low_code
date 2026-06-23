# 低代码平台扩展 PRD

## Problem Statement

当前低代码平台仅支持有限的组件（按钮、输入框、卡片、表单），样式和属性配置不够灵活，难以满足复杂页面的设计需求。用户希望扩展更多组件类型，支持更丰富的组件组合方式，以及更灵活的样式和属性配置能力。

## Solution

扩展低代码平台的组件库，增加更多 Element Plus 组件支持；重构组件渲染系统使其更具扩展性；增强样式和属性配置能力；支持更多布局和容器组件。

## User Stories

1. As a low-code developer, I want to use more form components (select, checkbox, radio, date picker, time picker), so that I can build complex forms
2. As a low-code developer, I want to use layout components (row, col, space), so that I can create flexible page layouts
3. As a low-code developer, I want to use display components (text, image, divider, alert, badge, tag), so that I can enrich page content
4. As a low-code developer, I want to use navigation components (tabs, steps), so that I can build multi-step forms and tabbed interfaces
5. As a low-code developer, I want to use data components (table, tree, pagination), so that I can display and manage data
6. As a low-code developer, I want to configure more style properties (margin, padding, border, shadow, flex layout), so that I can precisely control component appearance
7. As a low-code developer, I want to configure component events (click, change, blur), so that I can add interactivity to components
8. As a low-code developer, I want to use preset style templates, so that I can quickly apply consistent styling
9. As a low-code developer, I want to see live preview of style changes, so that I can iterate quickly
10. As a low-code developer, I want to group components into sections, so that I can organize complex layouts
11. As a low-code developer, I want to clone components, so that I can quickly create similar elements
12. As a low-code developer, I want to use component templates, so that I can reuse common patterns

## Implementation Decisions

### 模块划分

1. **物料定义模块** (`store/editor.ts`)
   - 扩展物料库定义，添加更多组件类型
   - 为每个组件定义完整的属性 schema 和样式 schema

2. **组件渲染模块** (`components/core/ComponentRenderer.vue`)
   - 重构为动态组件注册机制，支持按需导入
   - 添加全局组件注册中心

3. **属性配置模块** (`components/editor/PropsPanel.vue`)
   - 扩展属性编辑类型（增加数字输入、滑块、文本域等）
   - 添加事件配置面板

4. **样式配置模块** (`components/editor/AttrPanel.vue`)
   - 扩展样式属性支持（margin、padding、border、flex 等）
   - 添加样式预设功能

5. **工具函数模块** (`utils/componentUtils.ts`)
   - 添加组件克隆功能
   - 添加组件模板管理

### 技术决策

1. **组件注册机制**：采用动态导入 + 注册表模式，避免打包体积过大
2. **Schema 驱动配置**：所有属性和样式配置通过 schema 定义，支持动态生成表单
3. **响应式样式绑定**：使用 Vue 3 的 style 绑定，支持实时预览
4. **事件系统**：支持配置组件事件绑定，生成对应的事件处理代码

### Schema 扩展

扩展 `PropSchema` 类型，支持更多配置类型：
- `textarea` - 多行文本
- `slider` - 滑块
- `range` - 范围选择
- `number` - 数字输入（已有）
- `json` - JSON 编辑器

### 新增组件清单

#### 表单组件
- el-select - 选择器
- el-checkbox - 复选框
- el-radio - 单选框
- el-date-picker - 日期选择器
- el-time-picker - 时间选择器
- el-switch - 开关
- el-rate - 评分
- el-cascader - 级联选择
- el-transfer - 穿梭框

#### 布局组件
- el-row - 行
- el-col - 列
- el-space - 间距
- el-container - 布局容器
- el-header - 页头
- el-main - 主体
- el-aside - 侧边栏
- el-footer - 页脚

#### 显示组件
- el-text - 文本
- el-image - 图片
- el-divider - 分割线
- el-alert - 警告提示
- el-badge - 徽标
- el-tag - 标签
- el-avatar - 头像

#### 导航组件
- el-tabs - 标签页
- el-steps - 步骤条
- el-breadcrumb - 面包屑

#### 数据组件
- el-table - 表格
- el-tree - 树形控件
- el-pagination - 分页

## Testing Decisions

1. **组件渲染测试**：测试每种组件是否正确渲染，属性是否正确绑定
2. **拖拽测试**：测试组件拖拽、嵌套、移动功能是否正常
3. **属性配置测试**：测试属性修改是否正确反映到组件上
4. **样式配置测试**：测试样式修改是否实时生效
5. **组件交互测试**：测试组件事件绑定和响应是否正常
6. **数据同步测试**：测试组件数据与 store 状态是否同步

## Out of Scope

1. 自定义组件开发（后续迭代）
2. 数据源绑定（后续迭代）
3. 条件渲染和循环渲染（后续迭代）
4. 动画效果（后续迭代）
5. 代码导出功能增强（后续迭代）
6. 多人协作（后续迭代）

## Further Notes

1. 优先实现常用组件（表单和布局组件），再扩展其他类型
2. 保持现有 API 兼容性，避免破坏已有的组件配置
3. 组件渲染采用按需导入，优化打包体积
4. 样式配置支持响应式设计（后续迭代）