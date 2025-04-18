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
  const [balanceA, setBalanceA] = useState('');
  const [balanceB, setBalanceB] = useState('');
  const [removeShare, setRemoveShare] = useState('');
  const [expectedRemoveA, setExpectedRemoveA] = useState('');
  const [expectedRemoveB, setExpectedRemoveB] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [tokenInSymbol, setTokenInSymbol] = useState('A'); // 默认使用 TokenA
  const [expectedOut, setExpectedOut] = useState('');

  const loadBalances = async () => {
    if (sumPoolContract && tokenA && tokenB) {
      const balA = await sumPoolContract.getTokenBalance(tokenA.address);
      const balB = await sumPoolContract.getTokenBalance(tokenB.address);
      setBalanceA(ethers.utils.formatUnits(balA, 18));
      setBalanceB(ethers.utils.formatUnits(balB, 18));
    }
  };

  useEffect(() => {
    const loadContracts = async () => {
      const { tokenA, tokenB, sumPoolContract } = await initContracts();
      setTokenA(tokenA);
      setTokenB(tokenB);
      setSumPoolContract(sumPoolContract);
    };
    loadContracts();
  }, []);

  useEffect(() => {
    if (sumPoolContract && tokenA && tokenB) {
      loadBalances();
    }
  }, [sumPoolContract, tokenA, tokenB]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
      alert('Error connecting the wallet');
    }
  };

  const handleAmountAChange = (e) => {
    const a = e.target.value;
    setAmountA(a);
    if (!isNaN(a) && a !== '') {
      const aFloat = parseFloat(a);
      setAmountB((aFloat * 1).toFixed(6)); // constant sum pool
    } else {
      setAmountB('');
    }
  };

  const handleAddLiquidity = async () => {
    if (!wallet || !tokenA || !tokenB || !sumPoolContract) {
      alert('Make sure the wallet and contract are connected');
      return;
    }

    try {
      const a = ethers.utils.parseUnits(amountA, 18);
      const b = ethers.utils.parseUnits(amountB, 18);

      await tokenA.approve(sumPoolContract.address, a);
      await tokenB.approve(sumPoolContract.address, b);

      const tx = await sumPoolContract.addLiquidity(a, b);
      await tx.wait();

      setMessage(`✅ Successfully added ${amountA} A + ${amountB} B`);
      await loadBalances();
    } catch (err) {
      console.error(err);
      alert('❌ Add failed, check balance or approval');
    }
  };

  const handleAmountInChange = (e) => {
    const value = e.target.value;
    setAmountIn(value);

    if (!isNaN(value) && value !== '' && balanceA && balanceB) {
      const amount = parseFloat(value);
      const a = parseFloat(balanceA);
      const b = parseFloat(balanceB);

      const expected = tokenInSymbol === 'A'
        ? (amount * b) / a
        : (amount * a) / b;

      setExpectedOut(expected.toFixed(6));
    } else {
      setExpectedOut('');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet || !sumPoolContract || !amountIn) return;

    try {
      const parsedAmountIn = ethers.utils.parseUnits(amountIn, 18);
      const tokenIn = tokenInSymbol === 'A' ? tokenA : tokenB;

      const tx = await sumPoolContract.removeLiquidity(parsedAmountIn, tokenIn.address);
      await tx.wait();

      setMessage(`✅ Removed ${amountIn} ${tokenInSymbol} + ${expectedOut} ${tokenInSymbol === 'A' ? 'B' : 'A'}`);
      setAmountIn('');
      setExpectedOut('');
      await loadBalances();
    } catch (err) {
      console.error(err);
      alert('❌ Remove failed, check input or pool balance');
    }
  };

  // return (
  //   <div style={wrapperStyle}>
  //     <div style={cardStyle}>
  //       <h2 style={titleStyle}>Add Liquidity</h2>
  //       <label>Token A:</label>
  //       <input type="number" value={amountA} onChange={handleAmountAChange} placeholder="Enter amount A" />
  //       <label>Token B (auto):</label>
  //       <input type="number" value={amountB} readOnly />
  //       <button onClick={handleAddLiquidity}>Add</button>
  //     </div>

  //     <div style={cardStyle}>
  //       <h2 style={titleStyle}>Remove Liquidity</h2>
  //       <label>Token In:</label>
  //       <select value={tokenInSymbol} onChange={(e) => setTokenInSymbol(e.target.value)}>
  //         <option value="A">Token A</option>
  //         <option value="B">Token B</option>
  //       </select>
  //       <input
  //         type="number"
  //         value={amountIn}
  //         onChange={handleAmountInChange}
  //         placeholder="Enter amount to remove"
  //       />
  //       <p>Estimated output: {expectedOut} {tokenInSymbol === 'A' ? 'Token B' : 'Token A'}</p>
  //       <button onClick={handleRemoveLiquidity}>Remove</button>
  //     </div>

  //     <div style={cardStyle}>
  //       <h3>Liquidity Pool Balances</h3>
  //       <p>Token A: {balanceA}</p>
  //       <p>Token B: {balanceB}</p>
  //     </div>

  //     <div style={cardStyle}>
  //       {wallet ? (
  //         <p>Connected Wallet: {wallet}</p>
  //       ) : (
  //         <button onClick={connectWallet}>Connect Wallet</button>
  //       )}
  //       {message && <p>{message}</p>}
  //     </div>
  //   </div>
  // );
  // 替换你的 return 内部为如下结构

