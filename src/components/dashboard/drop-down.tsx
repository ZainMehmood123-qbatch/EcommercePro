 /* eslint-disable no-unused-vars */
'use client';

import React from 'react';

import type { MenuProps } from 'antd';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export interface GenericDropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface GenericDropdownProps {
  items: GenericDropdownItem[];             
  selectedKey: string;                        
  onSelect: (key: string) => void;          
  className?: string;                         
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  items,
  selectedKey,
  onSelect,
  className = ''
}) => {

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    onSelect(e.key);
  };

  const menuProps = {
    items: items.map(item => ({
      key: item.key,
      label: item.label,
      icon: item.icon
    })),
    onClick: handleMenuClick,
    selectedKeys: [selectedKey]
  };

  const getCurrentLabel = () => {
    const currentItem = items.find(item => item.key === selectedKey);
    return currentItem?.label || (items[0]?.label ?? '');
  };

  return (
    <Space wrap>
      <Dropdown menu={menuProps}>
        <Button
          className={`
            w-full sm:w-auto min-w-[160px] 
            h-9 sm:h-10 
            px-3 sm:px-4 
            flex items-center justify-between
            border border-gray-300 hover:border-blue-500
            transition-colors duration-200
            ${className}
          `}
        >
          <Space size='small' className="flex-1">
            <span className='text-xs sm:text-sm font-medium text-gray-700 truncate'>
              {getCurrentLabel()}
            </span>
            <DownOutlined className='text-xs sm:text-sm text-gray-500' />
          </Space>
        </Button>
      </Dropdown>
    </Space>
  );
};

export default GenericDropdown;
