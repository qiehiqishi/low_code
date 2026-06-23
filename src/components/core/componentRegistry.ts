import type { Component } from 'vue';

interface ComponentRegistry {
  register: (name: string, component: Component) => void;
  get: (name: string) => Component | null;
  has: (name: string) => boolean;
  getAll: () => Record<string, Component>;
}

const registry: Record<string, Component> = {};

export const componentRegistry: ComponentRegistry = {
  register(name: string, component: Component) {
    registry[name] = component;
  },

  get(name: string): Component | null {
    return registry[name] || null;
  },

  has(name: string): boolean {
    return !!registry[name];
  },

  getAll(): Record<string, Component> {
    return { ...registry };
  },
};

export function registerElementPlusComponents() {
  const components: Record<string, any> = {};

  try {
    const elButton = require('element-plus').ElButton;
    if (elButton) components['el-button'] = elButton;
  } catch (e) {}

  try {
    const elInput = require('element-plus').ElInput;
    if (elInput) components['el-input'] = elInput;
  } catch (e) {}

  try {
    const elCard = require('element-plus').ElCard;
    if (elCard) components['el-card'] = elCard;
  } catch (e) {}

  try {
    const elForm = require('element-plus').ElForm;
    if (elForm) components['el-form'] = elForm;
  } catch (e) {}

  try {
    const elFormItem = require('element-plus').ElFormItem;
    if (elFormItem) components['el-form-item'] = elFormItem;
  } catch (e) {}

  try {
    const elSelect = require('element-plus').ElSelect;
    if (elSelect) components['el-select'] = elSelect;
  } catch (e) {}

  try {
    const elOption = require('element-plus').ElOption;
    if (elOption) components['el-option'] = elOption;
  } catch (e) {}

  try {
    const elCheckbox = require('element-plus').ElCheckbox;
    if (elCheckbox) components['el-checkbox'] = elCheckbox;
  } catch (e) {}

  try {
    const elRadio = require('element-plus').ElRadio;
    if (elRadio) components['el-radio'] = elRadio;
  } catch (e) {}

  try {
    const elRadioGroup = require('element-plus').ElRadioGroup;
    if (elRadioGroup) components['el-radio-group'] = elRadioGroup;
  } catch (e) {}

  try {
    const elSwitch = require('element-plus').ElSwitch;
    if (elSwitch) components['el-switch'] = elSwitch;
  } catch (e) {}

  try {
    const elDatePicker = require('element-plus').ElDatePicker;
    if (elDatePicker) components['el-date-picker'] = elDatePicker;
  } catch (e) {}

  try {
    const elTimePicker = require('element-plus').ElTimePicker;
    if (elTimePicker) components['el-time-picker'] = elTimePicker;
  } catch (e) {}

  try {
    const elRate = require('element-plus').ElRate;
    if (elRate) components['el-rate'] = elRate;
  } catch (e) {}

  try {
    const elRow = require('element-plus').ElRow;
    if (elRow) components['el-row'] = elRow;
  } catch (e) {}

  try {
    const elCol = require('element-plus').ElCol;
    if (elCol) components['el-col'] = elCol;
  } catch (e) {}

  try {
    const elSpace = require('element-plus').ElSpace;
    if (elSpace) components['el-space'] = elSpace;
  } catch (e) {}

  try {
    const elContainer = require('element-plus').ElContainer;
    if (elContainer) components['el-container'] = elContainer;
  } catch (e) {}

  try {
    const elHeader = require('element-plus').ElHeader;
    if (elHeader) components['el-header'] = elHeader;
  } catch (e) {}

  try {
    const elMain = require('element-plus').ElMain;
    if (elMain) components['el-main'] = elMain;
  } catch (e) {}

  try {
    const elAside = require('element-plus').ElAside;
    if (elAside) components['el-aside'] = elAside;
  } catch (e) {}

  try {
    const elFooter = require('element-plus').ElFooter;
    if (elFooter) components['el-footer'] = elFooter;
  } catch (e) {}

  try {
    const elText = require('element-plus').ElText;
    if (elText) components['el-text'] = elText;
  } catch (e) {}

  try {
    const elImage = require('element-plus').ElImage;
    if (elImage) components['el-image'] = elImage;
  } catch (e) {}

  try {
    const elDivider = require('element-plus').ElDivider;
    if (elDivider) components['el-divider'] = elDivider;
  } catch (e) {}

  try {
    const elAlert = require('element-plus').ElAlert;
    if (elAlert) components['el-alert'] = elAlert;
  } catch (e) {}

  try {
    const elTag = require('element-plus').ElTag;
    if (elTag) components['el-tag'] = elTag;
  } catch (e) {}

  try {
    const elBadge = require('element-plus').ElBadge;
    if (elBadge) components['el-badge'] = elBadge;
  } catch (e) {}

  try {
    const elTabs = require('element-plus').ElTabs;
    if (elTabs) components['el-tabs'] = elTabs;
  } catch (e) {}

  try {
    const elTabPane = require('element-plus').ElTabPane;
    if (elTabPane) components['el-tab-pane'] = elTabPane;
  } catch (e) {}

  try {
    const elSteps = require('element-plus').ElSteps;
    if (elSteps) components['el-steps'] = elSteps;
  } catch (e) {}

  try {
    const elStep = require('element-plus').ElStep;
    if (elStep) components['el-step'] = elStep;
  } catch (e) {}

  try {
    const elBreadcrumb = require('element-plus').ElBreadcrumb;
    if (elBreadcrumb) components['el-breadcrumb'] = elBreadcrumb;
  } catch (e) {}

  try {
    const elBreadcrumbItem = require('element-plus').ElBreadcrumbItem;
    if (elBreadcrumbItem) components['el-breadcrumb-item'] = elBreadcrumbItem;
  } catch (e) {}

  try {
    const elTable = require('element-plus').ElTable;
    if (elTable) components['el-table'] = elTable;
  } catch (e) {}

  try {
    const elTableColumn = require('element-plus').ElTableColumn;
    if (elTableColumn) components['el-table-column'] = elTableColumn;
  } catch (e) {}

  try {
    const elTree = require('element-plus').ElTree;
    if (elTree) components['el-tree'] = elTree;
  } catch (e) {}

  try {
    const elPagination = require('element-plus').ElPagination;
    if (elPagination) components['el-pagination'] = elPagination;
  } catch (e) {}

  try {
    const elAvatar = require('element-plus').ElAvatar;
    if (elAvatar) components['el-avatar'] = elAvatar;
  } catch (e) {}

  try {
    const elCascader = require('element-plus').ElCascader;
    if (elCascader) components['el-cascader'] = elCascader;
  } catch (e) {}

  for (const [name, component] of Object.entries(components)) {
    componentRegistry.register(name, component);
  }
}