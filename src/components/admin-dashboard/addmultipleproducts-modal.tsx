'use client';

import { useState } from 'react';

import { Modal, Upload, Button } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddMultipleProductsModal({ visible, onClose }: Props) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  return (
    <Modal
      title={
        <span className="text-lg font-semibold text-gray-800">
          Add Multiple Products
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upload File
        </Button>
      ]}
      width={600}
    >
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-md p-10 flex flex-col items-center justify-center text-center bg-gray-50">
        <Upload.Dragger
          multiple={false}
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={() => false} // prevent auto upload
          className="w-full"
        >
          <div className="flex flex-col items-center justify-center">
            <UploadOutlined className="text-blue-600 text-4xl mb-3" />
            <p className="text-gray-600 text-base">
              Drop your file here to upload
            </p>
            <a href="#" className="text-blue-600 text-sm underline mt-1">
              Download Sample File
            </a>
            <Button className="mt-4 border border-blue-500 text-blue-600 hover:bg-blue-50">
              Browse
            </Button>
          </div>
        </Upload.Dragger>
      </div>

      {/* Uploaded Files List */}
      {fileList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-gray-700 text-sm font-medium mb-2">
            Uploaded Files
          </h3>
          <ul className="space-y-2">
            {fileList.map((file) => (
              <li
                key={file.uid}
                className="flex items-center justify-between border rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <FileOutlined className="text-blue-600" />
                  <span className="text-gray-800">{file.name}</span>
                </div>
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-red-500" />}
                  onClick={() => handleRemove(file)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
