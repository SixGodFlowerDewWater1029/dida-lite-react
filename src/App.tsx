import React from "react";
import { Layout, Menu, Calendar, Checkbox, Avatar, Typography, Input, Popover, TimePicker, Button, Switch } from "antd";
import { CalendarOutlined, ClockCircleOutlined, AppstoreOutlined, EnvironmentOutlined, CheckSquareOutlined, BellOutlined, RedoOutlined } from "@ant-design/icons";
import "./assets/styles/App.css";
import "./assets/styles/MainNav.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [selectedMenuTitle, setSelectedMenuTitle] = React.useState("今天");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<any>(null);
  const [reminder, setReminder] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);
  const [popoverVisible, setPopoverVisible] = React.useState(false);

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
          }}>确定</Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={80} style={{ borderRight: "1px solid #f0f0f0" }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            { key: "1", icon: <CheckSquareOutlined />, title: "任务" },
            { key: "2", icon: <CalendarOutlined />, title: "日历" },
            { key: "3", icon: <AppstoreOutlined />, title: "四象限" },
            { key: "4", icon: <ClockCircleOutlined />, title: "番茄专注" },
            { key: "5", icon: <EnvironmentOutlined />, title: "习惯打卡" }
          ]}
          className="main-nav"
        />
      </Sider>
      <Layout>
        <Sider theme="light" width={240} style={{ borderRight: "1px solid #f0f0f0" }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[
              { key: "1", label: "今天" },
              { key: "2", label: "最近7天" },
              { key: "3", label: "收集箱" },
              { key: "4", label: "幼儿园" }
            ]}
            onClick={({ key, item }) => {
              const menuItems = [
                { key: "1", label: "今天" },
                { key: "2", label: "最近7天" },
                { key: "3", label: "收集箱" },
                { key: "4", label: "幼儿园" }
              ];
              const selectedItem = menuItems.find(i => i.key === key);
              setSelectedMenuTitle(selectedItem?.label || "今天");
            }}
          />
        </Sider>
        <Content style={{ padding: "20px", backgroundColor: "#fff" }}>
          <div style={{ marginBottom: "20px" }}>
            <Title level={3} style={{ margin: 0 }}>{selectedMenuTitle}</Title>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <Input 
                placeholder="添加待办事项" 
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
                  <Checkbox>完成界面设计</Checkbox>
                  <Checkbox>开发任务模块</Checkbox>
                  <Checkbox>测试功能</Checkbox>
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
