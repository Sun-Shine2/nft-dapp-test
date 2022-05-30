import React from 'react';
import Web3 from 'web3';
import { BigNumber } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import eventBus from './Components/EventBus';
import contractInfo from './contractInfo'
import Whitelist from './Class/Whitelist';

import Header from './Layouts/Header';
import Home from './Components/Home';
import './App.css';

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

let web3, contract;

class Container extends React.Component {

  constructor() {
    super()

    this.state = {
      address: '',
      nativeBalance: 0,
      isConnected: false,
      isPresaleStarted: false,
      isPublicsaleStarted: false,
      mintPrice: "0.012"
    }

    this.Whitelist = new Whitelist()

    this.connectWallet = this.connectWallet.bind(this)
    this.scanConnectedWallet = this.scanConnectedWallet.bind(this)
    this.displayNotification = this.displayNotification.bind(this)
  }

  async connectWallet() {
    if(this.state.isConnected === true) return

    if (window.ethereum) {
      (async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // await window.ethereum.request({
        //   method: 'wallet_switchEthereumChain',
        //   params: [{ chainId: '0x38' }]
        // });

        let accounts = await web3.eth.getAccounts();
        let nativeBalance = await web3.eth.getBalance(accounts[0]);
        
        this.setState({
          address: accounts[0],
          nativeBalance: nativeBalance,
          isConnected: true
        })
        
        eventBus.dispatch('walletConnected', { 
          'address': accounts[0],
          'nativeBalance': nativeBalance
        })
        eventBus.dispatch('updateState', {})
        this.fetchNFTs()
      })()
    } else {
      alert('Install Metamask please.');
    }
  }

  scanConnectedWallet() {
    if(this.state.isConnected === true) return;

    web3.eth.getAccounts(async (err, accounts) => {
        if (err != null) {
            console.error("An error occurred: " + err)
        }
        else if (accounts.length !== 0 ) {
            // if(await web3.eth.getChainId() !== 56) {
            //   await window.ethereum.request({
            //     method: 'wallet_switchEthereumChain',
            //     params: [{ chainId: '0x38' }]
            //   });
            // }
            let nativeBalance = await web3.eth.getBalance(accounts[0]);

            this.setState({
              address: accounts[0],
              nativeBalance: nativeBalance,
              isConnected: true
            })

            eventBus.dispatch('walletConnected', { 
              'address': accounts[0],
              'nativeBalance': nativeBalance
            })
            eventBus.dispatch('updateState', {})
            this.fetchNFTs()
        }
    })
  }

  mintNFT = async (amount) => {
    if(!this.state.isConnected) {
      return
    }

    if(this.state.isPresaleStarted) {
      if(this.Whitelist.isInWhitelist(this.state.address)) {
        contract.methods.mintPresale(amount, this.Whitelist.getMerkleProof(this.state.address)).send({
          from: this.state.address,
          to: contractInfo.address,
          value: BigNumber.from(web3.utils.toWei(this.state.mintPrice, 'ether')).mul(BigNumber.from(amount)) 
        }).then(() => {
          this.displayNotification('success', 'You minted NFT successfully in presale mode.')

          eventBus.dispatch('updateState', {})
          this.fetchNFTs()
        }).catch(() => {
          this.displayNotification('error', 'Transaction error.')
        })
      }
      else {
        this.displayNotification('warning', 'You are not in whitelist.')
      }
    }
    else if(this.state.isPublicsaleStarted) {
      contract.methods.mint(amount).send({
        from: this.state.address,
        to: contractInfo.address,
        value: BigNumber.from(web3.utils.toWei(this.state.mintPrice, 'ether')).mul(BigNumber.from(amount)) 
      }).then(() => {
        this.displayNotification('success', 'You minted NFT successfully in public sale mode.')
        
        eventBus.dispatch('updateState', {})
        this.fetchNFTs()
      }).catch(() => {
        this.displayNotification('error', 'Transaction error.')
      })
    }
    else {
      this.displayNotification('warnning', 'Minting is not available now.')
    }
  }

  fetchNFTs = async () => {
    let nfts = []
    let balance = await contract.methods.balanceOf(this.state.address).call()
    for(let i = 0; i < balance; i ++) {
      let tokenId = await contract.methods.tokenOfOwnerByIndex(this.state.address, i).call()
      let tokenURI = await contract.methods.tokenURI(tokenId).call()
      let index = tokenURI.indexOf(`${tokenId}.json`)
      tokenURI = tokenURI.slice(0, index) + `${parseInt(tokenId) + 1}.json`

      let data = await fetch(tokenURI)
      let json = await data.json()
      let imageUrl = json.image
      nfts.push({
        id: tokenId,
        image: imageUrl
      })
    }

    eventBus.dispatch('imageUpdated', {
      nfts
    })
  }

  updateState = async () => {
    let isPresaleStarted = await contract.methods.presaleStarted().call()
    let isPublicsaleStarted = await contract.methods.publicSaleStarted().call()
    let totalSupply = await contract.methods.MAX_TOKENS().call()
    let currentSupply = await contract.methods.totalSupply().call()
    let isInWhitelist = this.Whitelist.isInWhitelist(this.state.address)

    this.setState({
      ...this.state,
      isPresaleStarted,
      isPublicsaleStarted
    })

    eventBus.dispatch('stateUpdated', {
      isPresaleStarted,
      isPublicsaleStarted,
      totalSupply,
      currentSupply,
      isInWhitelist
    })
  }

  displayNotification(appearance, text) {

    switch(appearance) {
        case 'warning':
            toast.warn(text); break
        case 'info':
            toast.info(text); break
        case 'error':
            toast.error(text); break
        case 'success':
            toast.success(text); break
        default: break
    }
  }

  componentDidMount() {
    console.log(this.Whitelist.getRootHash())

    if(window.ethereum) {
      web3 = new Web3(window.ethereum)
      contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address)

      this.scanConnectedWallet()
    }

    eventBus.on('walletConnection', () => {
      this.connectWallet()
    })
    eventBus.on('mintNFT', (e) => {
      this.mintNFT(e.amount)
    })
    eventBus.on('updateState', () => {
      this.updateState()
    })

    if(window.ethereum) {
      window.ethereum.on('disconnect', () => { 
          window.location.reload();
      });
      window.ethereum.on('chainChanged', () => {
          window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
          window.location.reload();
      })
    }

    return () => {
      eventBus.remove('walletConnection', () => {
        this.connectWallet()
      })
      eventBus.remove('mintNFT', (e) => {
        this.mintNFT(e.amount)
      })
      eventBus.remove('updateState', () => {
        this.updateState()
      })
    }
  }

  render() {
    return (
      <div className="relative">
        <ToastContainer />
        <div className='w-full shadow-xl'>
          <Header />
        </div>
        <Home />
      </div>
    )
  }
}

function App() {

  return (
    <Container />
  );
}

export default App;
