import React, { useEffect } from "react";
import { Layout, Menu, Calendar, Checkbox, Avatar, Typography, Input, Popover, TimePicker, Button, Switch, Dropdown, Modal } from "antd";
import { CalendarOutlined, ClockCircleOutlined, AppstoreOutlined, EnvironmentOutlined, CheckSquareOutlined, BellOutlined, RedoOutlined, SettingOutlined, LineChartOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, DeleteOutlined } from "@ant-design/icons";
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import 'bytemd/dist/index.css';
import "./assets/styles/App.css";
import "./assets/styles/MainNav.css";
import { StorageService } from './services/storage';
import { Todo } from './types/todo';
const { Sider, Content } = Layout;
const { Title } = Typography;

const plugins = [gfm()];

/**
 * App 组件是整个待办事项应用的主入口，负责管理应用的状态和渲染内容。
 * 
 * 该组件使用多个状态来跟踪用户的选择和待办事项，包括：
 * - selectedMenuTitle: 当前选中的菜单标题
 * - selectedDate: 用户选择的日期
 * - selectedTime: 用户选择的时间
 * - reminder: 是否设置提醒
 * - repeat: 是否设置重复
 * - popoverVisible: 日期选择器的可见性
 * - selectedNav: 当前选中的导航项
 * - inputValue: 输入框的值
 * - todos: 待办事项列表
 * - menuCollapsed: 菜单是否折叠
 * - modalVisible: 编辑待办事项的模态框可见性
 * - selectedTodo: 当前选中的待办事项
 * - clickPosition: 点击位置，用于模态框定位
 * 
 * 该组件还包含多个副作用，用于初始化存储服务、加载和保存待办事项。
 * 
 * @returns {JSX.Element} 返回应用的主界面
 */
