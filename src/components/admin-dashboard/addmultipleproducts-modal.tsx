'use client';

import { useState } from 'react';

import { Modal, Upload, Button, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined, DeleteOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddMultipleProductsModal = ({ visible, onClose }: Props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const requiredColumns = ['title', 'colorName', 'colorCode', 'size', 'stock', 'price', 'image'];

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList.slice(-1));
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    toast.success('File removed');
    message.success('File removed');
  };

  const handleDownloadSample = () => {
    const csvHeader = requiredColumns.join(',') + '\n';
    const csvSample =
      'Polo Shirt,Red,#FF0000,M,45,24.99,/red.png\nCargo Pants,Black,#000000,34,28,54.99,/black.png\n';
    const blob = new Blob([csvHeader + csvSample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'sample-products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Sample CSV downloaded');
    message.success('Sample CSV downloaded');
  };

  const validateCSVColumns = async (file: File): Promise<boolean> => {
    const text = await file.text();
    const [headerLine] = text.split('\n');
    const headers = headerLine
      .trim()
      .split(',')
      .map((h) => h.trim());

    const missing = requiredColumns.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
      toast.error(`Missing columns: ${missing.join(', ')}`);
      message.error(`Missing columns: ${missing.join(', ')}`);

      return false;
    }

    toast.success('CSV structure verified');
    message.success('CSV structure verified');

    return true;
  };

  const handleUpload = async () => {
    if (!fileList.length || !fileList[0].originFileObj) {
      toast.error('Please upload a CSV file first!');
      message.error('Please select a CSV file first!');

      return;
    }

    const file = fileList[0].originFileObj as File;

    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are allowed!');
      message.error('Only CSV files are allowed!');

      return;
    }

    const isValid = await validateCSVColumns(file);

    if (!isValid) return;

    const formData = new FormData();

    formData.append('file', file);

    toast.loading('Uploading CSV file...');

    try {
      const response = await fetch('http://localhost:8000/products/upload-csv', {
        method: 'POST',
        body: formData
      });

      toast.dismiss();

      if (!response.ok) throw new Error('Upload failed');

      toast.success('CSV uploaded successfully! Products will be processed in background.');
      message.success('CSV uploaded successfully! Products will be processed in background.');
      onClose?.();
    } catch (err) {
      toast.dismiss();
      toast.error('Error uploading CSV. Please try again.');
      message.error('Error uploading CSV. Please try again.');
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  return (
    <Modal
      footer={[
        <Button
          key={'download'}
          className={'border-blue-500 text-blue-600 hover:bg-blue-50'}
          icon={<DownloadOutlined />}
          onClick={handleDownloadSample}
        >
          Download Sample
        </Button>,
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
          disabled={fileList.length >= 1}
          fileList={fileList}
          multiple={false}
          onChange={handleChange}
        >
          <div className={'flex flex-col items-center justify-center'}>
            <UploadOutlined
              className={`text-4xl mb-3 ${
                fileList.length >= 1 ? 'text-gray-400' : 'text-blue-600'
              }`}
            />
            <p className={`text-base ${fileList.length >= 1 ? 'text-gray-400' : 'text-gray-600'}`}>
              Drop your file here to upload
            </p>
            <Button
              className={`mt-4 border ${
                fileList.length >= 1
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-blue-500 text-blue-600 hover:bg-blue-50'
              }`}
              disabled={fileList.length >= 1}
            >
              Browse
            </Button>
          </div>
        </Upload.Dragger>
      </div>

      {fileList.length > 0 ? (
        <div className={'mt-6'}>
          <h3 className={'text-gray-700 text-sm font-medium mb-2'}>Uploaded File</h3>
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
