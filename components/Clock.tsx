import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="text-sm font-mono text-gray-300 bg-black/20 px-3 py-1.5 rounded-md border border-white/10">
      {time.toLocaleTimeString()}
    </div>
  );
};

export default Clock;