const App: React.FC = () => {
  const [selectedMenuTitle, setSelectedMenuTitle] = React.useState("今天");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<any>(null);
  const [reminder, setReminder] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);
  const [popoverVisible, setPopoverVisible] = React.useState(false);
  const [selectedNav, setSelectedNav] = React.useState("1");
  const [inputValue, setInputValue] = React.useState("");
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [menuCollapsed, setMenuCollapsed] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [clickPosition, setClickPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [reminderOptions, setReminderOptions] = React.useState<string[]>([]);
  const [reminderPopoverVisible, setReminderPopoverVisible] = React.useState(false);
  const [timePickerFocused, setTimePickerFocused] = React.useState(false);
  const [repeatPopoverVisible, setRepeatPopoverVisible] = React.useState(false);

  // 初始化StorageService并从本地存储加载待办事项
  useEffect(() => {
    /**
     * 初始化存储并加载待办事项。
     * 该函数首先调用 StorageService 的初始化方法，
     * 然后从存储中加载已保存的待办事项，并更新状态。
     */
    const initStorage = async () => {
      await StorageService.init();
      const savedTodos = await StorageService.loadTodos();
      setTodos(savedTodos);
    };
    initStorage();
  }, []);

  // 当待办事项变更时保存到本地存储
  useEffect(() => {
    if (todos.length > 0) {
      StorageService.saveTodos(todos);
    }
  }, [todos]);

  /**
   * 添加新的待办事项。
   * 
   * 此函数会检查输入值是否为空，如果不为空，则创建一个新的待办事项对象并将其添加到待办事项列表中。
   * 新的待办事项包含唯一的 ID、内容、日期、时间、提醒、重复状态以及完成和删除状态。
   * 添加后，重置输入值、日期、时间、提醒和重复状态，并隐藏弹出框。
   */
  const addTodo = () => {
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      date: selectedDate || new Date(),
      time: selectedTime,
      reminder,
      reminderOptions: reminderOptions.length > 0 ? [...reminderOptions] : undefined,
      repeat,
      completed: false,
      deleted: false
    };

    setTodos(prev => [...prev, newTodo]);
    setInputValue("");
    setSelectedDate(null);
    setSelectedTime(null);
    setReminder(false);
    setReminderOptions([]);
    setRepeat(false);
    setPopoverVisible(false);
  };

  /**
   * 检查给定的日期是否为今天。
   * 
   * @param date - 要检查的日期对象。
   * @returns 如果给定的日期是今天，则返回 true；否则返回 false。
   */
  const isToday = (date: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  /**
   * 检查给定日期是否在未来7天内。
   * 
   * @param date - 要检查的日期对象。
   * @returns 如果日期在今天之后且在未来7天内，则返回true；否则返回false。
   */
  const isWithinNext7Days = (date: Date) => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    return date > today && date <= next7Days;
  };

  /**
   * 根据选定的菜单标题获取待办事项列表。
   * 
   * @returns {Array} 过滤后的待办事项数组，依据所选菜单标题的不同，返回不同条件下的待办事项。
   * - "今天": 返回今天的未删除且未完成的待办事项。
   * - "最近7天": 返回未来7天内的未删除且未完成的待办事项。
   * - "收集箱": 返回所有未删除且未完成的待办事项。
   * - "已完成": 返回所有已完成的待办事项。
   * - "垃圾桶": 返回所有已删除的待办事项。
   * - 默认: 返回空数组。
   */
  const getTodosByDate = () => {
    switch (selectedMenuTitle) {
      case "今天":
        return todos.filter(todo => !todo.deleted && !todo.completed && (!todo.date || isToday(todo.date)));
      case "最近7天":
        return todos.filter(todo => !todo.deleted && !todo.completed && todo.date && isWithinNext7Days(todo.date));
      case "收集箱":
        return todos.filter(todo => !todo.deleted && !todo.completed);
      case "已完成":
        return todos.filter(todo => !todo.deleted && todo.completed);
      case "垃圾桶":
        return todos.filter(todo => todo.deleted);
      default:
        return [];
    }
  };

  const getReminderDisplayText = () => {
    if (reminderOptions.length === 0) return "提醒";
    
    // 创建一个映射，将选项值转换为显示文本
    const optionMap: {[key: string]: string} = {
      'onTime': '准时',
      '5min': '提前5分钟',
      '30min': '提前30分钟',
      '1hour': '提前1小时',
      '1day': '提前1天',
      'custom': '自定义'
    };
    
    // 获取选中选项的显示文本
    const selectedTexts = reminderOptions.map(option => optionMap[option] || option);
    
    // 如果选项太多，使用省略号
    const displayText = selectedTexts.join('; ');
    if (displayText.length > 15) {
      return displayText.substring(0, 12) + '...';
    }
    return displayText;
  };

  const reminderContent = (
    <div style={{ width: 300, backgroundColor: '#fff' }}>
      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {[
          { value: 'onTime', label: '准时' },
          { value: '5min', label: '提前 5 分钟' },
          { value: '30min', label: '提前 30 分钟' },
          { value: '1hour', label: '提前 1 小时' },
          { value: '1day', label: '提前 1 天' },
          { value: 'custom', label: '自定义' }
        ].map(option => (
          <div 
            key={option.value}
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={() => {
              const newOptions = [...reminderOptions];
              const index = newOptions.indexOf(option.value);
              if (index >= 0) {
                newOptions.splice(index, 1);
              } else {
                newOptions.push(option.value);
              }
              setReminderOptions(newOptions);
            }}
          >
            <span>{option.label}</span>
            {reminderOptions.includes(option.value) && (
              <span style={{ color: '#1677ff' }}>✓</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Button onClick={() => {
          setReminderOptions([]);
          setReminderPopoverVisible(false);
        }}>取消</Button>
        <Button type="primary" onClick={() => {
          setReminder(reminderOptions.length > 0);
          setReminderPopoverVisible(false);
        }}>确定</Button>
      </div>
    </div>
  );

  const datePickerContent = (
    <div style={{ width: 300 }}>
      <Calendar fullscreen={false} onChange={(date) => setSelectedDate(date.toDate())} />
      <div style={{ padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClockCircleOutlined />
          <div style={{ flex: 1 }}>
            <TimePicker
              format="HH:mm"
              placeholder="选择时间"
              value={selectedTime}
              onChange={setSelectedTime}
              style={{ 
                width: '100%',
              }}
              popupStyle={{ 
                padding: '0',
                boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
                backgroundColor: '#fff',
                zIndex: 1050
              }}
              dropdownClassName="time-picker-dropdown"
              getPopupContainer={(triggerNode) => triggerNode.parentNode ? triggerNode.parentNode as HTMLElement : document.body}
              bordered={false}
              inputReadOnly={true}
              suffixIcon={null}
              onFocus={() => setTimePickerFocused(true)}
              onBlur={() => setTimePickerFocused(false)}
              open={timePickerFocused}
              onOpenChange={(open) => setTimePickerFocused(open)}
            />
          </div>
          <span style={{ color: '#bfbfbf', cursor: 'pointer', width: '20px', textAlign: 'center' }} onClick={() => setTimePickerFocused(!timePickerFocused)}>
            {timePickerFocused ? '▼' : '▶'}
          </span>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              flex: 1
            }}
            onClick={() => setReminderPopoverVisible(!reminderPopoverVisible)}
          >
            <BellOutlined />
            <span style={{ 
              color: reminderOptions.length > 0 ? '#1677ff' : 'inherit',
              fontWeight: reminderOptions.length > 0 ? 'bold' : 'normal'
            }}>
              {getReminderDisplayText()}
            </span>
          </div>
          <Popover
            content={reminderContent}
            trigger="click"
            open={reminderPopoverVisible}
            onOpenChange={setReminderPopoverVisible}
            placement="right"
            overlayStyle={{ 
              zIndex: 1060,
              backgroundColor: '#fff'
            }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode ? triggerNode.parentNode as HTMLElement : document.body}
          >
            <span style={{ color: '#bfbfbf', cursor: 'pointer', width: '20px', textAlign: 'center' }}>
              {reminderPopoverVisible ? '▼' : '▶'}
            </span>
          </Popover>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              flex: 1
            }}
            onClick={() => setRepeatPopoverVisible(!repeatPopoverVisible)}
          >
            <RedoOutlined />
            <span>重复</span>
          </div>
          <span style={{ color: '#bfbfbf', cursor: 'pointer', width: '20px', textAlign: 'center' }}>
            {repeatPopoverVisible ? '▼' : '▶'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <Button onClick={() => {
            setSelectedDate(null);
            setSelectedTime(null);
            setReminder(false);
            setReminderOptions([]);
            setRepeat(false);
          }}>清除</Button>
          <Button type="primary" onClick={() => {
            setPopoverVisible(false);
            addTodo();
          }}>确定</Button>
        </div>
      </div>
    </div>
  );

  const [editingTodoContent, setEditingTodoContent] = React.useState("");

  /**
   * 处理待办事项内容的编辑。
   * 
   * @param todo - 要编辑的待办事项对象。
   * @param newContent - 新的待办事项内容。
   * 
   * 如果新的内容为空字符串或仅包含空格，则不进行任何操作。
   * 否则，更新对应待办事项的内容为新的内容。
   */
  const handleTodoContentEdit = (todo: Todo, newContent: string) => {
    if (!newContent.trim()) return;
    setTodos(prev => prev.map(item => 
      item.id === todo.id ? { ...item, content: newContent.trim() } : item
    ));
  };

  /**
   * 处理待办事项的点击事件。
   * 
   * @param todo - 被点击的待办事项对象。
   * @param event - 触发事件的鼠标事件对象。
   * 
   * 当用户点击待办事项时，记录点击位置、设置选中的待办事项、更新编辑内容，并显示模态框。
   */
  const handleTodoClick = (todo: Todo, event: React.MouseEvent) => {
    if (event.type === 'click') {
      setClickPosition({ x: event.clientX, y: event.clientY });
      setSelectedTodo(todo);
      setEditingTodoContent(todo.content);
      // 显示模态框
      console.log("显示模态框");
      setModalVisible(true);
    }
  };

  /**
   * 渲染应用的主要内容，根据选中的导航项动态显示不同的组件。
   * 
   * 当选中的导航项为 "2" 时，显示全屏日历组件；否则，显示待办事项和习惯列表。
   * 
   * 包含以下功能：
   * - 添加待办事项
   * - 显示今日待办事项
   * - 支持待办事项的删除和状态切换
   * - 显示习惯列表
   * - 弹出模态框编辑待办事项内容
   * 
   * @returns {JSX.Element} 渲染的内容组件
   */
  const renderContent = () => {
    if (selectedNav === "2") {
      return (
        <div style={{ padding: "20px", height: "100%", overflow: "auto" }}>
          <Calendar 
            fullscreen={true} 
            style={{ 
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
            }} 
          />
        </div>
      );
    }

    return (
      <Content style={{ padding: "20px", backgroundColor: "#fff", height: "100%", overflow: "auto" }}>
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          {selectedNav === "1" && (
            <Button 
              type="text" 
              icon={menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setMenuCollapsed(!menuCollapsed)}
              style={{ padding: 0 }}
            />
          )}
          <Title level={3} style={{ margin: 0 }}>{selectedMenuTitle}</Title>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            {selectedMenuTitle !== "已完成" && selectedMenuTitle !== "垃圾桶" && (
              <Input 
                placeholder="添加待办事项" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={addTodo}
                style={{ marginBottom: "20px", height: '32px' }} 
                suffix={
                  <Popover 
                    content={datePickerContent}
                    trigger="click"
                    placement="bottomRight"
                    open={popoverVisible}
                    onOpenChange={setPopoverVisible}
                  >
                    <CalendarOutlined 
                      style={{ cursor: 'pointer' }} 
                      className="calendar-icon" 
                    />
                  </Popover>
                }
              />
            )}
            
            <div style={{ marginBottom: "20px" }}>
              <Title level={4}>
                {selectedMenuTitle === "已完成" ? "" : 
                 selectedMenuTitle === "垃圾桶" ? "" : "今日待办"}
              </Title>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {getTodosByDate()
                  .sort((a, b) => {
                    // 已完成和垃圾桶视图按时间倒序排列
                    return (selectedMenuTitle === "已完成" || selectedMenuTitle === "垃圾桶") ? 
                      parseInt(b.id) - parseInt(a.id) : 0;
                  })
                  .map(todo => (
                    <div 
                      key={todo.id} 
                      data-todo-id={todo.id}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        padding: "8px", 
                        borderRadius: "4px", 
                        backgroundColor: "#f9f9f9", 
                        marginBottom: "4px",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      onClick={(e) => handleTodoClick(todo, e)}
                    >
                      <Dropdown menu={{ items: [
                        {
                          key: 'delete',
                          label: '删除',
                          icon: <DeleteOutlined />,
                          onClick: (info) => {
                            console.log("删除待办事项");
                            if (info && info.domEvent) {
                              info.domEvent.stopPropagation();
                            }
                            setTodos(prev => prev.map(item =>
                              item.id === todo.id ? { ...item, deleted: true } : item
                            ));
                          }
                        }
                      ]}} trigger={['contextMenu']}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                          <Checkbox 
                            checked={todo.completed}
                            onClick={(e) => {
                              e.nativeEvent.stopImmediatePropagation();
                              e.stopPropagation();
                            }}
                            onChange={(e) => {
                              e.nativeEvent.stopImmediatePropagation();
                              setTodos(prev => prev.map(item => 
                                item.id === todo.id ? { ...item, completed: e.target.checked } : item
                              ));
                              e.stopPropagation();
                            }}
                          >{todo.content}</Checkbox>
                        </div>
                      </Dropdown>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#666" }}>
                        {todo.date && (
                          <span>
                            {isToday(todo.date) ? "今天" : todo.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {todo.time && <span>{todo.time.format("HH:mm")}</span>}
                        {todo.reminder && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <BellOutlined style={{ fontSize: "14px" }} />
                          </span>
                        )}
                        {todo.repeat && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <RedoOutlined style={{ fontSize: "14px" }} />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {selectedMenuTitle !== "已完成" && selectedMenuTitle !== "垃圾桶" && (
              <div>
                <Title level={4}>习惯</Title>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Checkbox>锻炼身体</Checkbox>
                  <Checkbox>早睡早起</Checkbox>
                  <Checkbox>喝水</Checkbox>
                </div>
              </div>
            )}
          </div>
          <div style={{ width: 300 }}>
            <Calendar fullscreen={false} style={{ border: "1px solid #f0f0f0", borderRadius: 8 }} />
          </div>
        </div>
        
        <Modal
          title={selectedTodo ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>
                {selectedTodo.date?.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                {selectedTodo.time && ` ${selectedTodo.time.format("HH:mm")}`}
              </span>
            </div>
          ) : null}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setClickPosition(null);
          }}
          footer={null}
          width={400}
          mask={false}
          closable={false}
          animation={false}
          transitionName=""
          style={{
            position: 'fixed',
            left: clickPosition?.x,
            top: clickPosition?.y,
            margin: 0
          }}
          getContainer={() => document.body}
        >
          <div style={{ padding: "16px 0" }}>
            {selectedTodo && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "16px" }}>
                  <Editor
                    value={editingTodoContent}
                    plugins={plugins}
                    onChange={(v) => {
                      setEditingTodoContent(v);
                      if (selectedTodo) {
                        handleTodoContentEdit(selectedTodo, v);
                        setSelectedTodo(prev => prev ? { ...prev, content: v.trim() } : null);
                      }
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "16px", color: "#666" }}>
                  {selectedTodo.reminder && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <BellOutlined />
                      <span>提醒</span>
                    </div>
                  )}
                  {selectedTodo.repeat && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <RedoOutlined />
                      <span>重复</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </Content>
    );
  };

  return (
    <Layout style={{ minHeight: "98vh" }}>
      <Sider theme="light" width={80} style={{ borderRight: "1px solid #f0f0f0" }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedNav]}
          items={[
            { key: "0", icon: <Dropdown menu={{ items: [
              { key: 'setting', label: '设置', icon: <SettingOutlined /> },
              { key: 'stats', label: '统计', icon: <LineChartOutlined /> },
              { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> }
            ]}} trigger={['click']}>
              <Avatar size={24} style={{ backgroundColor: '#396cd8', cursor: 'pointer' }}>U</Avatar>
            </Dropdown>, title: "用户" },
            { key: "1", icon: <CheckSquareOutlined />, title: "任务" },
            { key: "2", icon: <CalendarOutlined />, title: "日历" },
            { key: "3", icon: <AppstoreOutlined />, title: "四象限" },
            { key: "4", icon: <ClockCircleOutlined />, title: "番茄专注" },
            { key: "5", icon: <EnvironmentOutlined />, title: "习惯打卡" }
          ]}
          className="main-nav"
          onClick={({ key }) => {
            if (key !== "0") {
              setSelectedNav(key);
            }
          }}
          style={{ height: "100%", borderRight: 0 }}
        />
      </Sider>
      <Layout>
        {selectedNav === "1" && (
          <Sider theme="light" width={menuCollapsed ? 0 : 240} style={{ borderRight: "1px solid #f0f0f0" }}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              items={[
                { key: "1", label: "今天" },
                { key: "2", label: "最近7天" },
                { key: "3", label: "收集箱" },
                { type: "divider" },
                { key: "4", label: "已完成" },
                { key: "5", label: "垃圾桶" }
              ]}
              onClick={({ key }) => {
                const menuItems = [
                  { key: "1", label: "今天" },
                  { key: "2", label: "最近7天" },
                  { key: "3", label: "收集箱" },
                  { key: "4", label: "已完成" },
                  { key: "5", label: "垃圾桶" }
                ];
                const selectedItem = menuItems.find(i => i.key === key);
                setSelectedMenuTitle(selectedItem?.label || "今天");
              }}
              style={{ height: "100%", borderRight: 0 }}
            />
          </Sider>
        )}
        <Layout style={{ height: "100%" }}>
          {renderContent()}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
