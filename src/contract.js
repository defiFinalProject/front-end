// src/contract.js
import { ethers } from "ethers";
import tokenAAbi from "./abis/TokenA.json";
import tokenBAbi from "./abis/TokenB.json";
import sumPoolAbi from "./abis/ConstantSumPool.json";

// 合约地址（你的部署结果）
const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const tokenAAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
// const tokenBAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const tokenBAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// const sumPoolAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
const sumPoolAddress = "0x162A433068F51e18b7d13932F27e66a3f99E6890"
// ⚠️ 注意：这个文件不再导出合约实例，而是导出异步函数，页面中调用
export async function initContracts() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tokenA = new ethers.Contract(tokenAAddress, tokenAAbi.abi, signer);
  const tokenB = new ethers.Contract(tokenBAddress, tokenBAbi.abi, signer);
  const sumPoolContract = new ethers.Contract(sumPoolAddress, sumPoolAbi.abi, signer);

  return {
    provider,
    signer,
    tokenA,
    tokenB,
    sumPoolContract,
  };
}
