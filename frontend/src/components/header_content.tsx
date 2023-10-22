import { Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

interface ChildProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderContent: React.FC<ChildProps> = ({ collapsed, setCollapsed }) => {
  return (
    <div className="h-full w-full flex items-center justify-between bg-gray-400">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined style={{color: 'white'}} /> : <MenuFoldOutlined style={{color: 'white'}}/>}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />
      <div className="flex mr-2">
        
      </div>
    </div>
  );
};

export default HeaderContent;
