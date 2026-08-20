import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { OrderedListOutlined, SettingOutlined } from '@ant-design/icons';
import './App.css';
import { ReceiptList } from './components/List';
import { ConfigReceiptType } from './components/ConfigReceiptType';

const { Sider, Content } = Layout;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('receiptList');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px' }} />
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => setSelectedMenu(key)}
          items={[
            {
              key: "receiptList",
              icon: <OrderedListOutlined />,
              label: "Danh sách phiếu nhập kho"
            },
            {
              key: "configReceiptType",
              icon: <SettingOutlined />,
              label: "Cấu hình loại chứng từ nhập"
            }
          ]}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280, borderRadius: '8px' }}>
          {selectedMenu === 'receiptList' && <ReceiptList />}
          {selectedMenu === 'configReceiptType' && <ConfigReceiptType />}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
