import React from 'react';

export default function HistoryPage({ records }) {
  return (
    <div style={wrapperStyle}>
      <div style={contentBox}>
        <h2 style={title}>交易记录</h2>
        {records.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>暂无交易记录</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th>时间</th>
                <th>类型</th>
                <th>出售</th>
                <th>购买</th>
                <th>钱包</th>
              </tr>
            </thead>
            <tbody>
              {records.map((tx, index) => (
                <tr key={index} style={rowStyle}>
                  <td>{tx.time}</td>
                  <td>{tx.type}</td>
                  <td>{tx.from}</td>
                  <td>{tx.to}</td>
                  <td>{tx.wallet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// 样式
const wrapperStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  backgroundColor: '#fafafa',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  paddingTop: '80px',
};

const contentBox = {
  width: '100%',
  maxWidth: '800px',
  padding: '0 20px',
};

const title = {
  fontSize: '26px',
  color: '#5f42c2',
  marginBottom: '20px',
  textAlign: 'center',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#f9f5ff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 0 12px rgba(160, 130, 255, 0.1)',
};

const headerRow = {
  backgroundColor: '#e4d7ff',
  color: '#3e2a87',
  textAlign: 'left',
  padding: '14px',
};

const rowStyle = {
  padding: '12px',
  borderBottom: '1px solid #ddd',
};