return (
  <div style={wrapperStyle}>
    {/* <h1 style={mainTitle}>Liquidity Manager</h1> */}
    <div style={cardsRowStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Add Liquidity</h2>
        <div style={inputGroup}>
          <label>Token A:</label>
          <input type="number" style={inputStyle} value={amountA} onChange={handleAmountAChange} placeholder="Enter amount A" />
        </div>
        <div style={inputGroup}>
          <label>Token B (auto):</label>
          <input type="number" style={inputStyle} value={amountB} readOnly />
        </div>
        <button style={buttonStyle} onClick={handleAddLiquidity}>➕ Add</button>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Remove Liquidity</h2>
        <div style={inputGroup}>
          <label>Token In:</label>
          <select style={inputStyle} value={tokenInSymbol} onChange={(e) => setTokenInSymbol(e.target.value)}>
            <option value="A">Token A</option>
            <option value="B">Token B</option>
          </select>
        </div>
        <div style={inputGroup}>
          <label>Amount In:</label>
          <input type="number" style={inputStyle} value={amountIn} onChange={handleAmountInChange} placeholder="Enter amount to remove" />
        </div>
        <p style={{ marginBottom: '16px' }}>💡 Estimated output: <strong>{expectedOut} {tokenInSymbol === 'A' ? 'Token B' : 'Token A'}</strong></p>
        <button style={buttonStyle} onClick={handleRemoveLiquidity}>➖ Remove</button>
      </div>
    </div>

    <div style={cardsRowStyle}>
      <div style={cardStyle}>
        <h3 style={titleStyle}>💧 Pool Balances</h3>
        <p>Token A: <strong>{balanceA}</strong></p>
        <p>Token B: <strong>{balanceB}</strong></p>
      </div>

      <div style={cardStyle}>
        <h3 style={titleStyle}>🦊 Wallet</h3>
        {wallet ? (
          <p>Connected: <strong>{wallet.slice(0, 6)}...{wallet.slice(-4)}</strong></p>
        ) : (
          <button style={connectButtonStyle} onClick={connectWallet}>Connect MetaMask</button>
        )}
        {message && <p style={{ marginTop: '12px', color: '#4b2b9a' }}>{message}</p>}
      </div>
    </div>
  </div>
  
);

}
// const wrapperStyle = {
//   width: '100vw',
//   // height: '100vh',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   flexDirection: 'column',
//   backgroundColor: '#fafafa',
//   fontFamily: 'Arial, sans-serif',
//   margin: 0,
//   padding: 0,
// };

// const cardsRowStyle = {
//   display: 'flex',
//   flexDirection: 'row',
//   gap: '64px',
//   justifyContent: 'center',
//   alignItems: 'flex-start',
// };

// const cardStyle = {
//   width: '480px',
//   padding: '32px',
//   backgroundColor: '#f5f0ff',
//   borderRadius: '24px',
//   boxShadow: '0 15px 40px rgba(160, 130, 255, 0.1)',
// };

// const titleStyle = {
//   textAlign: 'center',
//   marginBottom: '28px',
//   fontSize: '24px',
//   color: '#6c4ccf',
//   fontWeight: 'bold',
// };

// const inputGroup = {
//   marginBottom: '16px',
// };

// const inputStyle = {
//   width: '100%',
//   padding: '10px',
//   borderRadius: '10px',
//   border: '1px solid #c7b6ee',
//   backgroundColor: '#fdfaff',
// };

// const buttonStyle = {
//   width: '100%',
//   padding: '14px',
//   backgroundColor: '#e0c7ff',
//   color: '#30176c',
//   border: 'none',
//   borderRadius: '12px',
//   fontWeight: 'bold',
//   fontSize: '16px',
//   cursor: 'pointer',
// };

// const connectButtonStyle = {
//   width: '320px',
//   padding: '12px',
//   backgroundColor: '#d9cfff',
//   color: '#4a2b8c',
//   border: '1px solid #bfa6f7',
//   borderRadius: '12px',
//   fontWeight: 'bold',
//   cursor: 'pointer',
// };


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

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f0eeff', // 可选：统一背景色
  padding: '40px 0',
};


const mainTitle = {
  textAlign: 'center',
  fontSize: '32px',
  marginBottom: '40px',
  color: '#5b3cc4',
};

const cardsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '32px',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginBottom: '32px',
};

const cardStyle = {
  flex: '1 1 480px',
  padding: '28px',
  backgroundColor: '#fff',
  borderRadius: '20px',
  boxShadow: '0 10px 25px rgba(90, 60, 150, 0.1)',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '24px',
  fontSize: '22px',
  color: '#4b2b9a',
  fontWeight: '600',
};

const inputGroup = {
  marginBottom: '16px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid #c7b6ee',
  backgroundColor: '#f9f6ff',
  fontSize: '15px',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#a785ff',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const connectButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#d3c3ff',
  color: '#442a99',
};
