import React from 'react';
import { Card, Typography } from 'antd';
import PropTypes from 'prop-types';

const { Title } = Typography;

const PageContainer = ({
    title,
    subTitle,
    onTitleClick,
    children,
    className = '',
    cardClassName = 'report-card',
    loading = false,
    error = null,
}) => {
    const renderTitle = () => {
        if (!title) return null;

        return (
            <Title level={4} style={{ margin: 0 }}>
                {onTitleClick ? (
                    <span
                        onClick={onTitleClick}
                        style={{
                            cursor: 'pointer',
                            color: '#5273a5',
                        }}
                    >
                        {title}
                    </span>
                ) : (
                    title
                )}
                {subTitle && ` >> ${subTitle}`}
            </Title>
        );
    };

    return (
        <div className={`page-container ${className}`}>
            <Card title={renderTitle()} className={cardClassName}>
                {children}
            </Card>
        </div>
    );
};

PageContainer.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    onTitleClick: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    cardClassName: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.string,
};

export default PageContainer;
