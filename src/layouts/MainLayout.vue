<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding>
        <div class="mainContainer">
          <div class="dataContainer">
            <div class="header">👋 Hey there! Welcome to a Web3 space</div>

            <div class="bio">
              I am John, a software engineer passionate about the web3 space,
              and I have experience working in the african startup ecosystem.
              Software developer at startuplist.africa. pretty cool right?
              Connect your Ethereum wallet and Say Hi to John. You'll stand a
              chance to win some Ethereum
            </div>
            <q-btn v-if="currentAccount" class="waveButton" @click="wave">
              <span class="wave">👋</span>
            </q-btn>

            <button v-else class="waveButton" @click="connectWallet">
              Connect Wallet to Say Hi
            </button>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import abi from "../utils/WavePortal.json";
import { ethers } from "ethers";
export default {
  name: "MainLayout",
  data() {
    return {
      contractAddress: "0x54980E075d3BC506E67F106FED9f317b67D159dC",
      contractABI: abi.abi,
      currentAccount: null,
    };
  },
  mounted() {
    this.checkIfWalletIsConnected();
  },
  methods: {
    async checkIfWalletIsConnected() {
      /*
       * First make sure we have access to window.ethereum
       */
      try {
        const { ethereum } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
          const account = accounts[0]; // choose the first account
          console.log("Found an authorized account:", account);
          this.setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      } catch (e) {
        console.log(e);
      }
    },

    async connectWallet() {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log("Connected", accounts[0]);
        this.setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error);
      }
    },

    async wave() {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(
            this.contractAddress,
            this.contractABI,
            signer
          );

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          /*
           * Execute the actual wave from your smart contract
           */
          const waveTxn = await wavePortalContract.wave();
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
  },
};
</script>
<style>
.mainContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  background: radial-gradient(#eee, #fff);
  padding: 20px 0;
  margin-top: 64px;
}
.dataContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
}

.header {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
}

.bio {
  text-align: center;
  color: gray;
  margin-top: 16px;
  font-size: 16px
}

.waveButton {
  cursor: pointer;
  margin-top: 16px;
  padding: 8px;
  border: 1px solid gray;
  border-radius: 5px;
  background: rgba(126, 117, 151, 0.253);
  font-weight: bold;
}
.wave {
  font-size: 25px;
}
</style>
