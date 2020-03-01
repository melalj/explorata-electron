/* eslint-disable react/no-children-prop */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Spin } from 'antd';

export default function Loading() {
  return (
    <div className="loading">
      <div>
        <Spin size="large" />
        <br />
        Prepare for a trip down memory lane...
      </div>
    </div>
  );
}
