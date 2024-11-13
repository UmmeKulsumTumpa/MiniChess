// src/components/Modal.js

import React from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

function Modal({ isOpen, onClose, children }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto p-6 bg-gray-700 text-white rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
    >
      {children}
    </ReactModal>
  );
}

export default Modal;
