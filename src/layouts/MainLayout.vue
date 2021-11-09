<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding>
        <div class="mainContainer">
          <div class="dataContainer">
            <div class="header">👋 Hey there! Welcome to my Web3 space</div>

            <div class="bio q-mb-md">
              I am John, a software engineer passionate about the web3 space,
              and I have experience working in the african startup ecosystem.
              Software developer at startuplist.africa. pretty cool right?
              Connect your Ethereum wallet and Say Hi to John. You'll stand a
              chance to win some Ethereum
            </div>
            <q-input
              type="textarea"
              v-model="msg"
              v-if="currentAccount"
              class="textarea q-pa-md mdi-pap"
              placeholder="Say Hi 👋..."
            ></q-input>
            <q-btn
              color="primary"
              :disable="wait"
              :title="wait ? 'wait for 15 seconds' : 'Send'"
              icon="fas fa-paper-plane"
              v-if="currentAccount"
              class="waveButton"
              :loading="mining"
              @click="wave"
            />

            <button v-else class="waveButton" @click="connectWallet">
              Connect Wallet to Say Hi
            </button>
          </div>
        </div>
        <div class="text-bold text-center q-mt-lg">
          <div class="q-ml-md text-grey">People who said Hi to John</div>
        </div>
        <div class="q-pa-md row items-start q-gutter-md">
          <q-card class="my-card" v-for="(m, i) in allWaves" :key="i">
            <q-card-section>
              <div class="text-caption">{{ timeAgo(m.timestamp) }}</div>
            </q-card-section>
            <q-card-section>
              <div class="text-h6">{{ m.message }}</div>
            </q-card-section>
            <q-card-section>
              <div class="text-subtitle2">
                by {{ m.address | truncateAddress }}
              </div>
            </q-card-section>
          </q-card>
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
      contractAddress: "0x4B80787F158FD151C0DcE5876c56e5984C78373E",
      contractABI: abi.abi,
      currentAccount: null,
      msg: "",
      allWaves: [],
      mining: false,
      wait: false,
    };
  },
  mounted() {
    this.checkIfWalletIsConnected();
    this.registerEmitter();
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
          const accounts = await ethereum.request({ method: "eth_accounts" });

          if (accounts.length !== 0) {
            const account = accounts[0]; // choose the first account
            console.log("Found an authorized account:", account);
            this.setCurrentAccount(account);
            this.getAllWaves();
          } else {
            console.log("No authorized account found");
          }
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
        // wavePortalContract.on("NewWave", this.addWaveToListBeforeMine);
        // console.log("Connected", accounts[0]);
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

          // let count = await wavePortalContract.getTotalWaves();
          // console.log("Retrieved total wave count...", count.toNumber());

          /*
           * Execute the actual wave from your smart contract
           */
          const waveTxn = await wavePortalContract.wave(
            !this.msg ? "👋" : this.msg,
            { gasLimit: 300000 }
          );
          this.setMining();

          // console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          this.setMining();
          this.wait = true; // Cool-down
          setTimeout(() => {
            this.wait = false;
          }, 15000);
          // console.log("Mined -- ", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          await this.getAllWaves();
          // console.log("Retrieved total wave count...", count.toNumber());
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getAllWaves() {
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

          /*
           * Call the getAllWaves method from your Smart Contract
           */
          const waves = await wavePortalContract.getAllWaves();

          /*
           * We only need address, timestamp, and message in our UI so let's
           * pick those out
           */
          let wavesCleaned = [];
          waves.forEach((wave) => {
            wavesCleaned.unshift({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
            });
          });

          /*
           * Store our data in React State
           */
          this.setAllWaves(wavesCleaned);
          // console.log(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    },
    addWaveToListBeforeMine(from, timestamp, message) {
      console.log("emitted");
      this.allWaves.unshift({
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      });
    },
    setCurrentAccount(account) {
      this.currentAccount = account;
    },
    setAllWaves(waves) {
      this.allWaves = waves;
    },
    setMining() {
      this.mining = !this.mining;
    },
    registerEmitter() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const wavePortalContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        wavePortalContract.on("NewWave", this.addWaveToListBeforeMine);
      }

      return () => {
        if (wavePortalContract) {
          wavePortalContract.off("NewWave", this.addWaveToListBeforeMine);
        }
      };
    },
  },
  filters: {
    truncateAddress(val) {
      return `${val.slice(0, 18)}...${val.slice(-4)}`;
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
.tableContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  /* background: #eee; */

  margin-top: 20px;
}
.dataContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
}

.header {
  text-align: center;
  font-size: 31px;
  font-weight: 600;
}

.bio {
  text-align: center;
  color: gray;
  margin-top: 16px;
  font-size: 16px;
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
.textarea {
  background: rgba(221, 221, 221, 0.658);
}
.my-card {
  width: 100%;
  max-width: 250px;
}
</style>
