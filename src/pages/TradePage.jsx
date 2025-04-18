import { useState, useEffect } from 'react';
import { initContracts } from '../contract';
import { ethers } from 'ethers';

export default function TradePage() {
  const [fromToken, setFromToken] = useState("TokenA");
  const [toToken, setToToken] = useState("TokenB");
  const [amount, setAmount] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [fee, setFee] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [swapSuccess, setSwapSuccess] = useState(false);
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

  const getToken = (name) => (name === "TokenA" ? tokenA : tokenB);

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  };

  const handleEstimate = async () => {
    try {
      if (!amount || isNaN(amount) || !tokenA || !tokenB || !sumPoolContract) return;
      const from = getToken(fromToken);
      const to = getToken(toToken);
      const amountIn = ethers.utils.parseUnits(amount, 18);

      const out = await sumPoolContract.getAmountOut(amountIn, from.address, to.address);
      const feeVal = await sumPoolContract.getFee(out);
      const final = out.sub(feeVal);

      setEstimatedAmount(ethers.utils.formatUnits(out, 18));
      setFee(ethers.utils.formatUnits(feeVal, 18));
      setFinalAmount(ethers.utils.formatUnits(final, 18));
      setSwapSuccess(false);
    } catch (err) {
      console.error("❌ 预估失败:", err);
      alert("预估失败，可能是池子余额不足");
    }
  };

  const handleConfirm = async () => {
    try {
      if (!walletAddress || !tokenA || !tokenB || !sumPoolContract) return;

      const from = getToken(fromToken);
      const to = getToken(toToken);
      const amountIn = ethers.utils.parseUnits(amount, 18);

      const allowance = await from.allowance(walletAddress, sumPoolContract.address);
      if (allowance.lt(amountIn)) {
        const tx = await from.approve(sumPoolContract.address, amountIn);
        await tx.wait();
      }

      const tx = await sumPoolContract.swap(from.address, to.address, amountIn);
      await tx.wait();
      console.log(`Transaction successful! You received: ${finalAmount} ${toToken}`);
      setSwapSuccess(true);
    } catch (err) {
      console.error("❌ Failure to exchange:", err);
      alert("Failure to exchange, please check the console for details.");
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>💱 Token exchange </h2>

        <div style={inputGroup}>
          <label>Sell tokens: </label>
          <select value={fromToken} onChange={e => setFromToken(e.target.value)} style={selectStyle}>
            <option value="TokenA">TokenA</option>
            <option value="TokenB">TokenB</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label>Buy tokens：</label>
          <select value={toToken} onChange={e => setToToken(e.target.value)} style={selectStyle}>
            <option value="TokenA">TokenA</option>
            <option value="TokenB">TokenB</option>
          </select>
        </div>

        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="输入数量"
          style={inputStyle}
        />

        <button onClick={handleEstimate} style={buttonStyle}>Exchange Estimated</button>

        {!walletAddress ? (
          <button onClick={connectWallet} style={connectButtonStyle}>Connect Wallets</button>
        ) : (
          <p style={{ marginTop: "10px" }}>Connected:{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
        )}

        {estimatedAmount && (
          <div style={resultBoxStyle}>
            <p>Exchange Estimated: <strong>{estimatedAmount} {toToken}</strong></p>
            <p> Handling fee：<strong>{fee}</strong></p>
            <p>Finalization of accounts：<strong>{finalAmount} {toToken}</strong></p>
            <button onClick={handleConfirm} style={confirmButtonStyle}>Confirmation</button>
          </div>
        )}

        {swapSuccess && <p style={{ color: "green", marginTop: "12px" }}>✅ The exchange was successful!</p>}
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
  flexDirection: 'column',
  backgroundColor: '#fafafa',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const cardStyle = {
  width: '480px', padding: '32px', backgroundColor: '#f5f0ff',
  borderRadius: '24px', boxShadow: '0 15px 40px rgba(160, 130, 255, 0.1)',
};

const titleStyle = {
  textAlign: 'center', marginBottom: '28px', fontSize: '24px',
  color: '#6c4ccf', fontWeight: 'bold'
};

const inputGroup = { marginBottom: '16px' };
const selectStyle = {
  width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #c7b6ee', backgroundColor: '#fdfaff'
};

const inputStyle = {
  width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #c7b6ee', backgroundColor: '#fdfaff'
};

const buttonStyle = {
  width: '100%', padding: '14px', backgroundColor: '#e0c7ff', color: '#30176c',
  border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
};

const confirmButtonStyle = {
  marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#c9b6f9',
  color: '#30176c', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
};

const connectButtonStyle = {
  width: '100%', padding: '12px', backgroundColor: '#d9cfff',
  color: '#4a2b8c', border: '1px solid #bfa6f7', borderRadius: '12px',
  fontWeight: 'bold', cursor: 'pointer'
};

const resultBoxStyle = {
  width: '480px', marginTop: '30px', padding: '20px', backgroundColor: '#f4efff',
  borderRadius: '20px', lineHeight: '1.6', boxShadow: '0 8px 20px rgba(128, 96, 255, 0.05)', color: '#4b3c9a'
};
