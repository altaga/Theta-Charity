import { ethers } from "ethers";
import React, { Component } from "react";
import autoBind from "react-autobind";
import Web3 from "web3";
import { abiERC20 } from "../contracts/erc20";
import ContextModule from "../utils/contextModule";
import usersData from "../constants/usersData";
import tokensData from "../constants/tokensData";

function epsilonRound(num, zeros = 10000) {
  return Math.round((num + Number.EPSILON) * zeros) / zeros;
}

function getUserData(usersData, nameURL) {
  let temp = {};
  for (let i = 0; i < usersData.length; i++) {
    if (nameURL === usersData[i].nameURL) {
      temp = usersData[i];
    }
  }
  return temp;
}

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: "0",
      charity: "",
      donors: [],
      donnors: [],
      streamer: getUserData(usersData, this.props.params.nameurl),
      tokenPrices: {
        theta: 0,
        tfuel: 0,
        wtheta: 0,
      },
      tokenBalances: {
        theta: 0,
        tfuel: 0,
        wtheta: 0,
      },
    };
    autoBind(this);
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RPC
    );
    this.web3 = new Web3(process.env.REACT_APP_RPC);
    this.contract = null;
    this.counter = 0;
    this.fetchBalances = null;
    this.balanceCheck = null;
    this.flag = true;
  }

  static contextType = ContextModule;

  async prices() {
    return new Promise((resolve, reject) => {
      var myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=theta-token,theta-fuel&vs_currencies=usd",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => resolve(JSON.parse(result)))
        .catch((error) => console.log("error", error));
    });
  }

  async getBalanceToken(address, tokenAddress) {
    return new Promise(async (resolve, reject) => {
      const contract = new ethers.Contract(
        tokenAddress,
        abiERC20,
        this.provider
      );
      let res = await contract.balanceOf(address);
      let decimals = await contract.decimals();
      resolve(res / Math.pow(10, decimals));
    });
  }

  async getBalances(address) {
    return new Promise((resolve, reject) => {
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      fetch(
        `https://explorer.thetatoken.org:8443/api/account/update/${address}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => resolve(result.body.balance))
        .catch((error) => console.log("error", error));
    });
  }

  async componentDidMount() {
    await this.refreshBalance();
    this.balanceCheck = setInterval(async () => {
      if (this.flag) {
        this.flag = false;
        await this.refreshBalance();
        this.flag = true;
      }
    }, 10000);
  }

  async refreshBalance() {
    let tokenPrices = {};
    let tokenBalances = {};
    let [contractBalance, tempPrices, wThetaBalance] = await Promise.all([
      this.getBalances(this.state.streamer.publicKey),
      this.prices(),
      this.getBalanceToken(
        this.state.streamer.publicKey,
        "0xaf537fb7e4c77c97403de94ce141b7edb9f7fcf0"
      ),
    ]);
    tokenPrices = {
      theta: tempPrices["theta-token"].usd,
      tfuel: tempPrices["theta-fuel"].usd,
      wtheta: tempPrices["theta-token"].usd,
    };
    tokenBalances = {
      theta: ethers.utils.formatEther(contractBalance["thetawei"]),
      tfuel: ethers.utils.formatEther(contractBalance["tfuelwei"]),
      wtheta: wThetaBalance.toString(),
    };
    this.setState({
      tokenBalances,
      tokenPrices,
    });
  }

  componentWillUnmount() {
    clearInterval(this.balanceCheck);
  }

  render() {
    return (
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "0px",
          height: "94%",
          width: "20%",
          backgroundColor: "#18181b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          borderRight: "1px solid",
          borderTop: "1px solid",
        }}
      >
        <div
          style={{
            fontSize: "1.2rem",
            textAlign: "center",
            height: "20%",
            marginTop: "20px",
          }}
        >
          <span
            style={{ cursor: "pointer", color: "white" }}
            onClick={() =>
              window.open(
                `https://explorer.thetatoken.org/address/${this.state.streamer.publicKey}`,
                "_blank"
              )
            }
          >
            Charity:
            <br />
            {this.state.streamer.charity}
            <br />
            <br />
            Contract Address:
            <br />
            {this.state.streamer.publicKey.substring(0, 10)}
            ...
            {this.state.streamer.publicKey.substring(
              this.state.streamer.publicKey.length - 10,
              this.state.streamer.publicKey.length
            )}
          </span>
          <div style={{ marginTop: "10%" }} />
          <span style={{ color: "white" }}>
            <span style={{ fontWeight: "bold", fontSize: 30 }}>
              {epsilonRound(
                Object.keys(this.state.tokenPrices)
                  .map((item) => this.state.tokenPrices[item])
                  .reduce(
                    (partialSum, a, index) =>
                      partialSum +
                      a *
                        Object.keys(this.state.tokenBalances).map(
                          (item) => this.state.tokenBalances[item]
                        )[index],
                    0
                  )
              ).toString()}{" "}
              USD
            </span>
            <div style={{ marginTop: "1%" }} />
            Raised
            <div style={{ marginTop: "10%" }} />
          </span>
        </div>
        <div
          style={{
            borderBottom: "1px solid",
            width: window.innerWidth * 0.2,
            marginTop: "35%",
          }}
        />
        <div
          className="hideScrollbar"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "2rem",
            textAlign: "center",
            overflowY: "scroll",
            width: "100%",
            height: "80%",
          }}
        >
          {Object.keys(tokensData).map((item, index) => (
            <React.Fragment key={"balancesKeys:" + index}>
              <div>{tokensData[item].name}</div>
              <div
                key={"elementsd" + index}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div>
                  {epsilonRound(
                    parseFloat(
                      this.state.tokenBalances[tokensData[item].nameRef]
                    )
                  ).toString()}{" "}
                </div>
                <img
                  src={tokensData[item].icon}
                  style={{
                    marginLeft: "10px",
                    borderRadius: "20px",
                    width: "2rem",
                    height: "2rem",
                  }}
                />
              </div>
              <br />
            </React.Fragment>
          ))}
          <div style={{ marginTop: window.innerHeight * 0.03 }} />
        </div>
      </div>
    );
  }
}

export default Summary;
