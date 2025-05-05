import React from 'react';

const FeedbackButton = () => {
  const handleFeedbackClick = () => {
    window.open('https://pyr3cccubut.typeform.com/to/nAfaKGNx', '_blank');
  };

  return (
    <button
      onClick={handleFeedbackClick}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Give Feedback
    </button>
  );
};

export default FeedbackButton;