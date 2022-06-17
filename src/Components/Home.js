import React, { useState, useEffect } from 'react'
import eventBus from './EventBus'

let timeId = null, approved = false

function Home() {

    const [nfts, setNfts] = useState([])
    const [reward, setReward] = useState(0)
    const [amount, setAmount] = useState('')
    const [stakedNFTs, setStakedNFTs] = useState([])
    const [totalSupply, setTotalSupply] = useState(0)
    const [currentSupply, setCurrentSupply] = useState(0)
    const [stakedNFTAmount, setStakedNFTAmount] = useState(0)
    const [isInWhitelist, setIsInWhitelist] = useState(false)
    const [isPresaleStarted, setIsPresaleStarted] = useState(false)
    const [isPublicsaleStarted, setIsPublicsaleStarted] = useState(false)

    const onStateUpdated = (data) => {
        setReward(data.reward)
        setTotalSupply(data.totalSupply)
        setCurrentSupply(data.currentSupply)
        setIsInWhitelist(data.isInWhitelist)
        setStakedNFTAmount(data.stakedNFTAmount)
        setIsPresaleStarted(data.isPresaleStarted)
        setIsPublicsaleStarted(data.isPublicsaleStarted)
    }

    const onImageUpdated = (data) => {
        setNfts(data.nfts)
        setStakedNFTs(data.stakedNFTs)
    }

    const emitMintNFT = () => {
        eventBus.dispatch('mintNFT', {
            amount
        })
    }

    const emitStakeNFT = async () => {
        if(approved === true) {
            let id = document.getElementById("stakeNFTList").value
            if(parseInt(id) !== undefined) {
                eventBus.dispatch('stakeNFT', {
                    tokenId: parseInt(id)
                })
            }
        } else {
            eventBus.dispatch('approveAll', {})
        }
    }

    const emitUnstakeNFT = () => {
        let id = document.getElementById("unstakeNFTList").value
        if(parseInt(id) !== undefined) {
            eventBus.dispatch('unstakeNFT', {
                tokenId: parseInt(id)
            })
        }
    }

    const emitUnstakeAll = () => {
        eventBus.dispatch('unstakeAll', {})
    }

    const emitClaimReward = () => {
        eventBus.dispatch('claimReward', {})
    }

    useEffect(() => {
        timeId = setInterval(() => {
            eventBus.dispatch('updateState', {})
        }, 30000)

        eventBus.on('approved', () => {
            approved = true;
        })
        eventBus.on('stateUpdated', (data) => {
            onStateUpdated(data)
        })
        eventBus.on('imageUpdated', (data) => {
            onImageUpdated(data)
        })

        return () => {
            eventBus.remove('stateUpdated', (data) => {
                onStateUpdated(data)
            })
            eventBus.remove('imageUpdated', (data) => {
                onImageUpdated(data)
            })
            clearInterval(timeId)
        }
    }, [])

    return (
        <section className='relative w-full flex flex-col justify-center place-items-center divide-y-2'>
            <h1 className='text-5xl text-gray-500 font-bold pt-10 pb-5'>Minting Test Dapp</h1>
            <div className='w-1/2 flex flex-col justify-center place-items-center py-10 space-y-8'>
                <div className='text-center space-y-3'>
                    <h1 className='text-2xl'>Mint Status: { isPresaleStarted ? "Presale" : `${ isPublicsaleStarted ? 'Public Sale' : '?'}`}</h1>
                    <h1 className='text-lg'>Mintable NFT: { (isPresaleStarted || isPublicsaleStarted) ? `${currentSupply} / ${totalSupply}` : '?' }</h1>
                    <h1 className='text-lg'>Is in Whitelist: { (isPresaleStarted || isPublicsaleStarted) ? `${isInWhitelist}` : '?' }</h1>
                </div>
                <div className='flex flex-row space-x-5'>
                    <input
                        className='text-xl px-3 py-2 border border-gray-400 outline-none focus:outline-none'
                        onChange={(e) => setAmount(e.target.value)}
                        type="text" placeholder='0' />
                    <button
                        className='bg-gray-800 text-white px-5 hover:opacity-70'
                        onClick={() => emitMintNFT()}>Mint</button>
                </div>
            </div>

            <div className='w-4/5 flex flex-col justify-center place-items-center py-10 space-y-5'>
                <h1 className='text-3xl text-gray-700'>Your NFTs in Wallet</h1>
                <div className='w-full flex flex-row flex-wrap justify-start'>
                    { nfts.length > 0 && nfts.map((item, i) => {
                        return (
                            <div className='w-1/3 px-3 py-3' key={i}>
                                <img className='object-fit' src={item.image} alt=""></img>
                            </div>
                        )
                    })}
                    { nfts.length === 0 &&
                        <div className='w-full flex justify-center'>
                            <p className='italic py-7'>There is no nft in your wallet.</p>
                        </div>
                    }
                </div>
            </div>

            <div className='w-4/5 flex flex-col justify-center place-items-center py-10'>
                <h1 className='text-3xl text-gray-900 pb-10'>NFT Staking</h1>
                <div className='w-full flex flex-col justify-center place-items-center space-y-8'>
                    <div className='text-center space-y-3'>
                        <h1 className='text-lg'>Staked NFT: { stakedNFTAmount }</h1>
                        <h1 className='text-lg'>Reward: { reward }</h1>
                    </div>
                    <div className='flex flex-row space-x-20 divide-x-2'>
                        <div className='flex flex-row space-x-5'>
                            <select
                                className='py-2 w-32 border border-gray-400 bg-gray-200 focus:outline-none'
                                name="stakeNFTList"
                                id="stakeNFTList"
                            >
                                { nfts.length > 0 && nfts.map((item, i) => {
                                    return (
                                        <option value={item.id} key={i}>{item.id}</option>
                                    )
                                })}
                            </select>
                            <button
                                className='bg-gray-800 text-white px-5 hover:opacity-70'
                                onClick={() => emitStakeNFT()}>{ approved === true ? "Stake" : "Approve" }</button>
                        </div>
                        <div className='flex flex-row space-x-5'>
                            <select
                                className='py-2 w-32 border border-gray-400 bg-gray-200 focus:outline-none'
                                name="unstakeNFTList"
                                id="unstakeNFTList"
                            >
                                { stakedNFTs.length > 0 && stakedNFTs.map((item, i) => {
                                    return (
                                        <option value={item.id} key={i}>{item.id}</option>
                                    )
                                })}
                            </select>
                            <button
                                className='bg-gray-800 text-white px-5 hover:opacity-70'
                                onClick={() => emitUnstakeNFT()}>Unstake</button>
                        </div>
                    </div>

                    <div className='flex flex-row space-x-5'>
                        <button
                            className='bg-gray-800 text-white px-5 py-2 hover:opacity-70'
                            onClick={() => emitUnstakeAll()}>Unstake All</button>
                        <button
                            className='bg-gray-800 text-white px-5 py-2 hover:opacity-70'
                            onClick={() => emitClaimReward()}>Claim Reward</button>
                    </div>
                </div>
            </div>

            <div className='w-4/5 flex flex-col justify-center place-items-center py-10 space-y-5'>
                <h1 className='text-3xl text-gray-700'>Your NFTs Staked in Contract</h1>
                <div className='w-full flex flex-row flex-wrap justify-start'>
                    { stakedNFTs.length > 0 && stakedNFTs.map((item, i) => {
                        return (
                            <div className='w-1/3 px-3 py-3' key={i}>
                                <img className='object-fit' src={item.image} alt=""></img>
                            </div>
                        )
                    })}
                    { stakedNFTs.length === 0 &&
                        <div className='w-full flex justify-center'>
                            <p className='italic py-7'>There is no nft staked in the contract.</p>
                        </div>
                    }
                </div>
            </div>
        </section>
    )
}

export default Home