import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const FeedbackButton = () => {
  const [hovered, setHovered] = useState(false);

  const handleFeedbackClick = () => {
    window.open('https://pyr3cccubut.typeform.com/to/nAfaKGNx', '_blank');
  };

  return (
    <button
      onClick={handleFeedbackClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed bottom-4 right-4 z-50 flex flex-col items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300
        ${hovered ? 'h-32' : 'h-12'}
      `}
      style={{ minWidth: '140px', width: hovered ? '320px' : '140px' }}
      aria-label="Give Feedback"
    >
      <span className="flex items-center">
        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
        Feedback
      </span>
      <span
        className={`text-sm font-normal text-center mt-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ maxWidth: '90%' }}
      >
        Help shape Resumeganizer! Take our survey to win a free year of our premium tier when we launch.
      </span>
    </button>
  );
};

export default FeedbackButton;