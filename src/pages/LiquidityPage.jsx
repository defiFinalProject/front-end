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
      await loadBalances();
      // const balA = await sumPoolContract.getTokenBalance(tokenA.address);
      // const balB = await sumPoolContract.getTokenBalance(tokenB.address);
      // setBalanceA(ethers.utils.formatUnits(balA, 18));
      // setBalanceB(ethers.utils.formatUnits(balB, 18));
    };
    loadContracts();
  }, []);

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
      setAmountB((aFloat * 1).toFixed(6));
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
      
      setMessage(`✅ Successfully add ${amountA} A + ${amountB} B`);
      await loadBalances();
    } catch (err) {
      console.error(err);
      alert('❌ Add failed, check balance or authorization');
    }
  };

  const handleRemoveShareChange = (e) => {
    const share = e.target.value;
    setRemoveShare(share);
    if (!isNaN(share) && share !== '' && balanceA && balanceB) {
      const totalLiquidity = parseFloat(balanceA) + parseFloat(balanceB);
      const fraction = parseFloat(share) / totalLiquidity;
      const tokenAOut = parseFloat(balanceA) * fraction;
      const tokenBOut = parseFloat(balanceB) * fraction;
      setExpectedRemoveA(tokenAOut.toFixed(6));
      setExpectedRemoveB(tokenBOut.toFixed(6));
    } else {
      setExpectedRemoveA('');
      setExpectedRemoveB('');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet || !sumPoolContract || !removeShare) return;
    try {
      const shareAmount = ethers.utils.parseUnits(removeShare, 18);
      const tx = await sumPoolContract.removeLiquidity(shareAmount);
      await tx.wait();
      setMessage(`✅ Successfully remove ${removeShare} shares`);
      await loadBalances();
    } catch (err) {
      console.error(err);
      alert("❌ Removal failed, check input or balance");
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Add liquidity</h2>

        <div style={inputGroup}>
          <label>TokenA ：</label>
          <input
            type="number"
            value={amountA}
            onChange={handleAmountAChange}
            placeholder="Input the number of TokenA: "
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label>Automatic calculation:</label>
          <p>TokenB: <strong>{amountB}</strong></p>
        </div>

        <button onClick={handleAddLiquidity} style={buttonStyle}>Add liquidity</button>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Remove liquidity</h2>

        <div style={inputGroup}>
          <label>Enter the share to be removed：</label>
          <input
            type="number"
            value={removeShare}
            onChange={handleRemoveShareChange}
            placeholder="Enter the proporation of shares"
            style={inputStyle}
          />
        </div>

        {expectedRemoveA && expectedRemoveB && (
          <div style={inputGroup}>
            <p>💧 Expected to be taken out:</p>
            <p>TokenA: <strong>{expectedRemoveA}</strong></p>
            <p>TokenB: <strong>{expectedRemoveB}</strong></p>
          </div>
        )}

        <button onClick={handleRemoveLiquidity} style={buttonStyle}>Confirmation</button>
      </div>
      <div style={cardStyle}>
  <h2 style={titleStyle}>Current liquidity of the pool</h2>
  <p>📦 TokenA reverse：<strong>{balanceA}</strong></p>
  <p>📦 TokenB reverse<strong>{balanceB}</strong></p>
</div>
      <div style={{ marginTop: '24px', width: '480px' }}>
        <button onClick={connectWallet} style={connectButtonStyle}>
          {wallet ? `connect：${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Connect Wallet'}
        </button>

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
  // height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: '#fafafa',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const cardsRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '64px',
  justifyContent: 'center',
  alignItems: 'flex-start',
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
  fontWeight: 'bold',
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
  width: '320px',
  padding: '12px',
  backgroundColor: '#d9cfff',
  color: '#4a2b8c',
  border: '1px solid #bfa6f7',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
