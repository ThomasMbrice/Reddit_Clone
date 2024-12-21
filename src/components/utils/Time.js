import React, { useState, useEffect } from 'react';

const Time = ({ date }) => { // exact same as last hw
  const [timeAgo, setTimeAgo] = useState('');

  const formatTimeAgo = (submissionDate, currentDate = new Date()) => {
    const seconds = Math.floor((currentDate - submissionDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 30) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    setTimeAgo(formatTimeAgo(new Date(date)));
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(new Date(date)));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className="text-sm text-gray-500">{timeAgo}</span>;
};

export default Time;