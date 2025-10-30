import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';
import PropTypes from 'prop-types';

const UploadHistoryTable = ({ refetchData, fetchEndpoint, downloadEndpoint, columns, rowKey }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleDownload = (savedFileName, fileName) => {
        window.location.href = `${downloadEndpoint}?savedFileName=${savedFileName}&fileName=${fileName}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(fetchEndpoint);
            setData(response.data);
        } catch (error) {
            message.error('Failed to fetch upload history');
            console.info('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refetchData, fetchEndpoint]);

    // Enhance columns: enhance fileName column to use handleDownload
    const enhancedColumns = columns.map(column => {
        if (column.dataIndex === 'fileName') {
            if (column.render) {
                // If fileName column has custom render, wrap it to provide handleDownload
                const originalRender = column.render;
                return {
                    ...column,
                    render: (text, record, index) => {
                        const result = originalRender(text, record, index);
                        // If result is a Button or link element, preserve all props and update onClick
                        if (React.isValidElement(result)) {
                            return React.cloneElement(result, {
                                ...result.props,
                                onClick: () =>
                                    handleDownload(record.savedFileName, record.fileName),
                            });
                        }
                        return result;
                    },
                };
            }
            // Default fileName render with download
            return {
                ...column,
                render: (text, record) => (
                    <Button
                        type="link"
                        onClick={() => handleDownload(record.savedFileName, record.fileName)}
                    >
                        {text}
                    </Button>
                ),
            };
        }
        return column;
    });

    return (
        <Table
            className="custom-table"
            columns={enhancedColumns}
            dataSource={data}
            loading={loading}
            rowKey={rowKey}
            pagination={{ pageSize: 10 }}
            size="small"
            bordered
        />
    );
};

UploadHistoryTable.propTypes = {
    refetchData: PropTypes.any,
    fetchEndpoint: PropTypes.string.isRequired,
    downloadEndpoint: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
};

export default UploadHistoryTable;
