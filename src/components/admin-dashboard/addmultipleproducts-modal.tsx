'use client';

import { useState } from 'react';

import { Modal, Upload, Button, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddMultipleProductsModal = ({ visible, onClose }: Props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleUpload = async () => {
    if (!fileList.length || !fileList[0].originFileObj) {
      message.error('Please select a CSV file first!');

      return;
    }

    const file = fileList[0].originFileObj;

    // Optional: Check file type (only CSV allowed)
    if (!file.name.endsWith('.csv')) {
      message.error('Only CSV files are allowed!');

      return;
    }

    const formData = new FormData();

    formData.append('file', file as Blob);

    try {
      const response = await fetch('http://localhost:8000/products/upload-csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success('CSV uploaded successfully! Products will be processed in background.');
      message.success('CSV uploaded successfully! Products will be processed in background.');
      onClose?.();
    } catch (err) {
      toast.error('Error uploading CSV. Please try again.');
      message.error('Error uploading CSV. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <Modal
      footer={[
        <Button key={'cancel'} onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key={'upload'}
          className={'bg-blue-600 hover:bg-blue-700'}
          type={'primary'}
          onClick={handleUpload}
        >
          Upload File
        </Button>
      ]}
      open={visible}
      title={<span className={'text-lg font-semibold text-gray-800'}>Add Multiple Products</span>}
      width={600}
      onCancel={onClose}
    >
      <div
        className={
          'border-2 border-dashed border-gray-300 rounded-md p-10 flex flex-col items-center justify-center text-center bg-gray-50'
        }
      >
        <Upload.Dragger
          beforeUpload={() => false}
          className={'w-full'}
          fileList={fileList}
          multiple={false}
          onChange={handleChange}
        >
          <div className={'flex flex-col items-center justify-center'}>
            <UploadOutlined className={'text-blue-600 text-4xl mb-3'} />
            <p className={'text-gray-600 text-base'}>Drop your file here to upload</p>
            <Button className={'mt-4 border border-blue-500 text-blue-600 hover:bg-blue-50'}>
              Browse
            </Button>
          </div>
        </Upload.Dragger>
      </div>

      {fileList.length > 0 ? (
        <div className={'mt-6'}>
          <h3 className={'text-gray-700 text-sm font-medium mb-2'}>Uploaded Files</h3>
          <ul className={'space-y-2'}>
            {fileList.map((file) => (
              <li
                key={file.uid}
                className={'flex items-center justify-between border rounded-md px-3 py-2'}
              >
                <div className={'flex items-center gap-2'}>
                  <FileOutlined className={'text-blue-600'} />
                  <span className={'text-gray-800'}>{file.name}</span>
                </div>
                <Button
                  icon={<DeleteOutlined className={'text-red-500'} />}
                  type={'text'}
                  onClick={() => handleRemove(file)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
};

export default AddMultipleProductsModal;
