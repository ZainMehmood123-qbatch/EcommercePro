'use client';

import React, { useEffect, useState } from 'react';

import { Bell } from 'lucide-react';
import { Dropdown, List, Badge, Spin } from 'antd';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // optional: refresh every 60s
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const menuItems = (
    <div className={'w-64 bg-white p-2 shadow-md rounded-lg'}>
      {loading ? (
        <div className={'flex justify-center py-4'}>
          <Spin size={'small'} />
        </div>
      ) : notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item className={'text-xs text-gray-700'}>{item.message}</List.Item>
          )}
        />
      ) : (
        <p className={'text-center text-gray-500 text-xs'}>No new notifications</p>
      )}
    </div>
  );

  return (
    <Dropdown arrow overlay={menuItems} placement={'bottomRight'} trigger={['click']}>
      <Badge count={notifications.length} size={'small'}>
        <Bell className={'h-4 w-4 text-[#007BFF] cursor-pointer'} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
