# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Develop

安装依赖及开发运行

```bash
pnpm install
pnpm tauri dev
```

## 组件库说明

 组件库说明表格
| 组件名 | 说明 |
| --- | --- |
| [@tauri-apps/api](https://tauri.app/v1/api/js/) | Tauri API 客户端 |
| [@tauri-apps/plugin-opener](https://tauri.app/v1/api/plugins/opener/) | Tauri 插件，用于打开外部链接和文件 |
| [@tauri-apps/plugin-store](https://tauri.app/v1/api/plugins/store/) | Tauri 插件，提供持久化存储功能 |
| [react](https://react.dev/) | 用于构建用户界面的 JavaScript 库 |
| [react-dom](https://react.dev/) | React 的 DOM 绑定 |
| [antd](https://ant.design/) | 企业级 UI 设计语言和 React 组件库 |
| [@ant-design/icons](https://ant.design/components/icon) | Ant Design 图标库 |
| [bytemd](https://github.com/pd4d10/bytemd) | Markdown 编辑器组件 |
| [@bytemd/plugin-gfm](https://github.com/pd4d10/bytemd) | ByteMD 的 GitHub Flavored Markdown 插件 |
| [@bytemd/react](https://github.com/pd4d10/bytemd) | ByteMD 的 React 组件 |
| [dayjs](https://day.js.org/) | 轻量的日期处理库 |
| [zustand](https://zustand-demo.pmnd.rs/) | 简单的状态管理库 |



# 滴答清单轻量版页面布局分析

从 `App.tsx` 文件中可以看出，这是一个类似滴答清单的任务管理应用，使用 React 和 Ant Design 构建。下面是页面布局的详细分析：

## 整体布局结构

整个应用采用 Ant Design 的 `Layout` 组件构建，形成了三栏式布局：

### 1. 主导航栏 (左侧第一栏)

```
<Sider theme="light" width={80} style={{ borderRight: "1px solid #f0f0f0" }}>
```

- 固定宽度为 80px 的侧边栏
- 包含用户头像和主要功能图标
- 功能模块包括：
  - 用户头像（点击显示下拉菜单）
  - 任务（默认选中）
  - 日历
  - 四象限
  - 番茄专注
  - 习惯打卡

### 2. 二级导航栏 (左侧第二栏)

```
<Sider theme="light" width={menuCollapsed ? 0 : 240} style={{ borderRight: "1px solid #f0f0f0" }}>
```

- 宽度为 240px，可折叠
- 仅在"任务"模块（selectedNav === "1"）时显示
- 包含任务分类：
  - 今天
  - 最近7天
  - 收集箱
  - 已完成
  - 垃圾桶

### 3. 主内容区 (右侧)

```
<Layout style={{ height: "100%" }}>
  {renderContent()}
</Layout>
```

主内容区根据选择的导航项显示不同内容：

#### 任务视图 (selectedNav === "1")
- 顶部：标题栏（显示当前选中的任务分类）
- 中部：分为两列
  - 左侧：
    - 任务输入框（带日历图标）
    - 今日待办列表（显示符合当前筛选条件的任务）
    - 习惯列表
  - 右侧：
    - 小型日历组件（宽度 300px）
- 点击任务时弹出编辑模态框

#### 日历视图 (selectedNav === "2")
- 全屏日历组件

## 交互元素

1. **任务输入区**
   - 文本输入框
   - 日历图标（点击打开日期选择弹出框）
   - 日期选择弹出框包含：
     - 日历选择器
     - 时间选择器
     - 提醒开关
     - 重复开关

2. **任务项**
   - 复选框（标记完成/未完成）
   - 任务内容
   - 日期/时间信息
   - 提醒/重复图标
   - 右键菜单（删除选项）
   - 点击打开编辑模态框

3. **任务编辑模态框**
   - Markdown 编辑器（使用 ByteMD）
   - 任务属性显示（提醒、重复）

4. **折叠按钮**
   - 用于折叠/展开二级导航栏

## 响应式设计

- 应用窗口最小尺寸为 985x700（从 tauri.conf.json 可知）
- 二级导航栏可折叠，提高小屏幕上的可用空间
- 主内容区采用弹性布局，适应不同屏幕尺寸

## 视觉风格

- 整体采用 Ant Design 的设计语言
- 浅色主题（theme="light"）
- 简洁的边框和分隔线
- 任务项使用卡片式设计，有轻微背景色区分


