import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../App.css'
import UsdtAbi from '../config/UsdtAbi.json'
import raffleAbi from '../config/raffleAbi.json'
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'

const UsdtVault = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [tokenAmount, setTokenAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  let [confirming, setConfirming] = useState(false);
  const StakingAddress = "0x668faeD2632b537095c6A43F8bB1D6421ecBCdD7";
  const TokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

  const { switchNetwork } = useSwitchNetwork()

  const [userAmount, setUserAmount] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [apy, setApy] = useState(0);
  const [userPendingRewards, setUserPendingRewards] = useState(0);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);

  const [allowance, setAllowance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [maxBalance, setMaxBalance] = useState(0);
  const [maxWithdrawBalance, setMaxWithdrawBalance] = useState(0);
  const [maxSet, setMaxSet] = useState(0);
  const [maxWithdrawSet, setMaxWithdrawSet] = useState(0);
  // const [lockingEnabled, setLockingEnabled] = useState(false);
  const [firstConnect, setFirstConnect] = useState(false);
  useEffect(() => {
    const switchChain = async () => {
      try {
        switchNetwork?.(11155111)
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true) {
      if (chain.id !== 11155111)
        switchChain();
    }
  }, [isConnected, chain?.id, switchNetwork])
  const onConnectWallet = async () => {
    await open();
    setFirstConnect(true);
  };
  useEffect(() => {
    const reloadWindow = async () => {
      try {
        window.location.reload();
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && firstConnect === true)
      reloadWindow();
  }, [isConnected, firstConnect])

  useEffect(() => {
    const FetchStakingData = async () => {
      try {
        const tvl = await readContract({ address: StakingAddress, abi: raffleAbi, functionName: 'totalUsdtStaked' });
        const userStakedAmount = await readContract({ address: StakingAddress, abi: raffleAbi, functionName: 'getUserTotalUsdtDeposits', args: [address] });
        const pendingRewards = await readContract({ address: StakingAddress, abi: raffleAbi, functionName: 'getUserUsdtDividends', args: [address] });
        const withdrawableAmount = await readContract({ address: StakingAddress, abi: raffleAbi, functionName: 'getUserWithdrawableUsdt', args: [address] });
        const tokenAllowance = await readContract({ address: TokenAddress, abi: UsdtAbi, functionName: 'allowance', args: [address, StakingAddress] });
        const tokenAmount = await readContract({ address: TokenAddress, abi: UsdtAbi, functionName: 'balanceOf', args: [address] });
        // const rewardPerYear = Number(totalInfo[1]) * 60 * 60 * 24 * 365;
        const APY = 24;
        setApy(APY);
        setTvl(Number(tvl) / Math.pow(10, 6));
        setUserAmount(Number(userStakedAmount) / Math.pow(10, 6));
        setUserPendingRewards(Number(pendingRewards) / Math.pow(10, 6));
        setWithdrawableAmount(Number(withdrawableAmount) / Math.pow(10, 6));
        // setLockingEnabled(totalInfo[4]);
        setAllowance(Number(tokenAllowance) / Math.pow(10, 6));
        setTokenBalance(tokenAmount);
        setMaxBalance(tokenAmount);
        setMaxWithdrawBalance(withdrawableAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 11155111 && address && (confirming === false)) {
      FetchStakingData();
    }
  }, [isConnected, address, chain, confirming])

  const onTokenAllowance = async () => {
    try {
      setConfirming(true);
      const approve = await writeContract({
        address: TokenAddress,
        abi: UsdtAbi,
        functionName: 'approve',
        args: [StakingAddress, tokenBalance],
        account: address
      })
      const approveData = await waitForTransaction({
        hash: approve.hash
      })
      console.log('approveData', approveData)
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
      setMaxSet(0);
    } catch (err) {
      setConfirming(false);
      setMaxSet(0);
    }
  };

  const onTokenStake = async (tokenAmounts) => {
    try {
      setConfirming(true);
      let TokenAmounts;
      TokenAmounts = `0x${(Number(tokenAmounts) * (10 ** 6)).toString(16)}`;
      const deposit = await writeContract({
        address: StakingAddress,
        abi: raffleAbi,
        functionName: 'stakeUsdt',
        args: [TokenAmounts],
        account: address
      })
      const depositData = await waitForTransaction({
        hash: deposit.hash
      })
      console.log('depositData', depositData)
      setMaxSet(0);
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setMaxSet(0);
      setConfirming(false);
    }
  };

  const onTokenClaim = async () => {
    try {
      setConfirming(true);
      const claim = await writeContract({
        address: StakingAddress,
        abi: raffleAbi,
        functionName: 'claim',
        account: address
      })
      const claimData = await waitForTransaction({
        hash: claim.hash
      })
      console.log('claimData', claimData)
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setConfirming(false);
    }
  };

  const onTokenWithdraw = async (amount) => {
    try {
      setConfirming(true);
      let WithdrawAmounts;
      WithdrawAmounts = `0x${(Number(amount) * (10 ** 6)).toString(16)}`;
      const withdraw = await writeContract({
        address: StakingAddress,
        abi: raffleAbi,
        functionName: 'withdrawUsdt',
        account: address,
        args: [WithdrawAmounts]
      })
      const withdrawData = await waitForTransaction({
        hash: withdraw.hash
      })
      setTimeout(function () {
        setConfirming(false);
      }, 3000)
    } catch (err) {
      setConfirming(false);
    }
  };

  const setMaxAmount = async () => {
    setTokenAmount(Number(tokenBalance) / Math.pow(10, 6));
    setMaxSet(maxBalance);
  };

  const setMaxWithdrawAmount = async () => {
    setWithdrawAmount(Number(withdrawableAmount));
    // setMaxWithdrawSet(maxWithdrawBalance);
  };

  return (
    <main>
      <div className="GlobalContainer">
        {address ?
          chain?.id === 11155111 ?
            <div className="MainDashboard">
              <section className="ContactBox">
                <>
                  <section className="ContractContainer">
                    <section className="DepositBoxHeader">
                      <p className="ContractContentTextTitle">USDT Vault</p>
                    </section>
                    <Tabs className="TabContainer">
                      <TabList className="TabList">
                        <Tab className="TabTitle1">Deposit</Tab>
                        <Tab className="TabTitle2">Withdraw</Tab>
                      </TabList>
                      <TabPanel>
                        <div className='TabContents'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl.toFixed(0)} USDT &nbsp;  &nbsp; </p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy1).toFixed(2)}  %</p> */}
                              <p className='Text1'>&nbsp; 24  %</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Your Staked Amount : </p>
                              <p className='Text1'>&nbsp; {userAmount} USDT</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setTokenAmount}
                                value={tokenAmount}
                              />
                            </section>
                            <div onClick={() => setMaxAmount()} className="MaxButton">Max</div>
                          </section>
                          {Number(tokenAmount) > Number(allowance) ?
                            <section className="LockBox">
                              {confirming === false ?
                                Number(tokenBalance) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve USDT first</p>
                                    <button disabled={confirming === false ? false : true} onClick={() => onTokenAllowance()} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no USDT now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming}
                                    size={30}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                </>
                              }
                            </section>
                            :
                            <>
                              <section className="LockBox">
                                <p className='Text1'>Please enter your USDT Amount now!</p>
                                {confirming === false ?
                                  <>
                                    <section className="claimBox">
                                      <button disabled={tokenAmount > 0 ? false : true} onClick={() => onTokenStake(tokenAmount)} className="LockButton">Stake USDT Now!</button>
                                    </section>
                                  </>
                                  :
                                  <>
                                    {/* <p className='Text1'>Staking...</p> */}
                                    <ClipLoader
                                      color={'#36d7b7'}
                                      loading={confirming}
                                      size={30}
                                      aria-label="Loading Spinner"
                                      data-testid="loader"
                                    />
                                  </>
                                }
                              </section>
                            </>
                          }
                        </div>
                      </TabPanel>
                      <TabPanel>
                        <div className='TabContents'>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>TVL : </p>
                              <p className='Text1'>&nbsp; {tvl.toFixed(0)} USDT  &nbsp;  &nbsp;</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>APY : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 24 %</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>Withdraw Fee : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 0.75 %</p>
                            </div>
                          </div>
                          <div className='StakingBox'>
                            <div className='StakingInfo'>
                              <p className='HeaderText'>LOCK TIME : </p>
                              {/* <p className='Text1'>&nbsp; {Number(apy2).toFixed(2)} %</p> */}
                              <p className='Text1'>&nbsp; 2 WEEKS</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Pending Rewards Amount : </p>
                              <p className='Text1'>&nbsp; {userPendingRewards.toFixed(4)} USDT</p>
                            </div>
                          </div>
                          <div className='StakingBox1'>
                            <div className='LpBalance UserBalance'>
                              <p className='HeaderText'>Withdrawable Amount : </p>
                              <p className='Text1'>&nbsp; {withdrawableAmount.toFixed(4)} USDT</p>
                            </div>
                          </div>
                          <section className='inputPanel'>
                            <p>Amount : </p>
                            <section className='inputPanelHeader'>
                              <Input
                                placeholder="Enter amount"
                                label=""
                                type="number"
                                changeValue={setWithdrawAmount}
                                value={withdrawAmount}
                              />
                            </section>
                            <div onClick={() => setMaxWithdrawAmount()} className="MaxButton">Max</div>
                          </section>
                          {Number(withdrawAmount) > Number(allowance) ?
                            <section className="LockBox">

                              {confirming === false ?
                                Number(withdrawAmount) > 0 ?
                                  <>
                                    <p className='Text1'>Please approve USDT first</p>
                                    <button disabled={confirming === false ? false : true} onClick={() => onTokenAllowance()} className="LockButton">
                                      <p>Allow</p>
                                    </button>
                                  </>
                                  :
                                  <p className='Text1'>You have no USDT now</p>
                                :
                                <>
                                  <ClipLoader
                                    color={'#36d7b7'}
                                    loading={confirming}
                                    size={30}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                </>
                              }
                            </section>
                            :
                            <>
                              <section className="LockBox">
                                <p className='Text1'>Please enter your USDT Amount now!</p>
                                {confirming === false ?
                                  <>
                                    <section className="claimBox">
                                      {/* {Number(userPendingRewards) > 0 ?
                                        <button disabled={false} onClick={() => onTokenClaim()} className="LockButton">Claim USDT Now!</button>
                                        :
                                        <></>
                                      } */}
                                      {Number(withdrawableAmount) > 0 ?
                                        <button disabled={false} onClick={() => onTokenWithdraw(withdrawAmount)} className="LockButton">Withdraw USDT Now!</button>
                                        :
                                        <></>
                                      }
                                    </section>
                                  </>
                                  :
                                  <>
                                    {/* <p className='Text1'>Staking...</p> */}
                                    <ClipLoader
                                      color={'#36d7b7'}
                                      loading={confirming}
                                      size={30}
                                      aria-label="Loading Spinner"
                                      data-testid="loader"
                                    />
                                  </>
                                }
                              </section>
                            </>
                          }
                        </div>
                      </TabPanel>
                    </Tabs>
                    <div className="explanation">
                      <p>This vault utilizes a non-directional trading strategy to achieve high yields. </p>
                      <p> By taking simultaneous long and short positions,</p>
                      <p> it earns funding from the short position while avoiding directional risk.</p>
                    </div>
                  </section>

                </>
              </section>
            </div>
            :
            <section className="ConnectWalletBox">
              <p className="FirstNote">Please change chain</p>
              <div className="ConnectWalletBoxButton">
              </div>
            </section>
          :
          <section className="ConnectWalletBox">
            <p className="FirstNote">Please connect wallet first</p>
            <div className="ConnectWalletBoxButton">
              <button className="ConnectButton" type="submit" onClick={() => {
                onConnectWallet();
              }}>Enter App / Connect</button>
            </div>
          </section>
        }

      </div>
    </main >
  )
}

export default UsdtVault
