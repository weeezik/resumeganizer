import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="text-gray-600">Email: contact@example.com</p>
          </div>
          <div className="flex space-x-4">
            <a href="https://twitter.com" className="text-blue-500 hover:text-blue-700">Twitter</a>
            <a href="https://linkedin.com" className="text-blue-500 hover:text-blue-700">LinkedIn</a>
            <a href="https://github.com" className="text-blue-500 hover:text-blue-700">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 