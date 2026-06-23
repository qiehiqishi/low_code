import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComponentData, ComponentStyles, MaterialComponent } from '@/types/editor'

/**
 * 低代码编辑器状态管理
 * 使用 Pinia 创建 EditorStore
 */
export const useEditorStore = defineStore('editor', () => {
  // ========== State ==========

  /**
   * 当前页面的组件树数组
   * 根节点为 root，所有组件挂载在 root.children 下
   */
  const components = ref<ComponentData[]>([])

  /**
   * 选中的组件
   */
  const selectedComponent = ref<ComponentData | null>(null)

  /**
   * hover 的组件
   */
  const hoveredComponent = ref<ComponentData | null>(null)

  /**
   * 历史记录（用于撤销/重做）
   */
  const history = ref<ComponentData[][]>([])
  const historyIndex = ref<number>(-1)

  /**
   * 物料库定义
   */
  const materials = ref<MaterialComponent[]>([
    {
      type: 'el-button',
      label: '按钮',
      icon: 'button',
      category: '基础组件',
      defaultProps: {
        type: 'primary',
        size: 'default',
        text: '按钮',
      },
      defaultStyles: {
        width: 'auto',
        height: 'auto',
      },
      schema: [
        { name: 'text', label: '按钮文字', type: 'string', default: '按钮' },
        { name: 'type', label: '类型', type: 'select', default: 'primary', options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' },
        ]},
        { name: 'size', label: '尺寸', type: 'select', default: 'default', options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
        ]},
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
    },
    {
      type: 'el-input',
      label: '输入框',
      icon: 'input',
      category: '表单组件',
      defaultProps: {
        placeholder: '请输入内容',
        size: 'default',
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
      },
      schema: [
        { name: 'placeholder', label: '占位文本', type: 'string', default: '请输入内容' },
        { name: 'size', label: '尺寸', type: 'select', default: 'default', options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
        ]},
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
    },
    {
      type: 'div',
      label: '容器',
      icon: 'container',
      category: '容器组件',
      defaultProps: {},
      defaultStyles: {
        width: '100%',
        height: 'auto',
        padding: '10px',
        backgroundColor: 'transparent',
      },
      schema: [],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'height', label: '高度', type: 'string', default: 'auto' },
        { name: 'padding', label: '内边距', type: 'string', default: '10px' },
        { name: 'backgroundColor', label: '背景色', type: 'color' },
        { name: 'display', label: '显示方式', type: 'select', default: 'block', options: [
          { label: '块级', value: 'block' },
          { label: '行内', value: 'inline' },
          { label: '弹性', value: 'flex' },
          { label: '网格', value: 'grid' },
        ]},
        { name: 'flexDirection', label: 'Flex方向', type: 'select', default: 'row', options: [
          { label: '横向', value: 'row' },
          { label: '纵向', value: 'column' },
        ]},
        { name: 'justifyContent', label: '主轴对齐', type: 'select', default: 'flex-start', options: [
          { label: '起始', value: 'flex-start' },
          { label: '居中', value: 'center' },
          { label: '结束', value: 'flex-end' },
          { label: '均匀分布', value: 'space-between' },
        ]},
        { name: 'alignItems', label: '交叉轴对齐', type: 'select', default: 'stretch', options: [
          { label: '拉伸', value: 'stretch' },
          { label: '起始', value: 'flex-start' },
          { label: '居中', value: 'center' },
          { label: '结束', value: 'flex-end' },
        ]},
        { name: 'gap', label: '间距', type: 'string', default: '10px' },
        { name: 'border', label: '边框', type: 'string', default: 'none' },
        { name: 'borderRadius', label: '圆角', type: 'string', default: '0' },
      ],
      isContainer: true,
    },
    {
      type: 'el-card',
      label: '卡片',
      icon: 'card',
      category: '容器组件',
      defaultProps: {
        shadow: 'always',
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
        padding: '20px',
      },
      schema: [
        { name: 'shadow', label: '阴影显示时机', type: 'select', default: 'always', options: [
          { label: '总是显示', value: 'always' },
          { label: '悬浮显示', value: 'hover' },
          { label: '从不显示', value: 'never' },
        ]},
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'height', label: '高度', type: 'string', default: 'auto' },
        { name: 'padding', label: '内边距', type: 'string', default: '20px' },
        { name: 'backgroundColor', label: '背景色', type: 'color' },
        { name: 'borderRadius', label: '圆角', type: 'string', default: '4px' },
      ],
      isContainer: true,
    },
    {
      type: 'el-select',
      label: '选择器',
      icon: 'select',
      category: '表单组件',
      defaultProps: {
        placeholder: '请选择',
        size: 'default',
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
      },
      schema: [
        { name: 'placeholder', label: '占位文本', type: 'string', default: '请选择' },
        { name: 'size', label: '尺寸', type: 'select', default: 'default', options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
        ]},
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
        { name: 'clearable', label: '可清空', type: 'boolean', default: false },
        { name: 'multiple', label: '多选', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'height', label: '高度', type: 'string', default: 'auto' },
      ],
    },
    {
      type: 'el-checkbox',
      label: '复选框',
      icon: 'checkbox',
      category: '表单组件',
      defaultProps: {
        label: '选项',
      },
      defaultStyles: {
        width: 'auto',
        height: 'auto',
      },
      schema: [
        { name: 'label', label: '标签文字', type: 'string', default: '选项' },
        { name: 'checked', label: '是否选中', type: 'boolean', default: false },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0 8px 0 0' },
      ],
    },
    {
      type: 'el-radio',
      label: '单选框',
      icon: 'radio',
      category: '表单组件',
      defaultProps: {
        label: '选项',
      },
      defaultStyles: {
        width: 'auto',
        height: 'auto',
      },
      schema: [
        { name: 'label', label: '标签文字', type: 'string', default: '选项' },
        { name: 'value', label: '值', type: 'string', default: '' },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0 8px 0 0' },
      ],
    },
    {
      type: 'el-switch',
      label: '开关',
      icon: 'switch',
      category: '表单组件',
      defaultProps: {
        modelValue: false,
      },
      defaultStyles: {
        width: 'auto',
        height: 'auto',
      },
      schema: [
        { name: 'modelValue', label: '是否开启', type: 'boolean', default: false },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
        { name: 'activeText', label: '开启文字', type: 'string', default: '' },
        { name: 'inactiveText', label: '关闭文字', type: 'string', default: '' },
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0' },
      ],
    },
    {
      type: 'el-date-picker',
      label: '日期选择器',
      icon: 'date',
      category: '表单组件',
      defaultProps: {
        type: 'date',
        placeholder: '选择日期',
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
      },
      schema: [
        { name: 'type', label: '类型', type: 'select', default: 'date', options: [
          { label: '日期', value: 'date' },
          { label: '日期时间', value: 'datetime' },
          { label: '年', value: 'year' },
          { label: '月', value: 'month' },
          { label: '周', value: 'week' },
        ]},
        { name: 'placeholder', label: '占位文本', type: 'string', default: '选择日期' },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
        { name: 'clearable', label: '可清空', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
    },
    {
      type: 'el-time-picker',
      label: '时间选择器',
      icon: 'time',
      category: '表单组件',
      defaultProps: {
        placeholder: '选择时间',
      },
      defaultStyles: {
        width: '100%',
        height: 'auto',
      },
      schema: [
        { name: 'placeholder', label: '占位文本', type: 'string', default: '选择时间' },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
        { name: 'clearable', label: '可清空', type: 'boolean', default: false },
        { name: 'isRange', label: '时间范围', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
    },
    {
      type: 'el-rate',
      label: '评分',
      icon: 'rate',
      category: '表单组件',
      defaultProps: {
        modelValue: 0,
        max: 5,
      },
      defaultStyles: {
        width: 'auto',
        height: 'auto',
      },
      schema: [
        { name: 'modelValue', label: '评分值', type: 'number', default: 0 },
        { name: 'max', label: '最大分值', type: 'number', default: 5 },
        { name: 'disabled', label: '禁用状态', type: 'boolean', default: false },
        { name: 'allowHalf', label: '允许半选', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0' },
      ],
    },
    {
      type: 'el-row',
      label: '行布局',
      icon: 'row',
      category: '布局组件',
      defaultProps: {},
      defaultStyles: {
        width: '100%',
        marginBottom: '16px',
      },
      schema: [
        { name: 'gutter', label: '间距', type: 'number', default: 0 },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'marginBottom', label: '底部间距', type: 'string', default: '16px' },
        { name: 'display', label: '显示方式', type: 'select', default: 'flex', options: [
          { label: '弹性', value: 'flex' },
          { label: '块级', value: 'block' },
        ]},
      ],
      isContainer: true,
    },
    {
      type: 'el-col',
      label: '列布局',
      icon: 'col',
      category: '布局组件',
      defaultProps: {
        span: 24,
      },
      defaultStyles: {
        width: 'auto',
      },
      schema: [
        { name: 'span', label: '占据列数', type: 'number', default: 24 },
        { name: 'offset', label: '偏移列数', type: 'number', default: 0 },
        { name: 'pull', label: '向左偏移', type: 'number', default: 0 },
        { name: 'push', label: '向右偏移', type: 'number', default: 0 },
      ],
      styleSchema: [
        { name: 'padding', label: '内边距', type: 'string', default: '0' },
      ],
      isContainer: true,
    },
    {
      type: 'el-space',
      label: '间距',
      icon: 'space',
      category: '布局组件',
      defaultProps: {
        direction: 'horizontal',
        size: 'default',
      },
      defaultStyles: {
        width: '100%',
      },
      schema: [
        { name: 'direction', label: '方向', type: 'select', default: 'horizontal', options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
        ]},
        { name: 'size', label: '间距大小', type: 'select', default: 'default', options: [
          { label: '小', value: 'small' },
          { label: '默认', value: 'default' },
          { label: '大', value: 'large' },
        ]},
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
      isContainer: true,
    },
    {
      type: 'el-text',
      label: '文本',
      icon: 'text',
      category: '显示组件',
      defaultProps: {
        content: '文本内容',
      },
      defaultStyles: {
        fontSize: '14px',
        color: '#303133',
      },
      schema: [
        { name: 'content', label: '文本内容', type: 'string', default: '文本内容' },
        { name: 'type', label: '类型', type: 'select', default: '', options: [
          { label: '默认', value: '' },
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
        ]},
        { name: 'size', label: '尺寸', type: 'select', default: '', options: [
          { label: '默认', value: '' },
          { label: '小', value: 'small' },
          { label: '大', value: 'large' },
        ]},
        { name: 'bold', label: '加粗', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'fontSize', label: '字体大小', type: 'string', default: '14px' },
        { name: 'color', label: '文字颜色', type: 'color' },
        { name: 'textAlign', label: '对齐方式', type: 'select', default: 'left', options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
        ]},
        { name: 'fontWeight', label: '字体粗细', type: 'string', default: 'normal' },
      ],
    },
    {
      type: 'el-divider',
      label: '分割线',
      icon: 'divider',
      category: '显示组件',
      defaultProps: {},
      defaultStyles: {
        width: '100%',
      },
      schema: [
        { name: 'direction', label: '方向', type: 'select', default: 'horizontal', options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
        ]},
        { name: 'contentPosition', label: '文字位置', type: 'select', default: 'center', options: [
          { label: '居中', value: 'center' },
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
        ]},
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '12px 0' },
      ],
    },
    {
      type: 'el-alert',
      label: '警告提示',
      icon: 'alert',
      category: '显示组件',
      defaultProps: {
        title: '提示信息',
        type: 'info',
      },
      defaultStyles: {
        width: '100%',
      },
      schema: [
        { name: 'title', label: '标题', type: 'string', default: '提示信息' },
        { name: 'description', label: '描述', type: 'string', default: '' },
        { name: 'type', label: '类型', type: 'select', default: 'info', options: [
          { label: '信息', value: 'info' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
        ]},
        { name: 'closable', label: '可关闭', type: 'boolean', default: true },
        { name: 'showIcon', label: '显示图标', type: 'boolean', default: true },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'margin', label: '外边距', type: 'string', default: '12px 0' },
      ],
    },
    {
      type: 'el-tag',
      label: '标签',
      icon: 'tag',
      category: '显示组件',
      defaultProps: {
        content: '标签',
        type: 'info',
      },
      defaultStyles: {
        marginRight: '8px',
      },
      schema: [
        { name: 'content', label: '标签内容', type: 'string', default: '标签' },
        { name: 'type', label: '类型', type: 'select', default: 'info', options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' },
        ]},
        { name: 'closable', label: '可关闭', type: 'boolean', default: false },
        { name: 'effect', label: '效果', type: 'select', default: 'light', options: [
          { label: '浅色', value: 'light' },
          { label: '深色', value: 'dark' },
          { label: '纯色', value: 'plain' },
        ]},
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0 8px 0 0' },
      ],
    },
    {
      type: 'el-badge',
      label: '徽标',
      icon: 'badge',
      category: '显示组件',
      defaultProps: {
        value: 0,
      },
      defaultStyles: {
        marginRight: '8px',
      },
      schema: [
        { name: 'value', label: '徽标值', type: 'number', default: 0 },
        { name: 'max', label: '最大值', type: 'number', default: 99 },
        { name: 'isDot', label: '圆点模式', type: 'boolean', default: false },
        { name: 'hidden', label: '隐藏', type: 'boolean', default: false },
        { name: 'type', label: '类型', type: 'select', default: 'danger', options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' },
        ]},
      ],
      styleSchema: [
        { name: 'margin', label: '外边距', type: 'string', default: '0 8px 0 0' },
      ],
    },
    {
      type: 'el-tabs',
      label: '标签页',
      icon: 'tabs',
      category: '导航组件',
      defaultProps: {
        modelValue: '',
      },
      defaultStyles: {
        width: '100%',
      },
      schema: [],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
      isContainer: true,
    },
    {
      type: 'el-steps',
      label: '步骤条',
      icon: 'steps',
      category: '导航组件',
      defaultProps: {
        active: 0,
      },
      defaultStyles: {
        width: '100%',
      },
      schema: [
        { name: 'active', label: '当前步骤', type: 'number', default: 0 },
        { name: 'direction', label: '方向', type: 'select', default: 'horizontal', options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
        ]},
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
      isContainer: true,
    },
    {
      type: 'el-table',
      label: '表格',
      icon: 'table',
      category: '数据组件',
      defaultProps: {},
      defaultStyles: {
        width: '100%',
        height: '300px',
      },
      schema: [
        { name: 'border', label: '边框', type: 'boolean', default: true },
        { name: 'striped', label: '斑马纹', type: 'boolean', default: false },
        { name: 'height', label: '高度', type: 'string', default: '300px' },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'height', label: '高度', type: 'string', default: '300px' },
      ],
      isContainer: true,
    },
    {
      type: 'el-tree',
      label: '树形组件',
      icon: 'tree',
      category: '数据组件',
      defaultProps: {
        data: [],
        props: {
          label: 'label',
          children: 'children',
        },
      },
      defaultStyles: {
        width: '100%',
        height: '300px',
      },
      schema: [
        { name: 'defaultExpandAll', label: '默认展开', type: 'boolean', default: false },
        { name: 'showCheckbox', label: '显示复选框', type: 'boolean', default: false },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'height', label: '高度', type: 'string', default: '300px' },
      ],
      isContainer: false,
    },
    {
      type: 'el-pagination',
      label: '分页',
      icon: 'pagination',
      category: '数据组件',
      defaultProps: {
        total: 100,
        pageSize: 10,
        currentPage: 1,
      },
      defaultStyles: {
        width: '100%',
      },
      schema: [
        { name: 'total', label: '总条数', type: 'number', default: 100 },
        { name: 'pageSize', label: '每页条数', type: 'number', default: 10 },
        { name: 'currentPage', label: '当前页', type: 'number', default: 1 },
        { name: 'layout', label: '布局', type: 'string', default: 'total, sizes, prev, pager, next, jumper' },
      ],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
        { name: 'justifyContent', label: '对齐方式', type: 'select', default: 'flex-end', options: [
          { label: '左对齐', value: 'flex-start' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'flex-end' },
        ]},
      ],
      isContainer: false,
    },
    {
      type: 'el-breadcrumb',
      label: '面包屑',
      icon: 'breadcrumb',
      category: '导航组件',
      defaultProps: {},
      defaultStyles: {
        width: '100%',
      },
      schema: [],
      styleSchema: [
        { name: 'width', label: '宽度', type: 'string', default: '100%' },
      ],
      isContainer: true,
    },
  ])

  // ========== Actions ==========

  /**
   * 初始化组件树
   * 创建一个根容器节点
   */
  const initComponents = () => {
    const rootComponent: ComponentData = {
      id: 'root',
      componentName: 'div',
      label: '根容器',
      props: {},
      styles: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      children: [],
      isContainer: true,
    }

    components.value = [rootComponent]
    history.value = [[rootComponent]]
    historyIndex.value = 0
    selectedComponent.value = null
    hoveredComponent.value = null
  }

  /**
   * 添加组件到指定父组件下
   * @param component 新组件数据
   * @param parentId 父组件ID（默认为 'root'）
   */
  const addComponent = (component: ComponentData, parentId: string = 'root') => {
    const parent = findComponentById(parentId)
    if (!parent) {
      console.error(`父组件 ${parentId} 不存在`)
      return
    }

    if (!parent.isContainer) {
      console.error(`组件 ${parentId} 不是容器，无法添加子组件`)
      return
    }

    // 设置父组件ID
    component.parentId = parentId

    // 初始化 children 数组（如果不存在）
    if (!parent.children) {
      parent.children = []
    }

    // 添加到父组件的 children 数组
    parent.children.push(component)

    // 保存历史记录
    saveHistory()
  }

  /**
   * 删除指定组件
   * @param id 要删除的组件ID
   */
  const deleteComponent = (id: string) => {
    if (id === 'root') {
      console.error('不能删除根组件')
      return
    }

    const parent = findParentComponentById(id)
    if (!parent) {
      console.error(`找不到组件 ${id} 的父组件`)
      return
    }

    // 从父组件的 children 数组中删除
    if (parent.children) {
      parent.children = parent.children.filter(child => child.id !== id)
    }

    // 如果删除的是选中的组件，清空选中状态
    if (selectedComponent.value?.id === id) {
      selectedComponent.value = null
    }

    // 如果删除的是 hover 的组件，清空 hover 状态
    if (hoveredComponent.value?.id === id) {
      hoveredComponent.value = null
    }

    // 保存历史记录
    saveHistory()
  }

  /**
   * 更新组件属性
   * @param id 组件ID
   * @param newProps 新的属性对象
   */
  const updateComponentProps = (id: string, newProps: Record<string, any>) => {
    const component = findComponentById(id)
    if (!component) {
      console.error(`组件 ${id} 不存在`)
      return
    }

    // 合并属性（保留原有属性，更新新属性）
    component.props = { ...component.props, ...newProps }

    // 保存历史记录
    saveHistory()
  }

  /**
   * 更新组件样式
   * @param id 组件ID
   * @param newStyles 新的样式对象
   */
  const updateComponentStyles = (id: string, newStyles: ComponentStyles) => {
    const component = findComponentById(id)
    if (!component) {
      console.error(`组件 ${id} 不存在`)
      return
    }

    // 合并样式（保留原有样式，更新新样式）
    component.styles = { ...component.styles, ...newStyles }

    // 保存历史记录
    saveHistory()
  }

  /**
   * 根据 ID 查找组件（递归查找）
   * @param id 组件ID
   * @returns 找到的组件或 null
   */
  const findComponentById = (id: string): ComponentData | null => {
    // 从根节点开始递归查找
    for (const root of components.value) {
      const found = findComponentRecursive(root, id)
      if (found) return found
    }
    return null
  }

  /**
   * 递归查找组件
   * @param node 当前节点
   * @param id 目标ID
   * @returns 找到的组件或 null
   */
  const findComponentRecursive = (node: ComponentData, id: string): ComponentData | null => {
    // 如果当前节点就是目标节点
    if (node.id === id) return node

    // 递归查找子节点
    if (node.children) {
      for (const child of node.children) {
        const found = findComponentRecursive(child, id)
        if (found) return found
      }
    }

    return null
  }

  /**
   * 查找父组件
   * @param childId 子组件ID
   * @returns 父组件或 null
   */
  const findParentComponentById = (childId: string): ComponentData | null => {
    // 从根节点开始递归查找
    for (const root of components.value) {
      const found = findParentRecursive(root, childId)
      if (found) return found
    }
    return null
  }

  /**
   * 递归查找父组件
   * @param node 当前节点
   * @param childId 子组件ID
   * @returns 父组件或 null
   */
  const findParentRecursive = (node: ComponentData, childId: string): ComponentData | null => {
    // 检查当前节点的 children 是否包含目标子组件
    if (node.children?.some(child => child.id === childId)) {
      return node
    }

    // 递归查找子节点
    if (node.children) {
      for (const child of node.children) {
        const found = findParentRecursive(child, childId)
        if (found) return found
      }
    }

    return null
  }

  /**
   * 选中组件
   * @param component 要选中的组件
   */
  const selectComponent = (component: ComponentData | null) => {
    selectedComponent.value = component
  }

  /**
   * hover 组件
   * @param component hover 的组件
   */
  const hoverComponent = (component: ComponentData | null) => {
    hoveredComponent.value = component
  }

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

  /**
   * 移动组件到新位置（调整兄弟层级）
   * @param componentId 要移动的组件ID
   * @param targetParentId 目标父组件ID
   * @param targetIndex 目标位置索引
   */
  const moveComponent = (componentId: string, targetParentId: string, targetIndex: number) => {
    if (componentId === 'root') {
      console.error('不能移动根组件')
      return
    }

    const component = findComponentById(componentId)
    if (!component) {
      console.error(`组件 ${componentId} 不存在`)
      return
    }

    const sourceParent = findParentComponentById(componentId)
    if (!sourceParent) {
      console.error(`找不到组件 ${componentId} 的父组件`)
      return
    }

    const targetParent = findComponentById(targetParentId)
    if (!targetParent) {
      console.error(`目标父组件 ${targetParentId} 不存在`)
      return
    }

    if (!targetParent.isContainer) {
      console.error(`组件 ${targetParentId} 不是容器`)
      return
    }

    if (sourceParent.children) {
      sourceParent.children = sourceParent.children.filter(child => child.id !== componentId)
    }

    component.parentId = targetParentId

    if (!targetParent.children) {
      targetParent.children = []
    }

    const finalIndex = Math.max(0, Math.min(targetIndex, targetParent.children.length))
    targetParent.children.splice(finalIndex, 0, component)

    saveHistory()
  }

  /**
   * 调整组件在兄弟中的顺序（上移）
   * @param componentId 组件ID
   */
  const moveComponentUp = (componentId: string) => {
    const parent = findParentComponentById(componentId)
    if (!parent || !parent.children) return

    const index = parent.children.findIndex(child => child.id === componentId)
    if (index > 0) {
      const temp = parent.children[index]
      parent.children[index] = parent.children[index - 1]
      parent.children[index - 1] = temp
      saveHistory()
    }
  }

  /**
   * 调整组件在兄弟中的顺序（下移）
   * @param componentId 组件ID
   */
  const moveComponentDown = (componentId: string) => {
    const parent = findParentComponentById(componentId)
    if (!parent || !parent.children) return

    const index = parent.children.findIndex(child => child.id === componentId)
    if (index < parent.children.length - 1) {
      const temp = parent.children[index]
      parent.children[index] = parent.children[index + 1]
      parent.children[index + 1] = temp
      saveHistory()
    }
  }

  /**
   * 克隆组件
   * @param componentId 要克隆的组件ID
   */
  const cloneComponent = (componentId: string) => {
    if (componentId === 'root') {
      console.error('不能克隆根组件')
      return
    }

    const component = findComponentById(componentId)
    if (!component) {
      console.error(`组件 ${componentId} 不存在`)
      return
    }

    const parent = findParentComponentById(componentId)
    if (!parent) {
      console.error(`找不到组件 ${componentId} 的父组件`)
      return
    }

    const cloned: ComponentData = JSON.parse(JSON.stringify(component))
    cloned.id = generateId()
    cloned.label = `${component.label} (克隆)`
    
    if (!parent.children) {
      parent.children = []
    }

    const index = parent.children.findIndex(child => child.id === componentId)
    parent.children.splice(index + 1, 0, cloned)

    saveHistory()
  }

  /**
   * 更新组件事件
   * @param id 组件ID
   * @param events 事件配置对象
   */
  const updateComponentEvents = (id: string, events: Record<string, string>) => {
    const component = findComponentById(id)
    if (!component) {
      console.error(`组件 ${id} 不存在`)
      return
    }

    if (!component.events) {
      component.events = {}
    }
    
    component.events = { ...component.events, ...events }

    saveHistory()
  }

  /**
   * 调整组件大小
   * @param id 组件ID
   * @param width 新宽度
   * @param height 新高度
   */
  const adjustComponentSize = (id: string, width: string, height: string) => {
    const component = findComponentById(id)
    if (!component) {
      console.error(`组件 ${id} 不存在`)
      return
    }

    component.styles.width = width
    component.styles.height = height

    saveHistory()
  }

  /**
   * 保存历史记录（用于撤销/重做）
   */
  const saveHistory = () => {
    // 删除当前索引之后的历史记录
    history.value = history.value.slice(0, historyIndex.value + 1)

    // 添加当前状态到历史记录（深拷贝）
    history.value.push(JSON.parse(JSON.stringify(components.value)))
    historyIndex.value = history.value.length - 1
  }

  /**
   * 撤销操作
   */
  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      components.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      selectedComponent.value = null
      hoveredComponent.value = null
    }
  }

  /**
   * 重做操作
   */
  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      components.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      selectedComponent.value = null
      hoveredComponent.value = null
    }
  }

  // ========== Computed ==========

  /**
   * 是否可以撤销
   */
  const canUndo = computed(() => historyIndex.value > 0)

  /**
   * 是否可以重做
   */
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  /**
   * 获取所有组件（扁平化）
   */
  const allComponents = computed(() => {
    const result: ComponentData[] = []
    const flatten = (node: ComponentData) => {
      result.push(node)
      if (node.children) {
        node.children.forEach(child => flatten(child))
      }
    }
    components.value.forEach(root => flatten(root))
    return result
  })

  /**
   * 获取组件数量
   */
  const componentCount = computed(() => allComponents.value.length)

  // ========== Return ==========

  return {
    // State
    components,
    selectedComponent,
    hoveredComponent,
    history,
    historyIndex,
    materials,

    // Actions
    initComponents,
    addComponent,
    deleteComponent,
    updateComponentProps,
    updateComponentStyles,
    findComponentById,
    selectComponent,
    hoverComponent,
    lockComponent,
    unlockComponent,
    moveComponent,
    moveComponentUp,
    moveComponentDown,
    adjustComponentSize,
    undo,
    redo,

    // Computed
    canUndo,
    canRedo,
    allComponents,
    componentCount,
  }
})