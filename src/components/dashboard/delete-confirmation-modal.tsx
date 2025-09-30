'use client';

import type React from 'react';

import { Modal, Button } from 'antd';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      className='delete-confirmation-modal'
      title={null}
    >
      <div className='flex flex-col items-center text-center p-6'>
        <h2 className='text-2xl font-semibold text-[#007BFF] mb-6'>
          Remove Product
        </h2>
        <div className='mb-6'>
          <ExclamationTriangleIcon className='w-16 h-16 text-yellow-500' />
        </div>
        <p className='text-lg font-medium text-gray-800 mb-8 leading-relaxed'>
          Are you sure you want to delete{' '}
          {productName ? (
            <span className='font-semibold text-red-500'>{productName}</span>
          ) : (
            'this item'
          )}
          ?
        </p>
        <div className='flex gap-4 w-full'>
          <Button
            size='large'
            className='flex-1 !h-12 !border-[#007BFF] !text-[#007BFF] hover:!bg-blue-50'
            onClick={onClose}
          >
            No
          </Button>
          <Button
            danger
            type='primary'
            size='large'
            className='flex-1 !h-12'
            onClick={onConfirm}
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
