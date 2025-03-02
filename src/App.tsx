import React from "react";
import { Layout, Menu, Calendar, Checkbox, Avatar, Typography, Input } from "antd";
import { CalendarOutlined, ClockCircleOutlined, AppstoreOutlined, FieldTimeOutlined, CheckSquareOutlined } from "@ant-design/icons";
import "./assets/styles/App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={80} style={{ borderRight: "1px solid #f0f0f0" }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            { key: "1", icon: <AppstoreOutlined />, label: "任务" },
            { key: "2", icon: <CalendarOutlined />, label: "日历" },
            { key: "3", icon: <FieldTimeOutlined />, label: "四象限" },
            { key: "4", icon: <ClockCircleOutlined />, label: "番茄专注" },
            { key: "5", icon: <CheckSquareOutlined />, label: "习惯打卡" }
          ]}
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
          />
        </Sider>
        <Content style={{ padding: "20px", backgroundColor: "#fff" }}>
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <Input placeholder="添加待办事项" style={{ flex: 1 }} />
            <Calendar fullscreen={false} style={{ width: 300, border: "1px solid #f0f0f0", borderRadius: 8 }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Title level={4}>今日待办</Title>
            <Checkbox>完成界面设计</Checkbox>
            <Checkbox>开发任务模块</Checkbox>
            <Checkbox>测试功能</Checkbox>
          </div>
          <div>
            <Title level={4}>习惯</Title>
            <Checkbox>锻炼身体</Checkbox>
            <Checkbox>早睡早起</Checkbox>
            <Checkbox>喝水</Checkbox>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
