import { useEffect, useState } from 'react';
import { initContracts } from '../contract';
import { ethers } from 'ethers';

export default function LiquidityPage() {
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [wallet, setWallet] = useState('');
  const [message, setMessage] = useState('');
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [sumPoolContract, setSumPoolContract] = useState(null);

  useEffect(() => {
    const loadContracts = async () => {
      const { tokenA, tokenB, sumPoolContract } = await initContracts();
      setTokenA(tokenA);
      setTokenB(tokenB);
      setSumPoolContract(sumPoolContract);
    };
    loadContracts();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请先安装 MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
      alert('连接钱包失败');
    }
  };

  const handleAmountAChange = (e) => {
    const a = e.target.value;
    setAmountA(a);
    if (!isNaN(a) && a !== '') {
      const aFloat = parseFloat(a);
      setAmountB((aFloat * 1).toFixed(6)); // 1:1 比例
    } else {
      setAmountB('');
    }
  };

  const handleAddLiquidity = async () => {
    if (!wallet || !tokenA || !tokenB || !sumPoolContract) {
      alert('请确保钱包和合约已连接');
      return;
    }

    try {
      const a = ethers.utils.parseUnits(amountA, 18);
      const b = ethers.utils.parseUnits(amountB, 18);

      await tokenA.approve(sumPoolContract.address, a);
      await tokenB.approve(sumPoolContract.address, b);

      const tx = await sumPoolContract.addLiquidity(a, b);
      await tx.wait();

      setMessage(`✅ 成功添加 ${amountA} A + ${amountB} B`);
    } catch (err) {
      console.error(err);
      alert('❌ 添加失败，请检查余额或授权');
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>添加流动性</h2>

        <div style={inputGroup}>
          <label>TokenA 数量：</label>
          <input
            type="number"
            value={amountA}
            onChange={handleAmountAChange}
            placeholder="输入 TokenA 数量"
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label>自动计算：</label>
          <p>TokenB: <strong>{amountB}</strong></p>
        </div>

        <button onClick={handleAddLiquidity} style={buttonStyle}>添加流动性</button>

        <div style={{ marginTop: '16px' }}>
          <button onClick={connectWallet} style={connectButtonStyle}>
            {wallet ? `已连接：${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '连接钱包'}
          </button>
        </div>

        {message && (
          <p style={{ marginTop: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
            {message}
          </p>
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
  alignItems: 'center',
  backgroundColor: '#fafafa',
  fontFamily: 'Arial, sans-serif',
};

const cardStyle = {
  width: '480px',
  padding: '32px',
  backgroundColor: '#f5f0ff',
  borderRadius: '24px',
  boxShadow: '0 15px 40px rgba(160, 130, 255, 0.1)',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '28px',
  fontSize: '24px',
  color: '#6c4ccf',
  fontWeight: 'bold'
};

const inputGroup = {
  marginBottom: '16px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid #c7b6ee',
  backgroundColor: '#fdfaff',
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#e0c7ff',
  color: '#30176c',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  fontSize: '16px',
  cursor: 'pointer',
};

const connectButtonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#d9cfff',
  color: '#4a2b8c',
  border: '1px solid #bfa6f7',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
