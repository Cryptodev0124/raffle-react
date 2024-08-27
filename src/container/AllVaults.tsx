import React, { useState, useEffect } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../App.css'
import UsdtAbi from '../config/UsdtAbi.json'
import raffleAbi from '../config/raffleAbi.json'
import styles from "../pages/App.module.scss";
import "../styles/StakingContainer.css";
import Input from "../components/Input.tsx";
import ClipLoader from "react-spinners/ClipLoader";
import { useWeb3Modal } from "@web3modal/react";
import { waitForTransaction, readContract, writeContract } from '@wagmi/core'
import Type from "../Type";
import ticketImg from "../icons/ticket1.png";
import userBadgeImg from "../icons/user-badge.png";
import winnerBadgeImg from "../icons/winner-badge.png";
import rightBadgeImg from "../icons/right-badge.png";
import { Link } from 'react-router-dom';
import { shorten } from '../utils/shorten.ts';
import { shortenTable } from '../utils/shortenTable.ts';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'


const AllVaults = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [tokenAmount, setTokenAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  let [confirming, setConfirming] = useState(false);
  const raffleAddress = "0x329633ED1Ca833d0F1577aEFFb8333bDB678B27f";
  const TokenAddress = "0x029C58A909fBe3d4BE85a24f414DDa923A3Fde0F";

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
  const [isApproved, setApproved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // const [error, setError] = useState('')
  const [winningPools, setWinningPools] = useState('')
  const [winner, setWinner] = useState([])
  const [currentRound, setCurrentRound] = useState(1)
  const [ticketLeft, setTicketLeft] = useState(30)
  const [requiedIraAmount, setIraAmount] = useState(0);
  const [userPurchased, setUserPurchased] = useState(0);
  const [latestWinner, setLatestWinner] = useState('');


  useEffect(() => {
    const switchChain = async () => {
      try {
        switchNetwork?.(8453)
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true) {
      if (chain.id !== 8453)
        switchChain();
    }
  }, [isConnected, chain?.id, switchNetwork])

  const { data, error: readContractsError } = async () => await readContract({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: 'getWinners'
  })

  useEffect(() => {
    if (readContractsError) {
      setError('Error loading data')
      setIsLoading(false)
      return
    }

    if (data && data[0]) {
      setWinningPools(data[0].result)
      setIsLoading(false)
    }
  }, [data, readContractsError])

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
        const winners = await readContract({ address: raffleAddress, abi: raffleAbi, functionName: 'getWinners' });
        const required_ira = await readContract({ address: raffleAddress, abi: raffleAbi, functionName: 'getIRATokenAmount', args: [10 * 1e6] });
        const tokenAllowance = await readContract({ address: TokenAddress, abi: UsdtAbi, functionName: 'allowance', args: [address, raffleAddress] });
        const tokenAmount = await readContract({ address: TokenAddress, abi: UsdtAbi, functionName: 'balanceOf', args: [address] });
        const current_round = await readContract({ address: raffleAddress, abi: raffleAbi, functionName: 'getCurrentRound' });
        const ticket_left = await readContract({ address: raffleAddress, abi: raffleAbi, functionName: 'getTicketsLeft' });
        const user_purchased = await readContract({ address: raffleAddress, abi: raffleAbi, functionName: 'ticketsOf', args: [address] });
        // const rewardPerYear = Number(totalInfo[1]) * 60 * 60 * 24 * 365;
        console.log("winners", winners, required_ira, tokenAmount);
        setWinner(winners);
        setTokenAmount(tokenAmount);
        setTokenBalance(tokenAmount);
        setMaxBalance(tokenAmount);
        setCurrentRound(current_round);
        setTicketLeft(ticket_left);
        setIraAmount(required_ira);
        setUserPurchased(user_purchased);
        setLatestWinner(winners[winners.length - 1].winnerAddress);
        // setMaxWithdrawBalance(withdrawableAmount);
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && chain?.id === 8453 && address && (confirming === false)) {
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
        args: [raffleAddress, 9999999999999999999999999],
        account: address
      })
      setApproved(true);
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

  const onTokenStake = async () => {
    try {
      setConfirming(true);
      const deposit = await writeContract({
        address: raffleAddress,
        abi: raffleAbi,
        functionName: 'buyTicket',
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

  return (
    <main>
      <div className="GlobalContainer">
        {address ?
          chain?.id === 8453 ?
            <div className="MainDashboard">
              <section className="ContactBox">
                <>
                  <style>
                    {`
                      .glow {
                          // font-size: 40px;
                          color: #fff;
                          text-align: center;
                          animation: glow 1s ease-in-out infinite alternate;
                        }

                        @-webkit-keyframes glow {
                          from {
                            text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #3976fe, 0 0 40px #3976fe, 0 0 50px #3976fe, 0 0 60px #3976fe, 0 0 70px #3976fe;
                          }
                          
                          to {
                            text-shadow: 0 0 20px #fff, 0 0 30px #103ea4, 0 0 40px #103ea4, 0 0 50px #103ea4, 0 0 60px #103ea4, 0 0 70px #103ea4, 0 0 80px #103ea4;
                          }
                        }

                        .hover-animation:hover {
                          transform: scale(1.02);
                          box-shadow: 0 0 10px #0073e633, 0 0 20px #0073e633, 0 0 30px #0073e633, 0 0 40px #0073e633, 0 0 50px #0073e633, 0 0 60px #0073e633;
                          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                        }

                        .blue-glow {
                          animation: blue-glow 1.25s ease-in-out infinite alternate;
                          font-size: 32px;
                        }

                        @-webkit-keyframes blue-glow {
                          from {
                            text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
                          }
                          
                          to {
                            text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
                          }
                        }
                      `}
                  </style>
                  <section className="ContractContainer">
                    <div className="badgeSection">
                      <div className="badgeInfos">
                        <div className="badgeUserInfo">
                          <img src={userBadgeImg} alt="" width="80px" />
                          <p className="badgeText glow">You purchased {Number(userPurchased)} tickets</p>
                        </div>
                        <div className="badgeUserInfo">
                          <img src={winnerBadgeImg} width="80px" alt="" />
                          <p className="badgeText glow">Latest Winner: {latestWinner ? shorten(latestWinner) : "No winner yet"}</p>
                        </div>
                      </div>
                      <div className="badgeImage">
                        <img src={rightBadgeImg} width="150px" alt="" />
                      </div>
                    </div>
                    <div className="topSection">
                      <div className={styles.Introduction}>
                        <div className={styles.Line2}>
                          <span className={styles.ChangeableText}>
                            <Type />
                          </span>
                        </div>
                      </div>
                      <div className='buySection'>
                        <div className='buyInfoSection'>
                          <div className='infos'>
                            <p className="infoText text-md font-extrabold text-center text-blue-700">Current Round:</p>
                            <p className='infoText font-extrabold uppercase text-center text-white glow'>{Number(currentRound)}</p>
                          </div>
                          <div className='infos'>
                            <p className="infoText text-md font-extrabold text-center text-blue-700">Tickets Left:</p>
                            <p className='infoText font-extrabold uppercase text-center text-white glow'>{Number(ticketLeft)}</p>
                          </div>
                        </div>
                        <div className='marketingSection text-md font-extrabold text-center pt-5'>
                          <div className='ticketPrice'>
                            <p className='ticketInfo infoText'>Ticket Price:</p>
                            <p className='ticketInfo infoText'>$10 IRA</p>
                          </div>
                          <div className='marketing'>
                            <p className='ticketInfo infoText'>$10 to win $250</p>
                          </div>
                          <div className='marketing'>
                            <p className='ticketInfo infoText'>{(Number(requiedIraAmount) / 10 ** 18).toFixed(2)} IRAs / Ticket</p>
                          </div>
                        </div>
                        <div className='imgSection text-md font-extrabold text-center pt-5'>
                          <img src={ticketImg} className='ticketImg' alt='' width="250px" />
                        </div>

                      </div>
                      <div className='TabContents'>
                        {!isApproved ?
                          <section className="LockBox">
                            {confirming === false ?
                              Number(Number(tokenBalance)) > (Number(requiedIraAmount)) ?
                                <>
                                  <button disabled={confirming === false ? false : true} onClick={() => onTokenAllowance()} className="LockButton">
                                    <p>APPROVE</p>
                                  </button>
                                </>
                                :
                                <>
                                  <p className='Text1'>You do not have enough IRA tokens</p>
                                  <button disabled={true} className="LockButton">
                                    <p>BUY TICKET</p>
                                  </button>
                                </>
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
                              {confirming === false ?
                                <>
                                  <section className="claimBox">
                                    <button disabled={Number(tokenAmount) > 0 ? false : true} onClick={() => onTokenStake()} className="LockButton">BUY TICKET</button>
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
                    </div>
                    <div className="winnerSection">
                      <div className="winnerSectionInner">
                        <div className="winnerLabel">
                          Last Winners
                        </div>
                        <TableContainer borderRadius='16px'>
                          <Table variant='simple' size='lg'>
                            {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
                            <Thead bg="#25224f">
                              <Tr >
                                <Th color='white' style={{ textAlign: "center" }}>ROUND</Th>
                                <Th isNumeric color='white' style={{ textAlign: "center" }}>WINNER ADDRESS</Th>
                              </Tr>
                            </Thead>
                            <Tbody bg="#00000090">
                              {(winner.length > 0) ?
                                winner?.map((winner) => {
                                  return <Tr>
                                    <Td style={{ textAlign: "center" }}>{Number(winner.round)}</Td>
                                    <Td style={{ textAlign: "center" }}>{window.innerWidth >= 768 ? winner.winnerAddress : shortenTable(winner.winnerAddress)}</Td>
                                  </Tr>
                                })
                                :
                                <Tr><Td colSpan={2} textAlign="center" verticalAlign="middle">No Winner yet.</Td></Tr>

                              }
                            </Tbody>
                            {/* <Tfoot>
                              <Tr>
                                <Th>To convert</Th>
                                <Th>into</Th>
                                <Th isNumeric>multiply by</Th>
                              </Tr>
                            </Tfoot> */}
                          </Table>
                        </TableContainer>
                        {/* <div className="flex justify-center my-4">
                          <button
                            className="px-2 py-1 mx-1 bg-[#FFFFFF33] text-white rounded"
                            onClick={() => handlePageChange(1)}
                          >
                            &lt;&lt;
                          </button>
                          <button
                            className="px-2 py-1 mx-1 bg-[#FFFFFF33] text-white rounded"
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          >
                            &lt;
                          </button>
                          {pageNumbers.map((pageNumber, index) => {
                            if (typeof pageNumber === 'number') {
                              return (
                                <button
                                  key={pageNumber}
                                  className={`px-2 py-1 mx-1 ${currentPage === pageNumber
                                    ? 'bg-purple-500 glow text-white'
                                    : 'bg-[#FFFFFF33] text-white'
                                    } rounded`}
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              )
                            } else {
                              return (
                                <span
                                  key={pageNumber}
                                  className="px-2 py-1 mx-1 bg-transparent text-white rounded"
                                >
                                  ...
                                </span>
                              )
                            }
                          })}
                          <button
                            className="px-2 py-1 mx-1 bg-[#FFFFFF33] text-white rounded"
                            onClick={() =>
                              handlePageChange(Math.min(currentPage + 1, totalPages))
                            }
                          >
                            &gt;
                          </button>
                          <button
                            className="px-2 py-1 mx-1 bg-[#FFFFFF33] text-white rounded"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            &gt;&gt;
                          </button>
                        </div> */}
                      </div>
                    </div>
                    <div className="disclaimerSection">
                      <p>
                      *Disclaimer: Please note that the value of the IRA token is volatile, and the price per token may fluctuate before the end of each raffle round. As a result, the number of tokens you receive could differ from the advertised dollar value. You will receive 90% of the total tokens collected during that round.
                      </p>
                    </div>
                  </section>
                </>
              </section>
            </div>
            :
            <section className="ConnectWalletBox">
              <p className="FirstNote">Please change Network to Base</p>
              <div className="ConnectWalletBoxButton">
              </div>
            </section>
          :
          <div className="MainDashboard">
            <section className="ContactBox">
              <>
                <style>
                  {`
                    .glow {
                        // font-size: 40px;
                        color: #fff;
                        text-align: center;
                        animation: glow 1s ease-in-out infinite alternate;
                      }

                      @-webkit-keyframes glow {
                        from {
                          text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #3976fe, 0 0 40px #3976fe, 0 0 50px #3976fe, 0 0 60px #3976fe, 0 0 70px #3976fe;
                        }
                        
                        to {
                          text-shadow: 0 0 20px #fff, 0 0 30px #103ea4, 0 0 40px #103ea4, 0 0 50px #103ea4, 0 0 60px #103ea4, 0 0 70px #103ea4, 0 0 80px #103ea4;
                        }
                      }

                      .hover-animation:hover {
                        transform: scale(1.02);
                        box-shadow: 0 0 10px #0073e633, 0 0 20px #0073e633, 0 0 30px #0073e633, 0 0 40px #0073e633, 0 0 50px #0073e633, 0 0 60px #0073e633;
                        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                      }

                      .blue-glow {
                        animation: blue-glow 1.25s ease-in-out infinite alternate;
                        font-size: 32px;
                      }

                      @-webkit-keyframes blue-glow {
                        from {
                          text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
                        }
                        
                        to {
                          text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
                        }
                      }
                    `}
                </style>
                <section className="ContractContainer">
                  <div className="badgeSection">
                    <div className="badgeInfos">
                      {/* <div className="badgeUserInfo">
                        <img src={userBadgeImg} alt="" width="80px" />
                        <p className="badgeText glow">You purchased {Number(userPurchased)} tickets</p>
                      </div> */}
                      <div className="badgeUserInfo">
                        <img src={winnerBadgeImg} width="80px" alt="" />
                        <p className="badgeText glow">Latest Winner: {latestWinner ? shorten(latestWinner) : "No winner yet"}</p>
                      </div>
                    </div>
                    <div className="badgeImage">
                      <img src={rightBadgeImg} width="150px" alt="" />
                    </div>
                  </div>
                  <div className="topSection">
                    <div className={styles.Introduction}>
                      <div className={styles.Line2}>
                        <span className={styles.ChangeableText}>
                          <Type />
                        </span>
                      </div>
                    </div>
                    <div className='buySection'>
                      <div className='buyInfoSection'>
                        <div className='infos'>
                          <p className="infoText text-md font-extrabold text-center text-blue-700">Current Round:</p>
                          <p className='infoText font-extrabold uppercase text-center text-white glow'>{Number(currentRound)}</p>
                        </div>
                        <div className='infos'>
                          <p className="infoText text-md font-extrabold text-center text-blue-700">Tickets Left:</p>
                          <p className='infoText font-extrabold uppercase text-center text-white glow'>{Number(ticketLeft)}</p>
                        </div>
                      </div>
                      <div className='marketingSection text-md font-extrabold text-center pt-5'>
                        <div className='ticketPrice'>
                          <p className='ticketInfo infoText'>Ticket Price:</p>
                          <p className='ticketInfo infoText'>$10 IRA</p>
                        </div>
                        <div className='marketing'>
                          <p className='ticketInfo infoText'>$10 to win $250</p>
                        </div>
                        <div className='marketing'>
                          <p className='ticketInfo infoText'>{(Number(requiedIraAmount) / 10 ** 18).toFixed(2)} IRAs / Ticket</p>
                        </div>
                      </div>
                      <div className='imgSection text-md font-extrabold text-center pt-5'>
                        <img src={ticketImg} className='ticketImg' alt='' width="250px" />
                      </div>

                    </div>
                    <section className="ConnectWalletBox">
                      <p className="FirstNote">Please connect wallet first</p>
                      <div className="ConnectWalletBoxButton" style={{ marginBottom: "30px" }}>
                        <button className="ConnectButton" type="submit" onClick={() => {
                          onConnectWallet();
                        }}>Connect Wallet</button>
                      </div>
                    </section>
                  </div>
                </section>
              </>
            </section>
            <div style={{ marginBottom: "30px" }}></div>
          </div>
        }
      </div>
    </main >
  )
}

export default AllVaults
