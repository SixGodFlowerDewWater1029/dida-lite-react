import React from "react";
import { Layout, Menu, Calendar, Checkbox, Avatar, Typography, Input, Popover, TimePicker, Button, Switch, Dropdown, Modal } from "antd";
import { CalendarOutlined, ClockCircleOutlined, AppstoreOutlined, EnvironmentOutlined, CheckSquareOutlined, BellOutlined, RedoOutlined, SettingOutlined, LineChartOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import 'bytemd/dist/index.css';
import "./assets/styles/App.css";
import "./assets/styles/MainNav.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface Todo {
  id: string;
  content: string;
  date: Date | null;
  time: any;
  reminder: boolean;
  repeat: boolean;
}

const plugins = [gfm()];

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

  const addTodo = () => {
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      date: selectedDate || new Date(),
      time: selectedTime,
      reminder,
      repeat
    };

    setTodos(prev => [...prev, newTodo]);
    setInputValue("");
    setSelectedDate(null);
    setSelectedTime(null);
    setReminder(false);
    setRepeat(false);
    setPopoverVisible(false);
  };

  const isToday = (date: Date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isWithinNext7Days = (date: Date) => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);
    return date > today && date <= next7Days;
  };

  const getTodosByDate = () => {
    if (selectedMenuTitle === "今天") {
      return todos.filter(todo => !todo.date || isToday(todo.date));
    } else if (selectedMenuTitle === "最近7天") {
      return todos.filter(todo => todo.date && isWithinNext7Days(todo.date));
    } else if (selectedMenuTitle === "收集箱") {
      return todos;
    }
    return [];
  };

  const datePickerContent = (
    <div style={{ width: 300 }}>
      <Calendar fullscreen={false} onChange={(date) => setSelectedDate(date.toDate())} />
      <div style={{ padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClockCircleOutlined />
          <TimePicker
            format="HH:mm"
            placeholder="选择时间"
            value={selectedTime}
            onChange={setSelectedTime}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellOutlined />
            <span>提醒</span>
          </div>
          <Switch checked={reminder} onChange={setReminder} />
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RedoOutlined />
            <span>重复</span>
          </div>
          <Switch checked={repeat} onChange={setRepeat} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <Button onClick={() => {
            setSelectedDate(null);
            setSelectedTime(null);
            setReminder(false);
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

  const handleTodoContentEdit = (todo: Todo, newContent: string) => {
    if (!newContent.trim()) return;
    setTodos(prev => prev.map(item => 
      item.id === todo.id ? { ...item, content: newContent.trim() } : item
    ));
  };

  const handleTodoClick = (todo: Todo, event: React.MouseEvent) => {
    setClickPosition({ x: event.clientX, y: event.clientY });
    setSelectedTodo(todo);
    setEditingTodoContent(todo.content);
    setModalVisible(true);
  };

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
            <div style={{ marginBottom: "20px" }}>
              <Title level={4}>今日待办</Title>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {getTodosByDate().map(todo => (
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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <Checkbox 
                        onClick={(e) => e.stopPropagation()}
                      >{todo.content}</Checkbox>
                    </div>
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
            <div>
              <Title level={4}>习惯</Title>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Checkbox>锻炼身体</Checkbox>
                <Checkbox>早睡早起</Checkbox>
                <Checkbox>喝水</Checkbox>
              </div>
            </div>
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
                    style={{ height: '200px' }}
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
    <Layout style={{ minHeight: "100vh" }}>
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
            // 只有当点击的不是头像按钮（key不等于"0"）时，才更新selectedNav
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
                { key: "3", label: "收集箱" }
              ]}
              onClick={({ key, item }) => {
                const menuItems = [
                  { key: "1", label: "今天" },
                  { key: "2", label: "最近7天" },
                  { key: "3", label: "收集箱" }
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
