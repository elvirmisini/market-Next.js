import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai'; // Importing the AlertTriangle icon from react-icons

const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center">
      <AiOutlineLoading className="w-16 h-16 text-yellow-400 animate-spin" /> {/* Using Tailwind CSS classes for styling */}
    </div>
  );
};

export default LoadingIndicator;
