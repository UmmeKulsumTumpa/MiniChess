// src/components/ErrorModal.js

import React from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

function ErrorModal({ isOpen, onClose, message }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto p-6 bg-red-600 text-white rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
    >
      <h2 className="text-2xl font-bold mb-4">Error</h2>
      <p className="mb-4">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-900 rounded"
      >
        Close
      </button>
    </ReactModal>
  );
}

export default ErrorModal;
