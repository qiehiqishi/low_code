# 低代码平台 (LowCode Platform)
仓库地址：   https://github.com/qiehiqishi/low_code.git
一个基于 Vue 3 + Vite + TypeScript 的低代码平台，支持拖拽生成 Vue 页面。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **拖拽库**: vue-draggable-plus
- **样式**: Tailwind CSS

## 项目结构

```
lowCode/
├── src/
│   ├── components/
│   │   ├── core/              # 核心渲染组件
│   │   │   └── Renderer.vue   # 动态组件渲染器
│   │   └── editor/            # 编辑器 UI
│   │       ├── Editor.vue     # 编辑器主组件
│   │       ├── MaterialPanel.vue  # 左侧物料区
│   │       ├── Canvas.vue     # 中间画布区
│   │       └── PropsPanel.vue # 右侧属性区
│   ├── store/
│   │   └── editor.ts          # Pinia 状态管理
│   ├── types/
│   │   └── editor.ts          # 类型定义
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口文件
│   └── style.css              # 全局样式
├── vite.config.ts             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
├── postcss.config.js          # PostCSS 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目配置
```

## 核心功能

### 1. 物料库管理
- 左侧物料面板展示可用组件
- 支持拖拽添加组件到画布
- 组件分类管理

### 2. 画布编辑
- 中间画布区域进行页面布局
- 支持组件拖拽排序
- 组件选中、hover 状态显示

### 3. 属性配置
- 右侧属性面板配置选中组件
- 动态生成属性表单
- 支持多种属性类型（string、number、boolean、select、color）

### 4. 状态管理
- 使用 Pinia 管理编辑器状态
- 支持撤销/重做操作
- 组件树数据结构管理

### 5. 动态渲染
- Renderer 组件动态渲染 Element Plus 组件
- 支持嵌套组件渲染
- 编辑器交互层叠加

## 安装依赖

```bash
cd d:\web\my-app\lowCode
npm install
```

## 开发运行

```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

## 预览生产版本

```bash
npm run preview
```

## 使用说明

1. **添加组件**: 从左侧物料库拖拽组件到中间画布
2. **选中组件**: 点击画布中的组件进行选中
3. **配置属性**: 在右侧属性面板修改选中组件的属性
4. **删除组件**: 在右侧属性面板点击"删除组件"按钮
5. **撤销/重做**: 使用顶部工具栏的撤销/重做按钮

## 扩展开发

### 添加新物料组件

在 `src/store/editor.ts` 的 `materials` 数组中添加新的物料定义：

```typescript
{
  type: 'el-new-component',
  label: '新组件',
  icon: 'new-icon',
  category: '新分类',
  defaultProps: {
    // 默认属性
  },
  schema: [
    // 属性配置 schema
  ],
}
```

### 自定义属性类型

在 `src/components/editor/PropsPanel.vue` 中添加新的属性类型渲染逻辑。

## 注意事项

- Tailwind CSS 的 `preflight` 已禁用，避免与 Element Plus 样式冲突
- Element Plus 采用按需引入方式，减少打包体积
- 组件树使用递归结构，支持无限嵌套

## 后续规划

- [ ] 添加更多 Element Plus 组件支持
- [ ] 实现组件复制/粘贴功能
- [ ] 支持组件样式配置
- [ ] 添加页面模板功能
- [ ] 实现代码导出功能
- [ ] 支持自定义组件库
- [ ] 添加响应式布局支持