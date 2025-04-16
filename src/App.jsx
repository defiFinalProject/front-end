import { useState } from 'react';
import TradePage from './pages/TradePage';
import HistoryPage from './pages/HistoryPage';
import LiquidityPage from './pages/LiquidityPage';

function App() {
  const [page, setPage] = useState('trade');
  const [records, setRecords] = useState([]);

  const addRecord = (newRecord) => {
    setRecords((prev) => [newRecord, ...prev]); // 添加到前面
  };

  return (
    <div>
      <nav style={navStyle}>
        <button onClick={() => setPage('trade')} style={navButtonStyle}>💱 Swap</button>
        <button onClick={() => setPage('history')} style={navButtonStyle}>📄 Transcation Records</button>
        <button onClick={() => setPage('liquidity')} style={navButtonStyle}>💧 Liquidity Managment</button>
      </nav>

      {page === 'trade' && <TradePage onAddRecord={addRecord} />}
      {page === 'history' && <HistoryPage records={records} />}
      {page === 'liquidity' && <LiquidityPage />}

    </div>
  );
}

export default App;

const navStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  padding: '20px',
  backgroundColor: '#f5f0ff',
};

const navButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#e0c7ff',
  color: '#30176c',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
