import { useEffect, useState } from 'react';
import { initContracts } from '../contract';
import { ethers } from 'ethers';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadSwapHistory = async () => {
      try {
        const { tokenA, tokenB, sumPoolContract } = await initContracts();
        const provider = sumPoolContract.provider;

        const swapEvents = await sumPoolContract.queryFilter("Swap");

        const parsed = await Promise.all(
          swapEvents.map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const time = new Date(block.timestamp * 1000).toLocaleString();
            const fromToken = event.args.fromToken;
            const toToken = event.args.toToken;

            const fromName = fromToken === tokenA.address ? "TokenA" : "TokenB";
            const toName = toToken === tokenA.address ? "TokenA" : "TokenB";

            return {
              time,
              type: "Swap",
              from: `${ethers.utils.formatUnits(event.args.amountIn, 18)} (${fromName})`,
              to: `${ethers.utils.formatUnits(event.args.amountOut, 18)} (${toName})`,
              wallet: event.args.user,
            };
          })
        );

        setRecords(parsed.reverse()); // 最新的排前面
      } catch (err) {
        console.error("❌ 加载交易记录失败:", err);
      }
    };

    loadSwapHistory();
  }, []);

  return (
    <div style={wrapperStyle}>
      <div style={contentBox}>
        <h2 style={title}>Transcation Records</h2>
        {records.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777' }}>No transaction record</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th style={cellStyle}>Time</th>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>Sell</th>
                <th style={cellStyle}>Buy</th>
                <th style={cellStyle}>Wallet</th>
              </tr>
            </thead>
            <tbody>
              {records.map((tx, index) => (
                <tr key={index} style={rowStyle}>
                  <td style={cellStyle}>{tx.time}</td>
                  <td style={cellStyle}>{tx.type}</td>
                  <td style={cellStyle}>{tx.from}</td>
                  <td style={cellStyle}>{tx.to}</td>
                  <td style={cellStyle}>{tx.wallet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
  maxWidth: '960px',
  padding: '0 20px',
};

const title = {
  fontSize: '30px',
  color: '#5f42c2',
  marginBottom: '28px',
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
};

const rowStyle = {
  borderBottom: '1px solid #ddd',
  height: '56px',
};

const cellStyle = {
  padding: '18px',
  fontSize: '16px',
};
