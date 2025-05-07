import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import PropTypes from 'prop-types';

const { Dragger } = Upload;

const UploadCostFile = ({ onUploadSuccess }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!fileList.length) {
            message.error('Please select a file first');
            return;
        }

        const file = fileList[0];
        if (!file) {
            message.error('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const response = await axios.post('/CostExpense/UploadExcel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                message.success('Upload successful!');
                setFileList([]);
                onUploadSuccess?.();
            }
        } catch (error) {
            message.error(
                error.response?.data ||
                    'The file has changed or is no longer available. Please reselect the file and try again.'
            );
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx,.xls',
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file) => {
            const isExcel =
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel';

            if (!isExcel) {
                message.error('You can only upload Excel files!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            return false;
        },
        fileList,
        showUploadList: {
            showRemoveIcon: true,
        },
    };

    return (
        <div className="upload-content">
            <Dragger {...uploadProps} className="upload-dragger" multiple={false}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
                <p className="ant-upload-hint">Support for a single Excel file upload</p>
            </Dragger>
            <div className="upload-button-container">
                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    className="upload-button"
                >
                    {uploading ? 'Uploading' : 'Upload'}
                </Button>
            </div>
        </div>
    );
};

UploadCostFile.propTypes = {
    onUploadSuccess: PropTypes.func,
};

export default UploadCostFile;
