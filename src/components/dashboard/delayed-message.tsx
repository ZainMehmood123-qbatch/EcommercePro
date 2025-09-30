import React, { useEffect, useState } from 'react';

interface DelayedMessageProps {
  delay: number; 
  children: React.ReactNode;
}

const DelayedMessage: React.FC<DelayedMessageProps> = ({ delay, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return <>{show ? children : null}</>;
};

export default DelayedMessage;
