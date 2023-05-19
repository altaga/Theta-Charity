import React, { Component } from "react";
import { Client } from "@xmtp/xmtp-js";
import { Button, Input } from "reactstrap";
import autoBind from "react-autobind";
import { abi } from "../contracts/charity";
import { abiERC20 } from "../contracts/erc20";
import { ethers } from "ethers";
import Web3 from "web3";
import ContextModule from "../utils/contextModule";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import notif from "../assets/notification.mp3";
import usersData from "../constants/usersData";
import SyncIcon from "@mui/icons-material/Sync";
import SendIcon from "@mui/icons-material/Send";

function getUniqueListBy(arr, key) {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
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

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      loading: false,
      dm: false,
      to: "",
      amount: "0",
      message: "",
      token: JSON.stringify({
        name: "tFuel",
        contract: "",
      }),
      streamer: getUserData(usersData, this.props.params.nameurl),
      history: [
        {
          // Seed Value to Filter
          address: "",
          message: "",
        },
      ],
      historyDM: [
        {
          // Seed Value to Filter
          address: "",
          message: "",
        },
      ],
    };
    autoBind(this);
    this.messagesEndRef = React.createRef();
    this.web3 = new Web3(window.ethereum);
    this.web3provider = new Web3(window.ethereum);
    this.audio = new Audio(notif);
    this.conversation = null;
    this.socket = new WebSocket("wss://theta-charity.com:1883"); // 1883 - WebSocket Port
  }

  static contextType = ContextModule;

  async componentDidMount() {
    this.connect();
  }

  componentWillUnmount() {}

  connect() {
    this.socket = new WebSocket("wss://theta-charity.com:1883");
    this.socket.onopen = () => {
      console.log("WebSocket Connected");
      this.setState({
        ready: true,
      });
    };

    this.socket.onmessage = (message) => {
      if (!JSON.parse(message.data).dm) {
        let temp = this.state.history;
        // Filter Duplicates
        if (
          this.state.history[this.state.history.length - 1].address !==
            JSON.parse(message.data).address ||
          this.state.history[this.state.history.length - 1].message !==
            JSON.parse(message.data).message
        ) {
          temp.push(JSON.parse(message.data));
          this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        this.setState({
          history: temp,
        });
      }
      if (
        JSON.parse(message.data).dm &&
        this.context.value.address !== "" &&
        this.context.value.address === JSON.parse(message.data).to &&
        !this.state.dm
      ) {
        let temp = this.context.value.chatNotif;
        temp.push(JSON.parse(message.data));
        this.context.setValue({
          chatNotif: temp,
        });
        this.audio.play();
      }
    };

    this.socket.onclose = (event) => {
      this.setState(
        {
          ready: false,
        },
        () =>
          setTimeout(() => {
            this.connect();
          }, 5000)
      );
    };

    this.socket.onerror = function (error) {
      console.log(error);
    };
  }

  async sendMessage() {
    this.setState({
      loading: true,
    });
    let token = JSON.parse(this.state.token);
    if (this.state.amount !== "0") {
      if (token.name === "tFuel") {
        let contract = new this.web3.eth.Contract(
          abi(),
          this.state.streamer.publicKey,
          { from: this.context.value.address }
        );
        let transaction = {
          from: this.context.value.address,
          to: this.state.streamer.publicKey,
          data: contract.methods.addDonor().encodeABI(),
          value: this.web3.utils.toHex(
            this.web3.utils.toWei(this.state.amount, "ether")
          ),
        };
        const gas = await this.web3.eth.estimateGas(transaction);
        transaction = { ...transaction, gas };
        let hash = await new Promise((resolve, reject) => {
          this.web3.eth.sendTransaction(transaction, (err, hash) => {
            if (!err) {
              resolve(hash);
            } else {
              this.setState({
                loading: false,
              });
            }
          });
        });
        await new Promise((resolve, reject) => {
          this.web3.eth.getTransactionReceipt(hash, async (err, rec) =>
            resolve(rec)
          );
        });
        let tempMes = this.state.message;
        this.socket.send(
          JSON.stringify({
            address: this.context.value.address,
            message: tempMes,
            amount: this.state.amount,
            dm: false,
          })
        );
        this.setState({
          to: "",
          dm: false,
          message: "",
          amount: "0",
          loading: false,
        });
      } else {
        let contract = new this.web3.eth.Contract(abiERC20, token.contract, {
          from: this.context.value.address,
        });
        let decimals = await contract.methods.decimals().call();
        let transaction = {
          to: token.contract,
          from: this.context.value.address,
          data: contract.methods
            .approve(
              this.state.streamer.publicKey,
              this.web3.utils.toHex(this.state.amount * Math.pow(10, decimals))
            )
            .encodeABI(),
        };
        let gas = await this.web3.eth.estimateGas(transaction);
        transaction = { ...transaction, gas };
        let hash = await new Promise((resolve, reject) => {
          this.web3.eth.sendTransaction(transaction, (err, hash) => {
            if (!err) {
              resolve(hash);
            } else {
              this.setState({
                loading: false,
              });
            }
          });
        });
        await new Promise((resolve, reject) => {
          this.web3.eth.getTransactionReceipt(hash, async (err, rec) =>
            resolve(rec)
          );
        });
        contract = new this.web3.eth.Contract(
          abi(),
          this.state.streamer.publicKey,
          { from: this.context.value.address }
        );
        transaction = {
          from: this.context.value.address,
          to: this.state.streamer.publicKey,
          data: contract.methods
            .addDonorToken(
              this.web3.utils.toHex(
                this.web3.utils.toWei(this.state.amount, "ether")
              )
            )
            .encodeABI(),
        };
        gas = await this.web3.eth.estimateGas(transaction);
        transaction = { ...transaction, gas };
        hash = await new Promise((resolve, reject) => {
          this.web3.eth.sendTransaction(transaction, (err, hash) => {
            if (!err) {
              resolve(hash);
            } else {
              this.setState({
                loading: false,
              });
            }
          });
        });
        await new Promise((resolve, reject) => {
          this.web3.eth.getTransactionReceipt(hash, async (err, rec) =>
            resolve(rec)
          );
        });
        let tempMes = this.state.message;
        this.socket.send(
          JSON.stringify({
            address: this.context.value.address,
            message: tempMes,
            amount: this.state.amount,
            dm: false,
          })
        );
        this.setState({
          to: "",
          dm: false,
          message: "",
          amount: "0",
          loading: false,
        });
      }
    } else {
      let tempMes = this.state.message;
      this.socket.send(
        JSON.stringify({
          address: this.context.value.address,
          message: tempMes,
          amount: "0",
          dm: false,
        })
      );
      this.setState({
        to: "",
        dm: false,
        message: "",
        amount: "0",
        loading: false,
      });
    }
  }

  async sendMessageXMTP() {
    let tempMes = this.state.message;
    this.socket.send(
      JSON.stringify({
        address: this.context.value.address,
        to: this.state.to,
        message: tempMes,
        dm: true,
      })
    );
    this.conversation.send(
      JSON.stringify({
        address: this.context.value.address,
        message: tempMes,
      })
    );
    this.setState({
      message: "",
    });
  }

  async startDM(address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const xmtp = await Client.create(provider.getSigner());
    // It is very important that the Address is correctly written with ChecksumAddress, otherwise XMTP will not work.
    this.conversation = await xmtp.conversations.newConversation(
      this.web3.utils.toChecksumAddress(address)
    );
    const messages = await this.conversation.messages();
    let tempMessages = [];
    messages.forEach((item, index) => {
      try {
        tempMessages.push(JSON.parse(item.content));
      } catch {
        //
      }
    });
    this.setState({
      historyDM: tempMessages,
    });
    // Listen for new messages in the this.conversation
    const account = this.web3.utils.toChecksumAddress(address);
    for await (const message of await this.conversation.streamMessages()) {
      if (account !== this.web3.utils.toChecksumAddress(address)) {
        console.log("Break:" + account);
        break;
      }
      let historyDM = this.state.historyDM;
      if (
        historyDM[historyDM.length - 1].message !==
        JSON.parse(message.content).message
      ) {
        historyDM.push({
          address: message.senderAddress,
          message: JSON.parse(message.content).message,
        });
        this.setState({
          historyDM,
        });
      }
    }
  }

  render() {
    return (
      <div
        style={{
          position: "absolute",
          top: "6%",
          right: "0px",
          height: "94%",
          width: "20%",
          backgroundColor: "#18181b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          borderLeft: "1px solid",
          borderTop: "1px solid",
        }}
      >
        <div
          style={{
            color: "white",
            padding: "3% 0% 3% 0%",
            borderBottom: "1px solid #555",
            width: "100%",
            textAlign: "center",
          }}
        >
          {this.state.dm ? "DM Chat" : "Stream Chat"}
          &nbsp;&nbsp;&nbsp;
          <span
            style={{
              color: this.state.ready ? "green" : "red",
            }}
          >
            ⦿
          </span>
          &nbsp;&nbsp;&nbsp;
          <SwapHorizIcon
            onClick={() => {
              this.setState({
                dm: !this.state.dm,
                to: "",
                historyDM: [
                  {
                    // Seed Value to Filter
                    address: "",
                    message: "",
                  },
                ],
              });
            }}
          />
        </div>
        {this.state.dm ? (
          <>
            {this.context.value.address !== "" && this.state.to === "" && (
              <>
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    overflowY: "scroll",
                    borderBottom: "1px solid #555",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {getUniqueListBy(this.state.history, "address").map(
                      (item, index) => {
                        return (
                          <div
                            key={"Messages" + index}
                            style={{
                              margin: "10px",
                              width: "100%",
                              textAlign: "center",
                            }}
                          >
                            {item.address !== "" && (
                              <Button
                                color="warning"
                                onClick={() => {
                                  this.setState(
                                    {
                                      to: item.address,
                                    },
                                    () => this.startDM(item.address)
                                  );
                                }}
                              >
                                <span>
                                  DM to {item.address.substring(0, 10)}
                                  ...
                                  {item.address.substring(
                                    item.address.length - 8,
                                    item.address.length
                                  )}
                                </span>
                              </Button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </>
            )}
            {this.context.value.address !== "" && this.state.to !== "" && (
              <>
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    overflowY: "scroll",
                    borderBottom: "1px solid #555",
                  }}
                >
                  {this.state.historyDM.map((item, index) => {
                    return (
                      <div
                        key={"Message" + index}
                        style={{ margin: "0px 10px 0px" }}
                      >
                        {item.address !== "" && (
                          <>
                            <span
                              style={{
                                cursor: "pointer",
                                color: `#${item.address.substring(2, 8)}`,
                              }}
                              onClick={() =>
                                window.open(
                                  `https://explorer.thetatoken.org/address/${item.address}`,
                                  "_blank"
                                )
                              }
                            >
                              {item.address.substring(0, 4)}
                              ...
                              {item.address.substring(
                                item.address.length - 4,
                                item.address.length
                              )}
                            </span>
                            <span
                              style={{ color: "white", wordWrap: "break-word" }}
                            >
                              &nbsp;:&nbsp;{item.message}
                              {"\n"}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <div ref={this.messagesEndRef} />
                </div>
                <div
                  style={{
                    color: "white",
                    padding: "3% 0% 3% 0%",
                    borderBottom: "1px solid #555",
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Input
                    value={this.state.message}
                    placeholder={"Send Message"}
                    style={{
                      width: "80%",
                      marginLeft: "5%",
                      marginRight: "2%",
                    }}
                    onChange={(e) => this.setState({ message: e.target.value })}
                    onKeyDown={(e) => {
                      e.key === "Enter" && this.sendMessageXMTP();
                    }}
                  />
                  <Button
                    color="warning"
                    style={{ marginRight: "5%" }}
                    onClick={() => {
                      this.sendMessageXMTP();
                    }}
                  >
                    Send
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div
              style={{
                height: "100%",
                width: "100%",
                overflowY: "scroll",
                borderBottom: "1px solid #555",
              }}
            >
              {this.state.history.map((item, index) => (
                <div key={"Message" + index} style={{ margin: "0px 10px 0px" }}>
                  {item.address !== "" && (
                    <>
                      <span
                        style={{
                          cursor: "pointer",
                          color: `#${item.address.substring(2, 8)}`,
                        }}
                        onClick={() =>
                          window.open(
                            `https://explorer.thetatoken.org/address/${item.address}`,
                            "_blank"
                          )
                        }
                      >
                        {item.address.substring(0, 4)}
                        ...
                        {item.address.substring(
                          item.address.length - 4,
                          item.address.length
                        )}
                      </span>
                      <span style={{ color: "white", wordWrap: "break-word" }}>
                        &nbsp;:&nbsp;{item.message}
                        {"\n"}
                      </span>
                    </>
                  )}
                </div>
              ))}
              <div ref={this.messagesEndRef} />
            </div>
            {this.context.value.address !== "" && (
              <div
                style={{
                  color: "white",
                  padding: "3% 0% 3% 0%",
                  borderBottom: "1px solid #555",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <Input
                  value={this.state.message}
                  placeholder={"Send Message"}
                  style={{ width: "90%", marginLeft: "5%", marginBottom: "4%" }}
                  onChange={(e) => this.setState({ message: e.target.value })}
                  onKeyDown={(e) => {
                    e.key === "Enter" && this.sendMessage();
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Input
                    value={this.state.amount}
                    placeholder={"Donation"}
                    style={{ marginLeft: "5%" }}
                    onChange={(e) =>
                      this.setState({
                        amount: e.target.value,
                      })
                    }
                  />
                  <Input
                    value={this.state.token}
                    type="select"
                    style={{ marginLeft: "2.5%", marginRight: "2.5%" }}
                    onChange={(e) => {
                      this.setState({
                        token: e.target.value,
                      });
                    }}
                  >
                    <option
                      value={JSON.stringify({
                        name: "tFuel",
                        contract: "",
                      })}
                    >
                      tFuel
                    </option>
                    <option
                      value={JSON.stringify({
                        name: "wTheta",
                        contract: "0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0",
                      })}
                    >
                      wTheta
                    </option>
                  </Input>
                  <Button
                    color="warning"
                    style={{ marginRight: "5%" }}
                    disabled={!this.state.ready && !this.state.loading}
                    onClick={() => {
                      this.sendMessage();
                    }}
                  >
                    {this.state.loading ? <SyncIcon /> : <SendIcon />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default Chat;
