# 拖拽功能修复测试指南

## 已完成的修复

### 1. 结构修复
- ✅ VueDraggable 包裹整个画布区域（包括空状态）
- ✅ 空状态区域有足够的高度（500px）
- ✅ 添加视觉提示（虚线边框、hover 效果）

### 2. 样式修复
- ✅ ComponentRenderer 包装层改为 `cursor: move`
- ✅ VueDraggable 区域增加到 600px 高度
- ✅ 添加 hover 效果提示可拖拽区域

### 3. 逻辑修复
- ✅ 添加标志位防止无限循环
- ✅ 移除对 saveHistory 的错误调用
- ✅ 使用 v-model 双向绑定

### 4. 调试支持
- ✅ 添加详细的调试日志
- ✅ 监听 start、add、end 事件

## 测试步骤

### 1. 启动项目
```bash
cd d:\web\my-app\low-code-electron
npm run dev
```

### 2. 打开浏览器
访问 http://localhost:5173

### 3. 打开开发者工具
- 按 F12 打开开发者工具
- 切换到 Console 标签页

### 4. 测试拖拽功能

#### 步骤 1：从物料库拖拽组件
- 在左侧物料库找到"按钮"组件
- 点击并开始拖拽
- 观察 Console 输出：
  ```
  克隆物料: 按钮
  生成组件数据: {id: "comp-xxx", componentName: "el-button", ...}
  开始拖拽: {...}
  ```

#### 步骤 2：拖拽到画布区域
- 将组件拖拽到中间画布区域
- 观察画布区域的视觉变化：
  - 边框变为蓝色
  - 背景变为浅蓝色
  - 显示"可放置"提示

#### 步骤 3：放置组件
- 松开鼠标放置组件
- 观察 Console 输出：
  ```
  === 画布拖拽开始 ===
  === 画布添加组件 ===
  事件对象: {...}
  克隆数据: {...}
  === 画布拖拽结束 ===
  检测到新增组件: [...]
  ```

#### 步骤 4：验证组件添加
- 检查画布是否显示新组件
- 检查右侧属性面板是否显示组件属性
- 检查组件是否可以选中

### 5. 测试不同组件
- 测试拖拽"输入框"组件
- 测试拖拽"容器"组件
- 测试拖拽"卡片"组件

## 预期结果

### 成功的拖拽流程

1. **物料库拖拽开始**：
   ```
   克隆物料: 按钮
   生成组件数据: {id: "comp-xxx", componentName: "el-button", ...}
   开始拖拽: {...}
   ```

2. **画布接收拖拽**：
   ```
   === 画布拖拽开始 ===
   事件对象: {...}
   ```

3. **组件添加到画布**：
   ```
   === 画布添加组件 ===
   事件对象: {...}
   克隆数据: {id: "comp-xxx", componentName: "el-button", ...}
   新索引: 0
   ```

4. **拖拽结束**：
   ```
   === 画布拖拽结束 ===
   当前 rootChildren: [{id: "comp-xxx", ...}]
   检测到新增组件: [{id: "comp-xxx", ...}]
   ```

5. **组件成功渲染**：
   - 画布显示按钮组件
   - 右侧属性面板显示按钮属性
   - 组件可以点击选中

## 可能的问题和解决方案

### 问题 1：拖拽时显示禁用图标

**可能原因**：
- VueDraggable 配置不正确
- group 名称不匹配
- CSS 样式干扰

**解决方案**：
- 检查 Console 是否有错误
- 检查 VueDraggable 的 group 配置
- 检查是否有 CSS 样式阻止拖拽

### 问题 2：拖拽后组件不显示

**可能原因**：
- ComponentRenderer 渲染失败
- 组件数据结构错误
- Element Plus 组件未正确导入

**解决方案**：
- 检查 Console 是否有渲染错误
- 检查组件数据是否正确
- 检查 Element Plus 组件是否正确导入

### 问题 3：无限循环错误

**可能原因**：
- watch 监听器相互触发
- 数据同步逻辑错误

**解决方案**：
- 检查标志位是否正确设置
- 检查 watch 的 flush 配置
- 检查数据更新逻辑

### 问题 4：组件无法选中

**可能原因**：
- ComponentRenderer 事件未正确传递
- store 的 selectComponent 方法错误

**解决方案**：
- 检查 ComponentRenderer 的 @select 事件
- 检查 store 的 selectComponent 方法
- 检查事件是否正确冒泡

## 调试技巧

### 1. 检查 VueDraggable 配置
```vue
<!-- 添加更多调试属性 -->
<VueDraggable
  v-model="rootChildren"
  :group="{ name: 'materials' }"
  :animation="200"
  :force-fallback="true"  <!-- 强制使用 fallback 模式 -->
  :fallback-tolerance="5"  <!-- 设置容忍度 -->
>
```

### 2. 检查 DOM 结构
使用浏览器开发者工具：
- 检查 VueDraggable 的 DOM 结构
- 检查是否有 CSS 样式干扰
- 检查拖拽区域是否足够大

### 3. 检查事件触发
在 Console 中观察：
- `handleDragStart` 是否触发
- `handleDragAdd` 是否触发
- `handleDragEnd` 是否触发

### 4. 检查数据变化
在 Console 中观察：
- `rootChildren.value` 是否更新
- `editorStore.components` 是否更新
- 组件数据是否正确

## 关键文件

- [Canvas.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\Canvas.vue) - 画布组件（已修复）
- [MaterialPanel.vue](file:///d:\web\my-app\low-code-electron\src\components\editor\MaterialPanel.vue) - 物料库组件
- [ComponentRenderer.vue](file:///d:\web\my-app\low-code-electron\src\components\core\ComponentRenderer.vue) - 组件渲染器
- [editor.ts](file:///d:\web\my-app\low-code-electron\src\store\editor.ts) - 状态管理

## 总结

如果按照上述步骤测试，应该能够：
1. ✅ 从物料库拖拽组件
2. ✅ 成功添加到画布
3. ✅ 组件正确渲染
4. ✅ 可以选中编辑

如果仍有问题，请检查：
- Console 中的错误信息
- VueDraggable 的事件是否触发
- 数据是否正确更新
- DOM 结构是否正确

祝测试顺利！🎉