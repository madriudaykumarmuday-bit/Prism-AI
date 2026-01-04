
import React, { useState } from 'react';
import Modal from './Modal';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderHeader = () => {
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return (
      <div className="flex justify-between items-center p-4 bg-black/20">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10">&lt;</button>
        <h2 className="font-semibold text-lg">{monthYear}</h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10">&gt;</button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 text-center text-xs text-gray-400">
        {days.map(day => (
          <div key={day} className="p-2">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    
    // Blank cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`blank-${i}`} className="p-2"></div>);
    }
    
    // Day cells for the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      cells.push(
        <div key={day} className={`p-2 text-center rounded-full transition-colors ${isToday ? 'bg-cyan-500 text-white' : 'hover:bg-white/10'}`}>
          {day}
        </div>
      );
    }
    
    return <div className="grid grid-cols-7 gap-2 p-4">{cells}</div>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendar">
      <div className="text-white">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </Modal>
  );
};

export default Calendar;
