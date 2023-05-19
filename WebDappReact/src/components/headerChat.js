import React, { Component } from "react";
import { Button, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import { withCookies } from "react-cookie";
import logo from "../assets/logo.png";
import ContextModule from "../utils/contextModule";
import reactAutobind from "react-autobind";
import axios from "axios";
import MessageIcon from "@mui/icons-material/Message";
import NFT from "../assets/nft-bn.png";
import { ethers } from "ethers";
import { abiNFT } from "../contracts/nftContract";
import { Link } from "react-router-dom";

function ipfs2html(ipfslink) {
  let temp = ipfslink.substring(7).split("/");
  temp = "https://" + temp[0] + ".ipfs.w3s.link/" + temp[1];
  return temp;
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nfts: [],
      modal: false,
      modal2: false,
    };
    reactAutobind(this);
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RPC
    );
  }

  static contextType = ContextModule;

  componentDidMount() {
    if (window.ethereum) {
      const { cookies } = this.props;
      const flag = cookies.get("flag") || false;
      if (flag) {
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((res) => {
            console.log("start")
            this.syncNFTaxios(res[0]);
            this.context.setValue({
              address: res[0],
            });
          });
      }
    }
  }

  async syncNFTaxios(address) {
    let temp = await axios({
      method: "get",
      url: `https://www.thetascan.io/api/721/?address=${address}&type=transactions`,
      headers: {
        Accept: "application/json",
      },
    });
    let data = temp.data;
    let contracts = data.map(
      (item) => new ethers.Contract(item.contract, abiNFT(), this.provider)
    );
    let nftURI = await Promise.all(
      contracts.map((item, index) => item.tokenURI(data[index].token))
    );
    let nftMetadataURL = nftURI.map((item) => ipfs2html(item));
    let nftMetadata = await Promise.all(
      nftMetadataURL.map((item) =>
        axios({
          method: "get",
          url: item,
          headers: {
            Accept: "application/json",
          },
        })
      )
    );
    let nfts = nftMetadata.map((item, index) => {
      return {
        ...item.data,
        image: ipfs2html(item.data.image),
      };
    });
    this.context.setValue({
      nfts,
    });
  }

  connectMetamask() {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_requestAccounts" }).then((res) => {
        const { cookies } = this.props;
        cookies.set("flag", true, { path: "/" });
        this.syncNFTaxios(res[0]);
        this.context.setValue({
          address: res[0],
        });
      });
    }
  }

  render() {
    return (
      <>
        <Modal backdrop isOpen={this.state.modal} size={"lg"}>
          <ModalHeader
            onClick={() => this.setState({ modal: !this.state.modal })}
            style={{ backgroundColor: "#18181b", color: "white" }}
          >
            Awards
          </ModalHeader>
          <ModalBody
            style={{
              backgroundColor: "#0E0E10",
              color: "white",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {this.context.value.nfts.map((item, index) => (
              <div
                key={"NFT-images-" + index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "30%",
                  textAlign: "center",
                }}
              >
                <img alt={"NFT-images-" + index} src={item.image} />
                <span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                  {item.name}
                </span>
                <span>{item.description}</span>
              </div>
            ))}
          </ModalBody>
        </Modal>
        <Modal backdrop isOpen={this.state.modal2}>
          <ModalHeader
            onClick={() =>
              this.setState(
                {
                  modal2: !this.state.modal2,
                },
                () =>
                  this.context.setValue({
                    chatNotif: [],
                  })
              )
            }
            style={{ backgroundColor: "#18181b", color: "white" }}
          >
            Chat Notifications
          </ModalHeader>
          <ModalBody
            style={{
              backgroundColor: "#0E0E10",
              color: "white",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {this.context.value.chatNotif.map((item, index) => (
              <div
                key={"chat:" + index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  borderBottom: "1px solid",
                }}
              >
                <br />
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  DM From: {item.address}
                </span>
                <span>Message: {item.message}</span>
                <br />
              </div>
            ))}
          </ModalBody>
        </Modal>
        <div
          style={{
            position: "absolute",
            top: "0px",
            height: "6%",
            width: "100%",
            backgroundColor: "#18181b",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link to={"/"} style={{paddingLeft:"20px"}}>
            <img
              alt="igd0001"
              src={logo}
              style={{ height: window.innerHeight * 0.05 }}
            />
          </Link>
          <div style={{ width: "25%" }}>
            <Input placeholder="Search"></Input>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div style={{ paddingTop: "5%", marginRight: "20px" }}>
              <div
                onClick={() => this.setState({ modal2: !this.state.modal2 })}
                style={{ cursor: "pointer", color: "white" }}
              >
                <div className="boxChat">
                  {this.context.value.chatNotif.length > 0 && (
                    <div id="noti-count">
                      <div>{this.context.value.chatNotif.length}</div>
                    </div>
                  )}
                  <MessageIcon style={{ zIndex: 1, position: "relative" }} />
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
            <div
              onClick={() => this.setState({ modal: !this.state.modal })}
              style={{ cursor: "pointer" }}
            >
              <img alt="is0001" src={NFT} width="32px"></img>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <Button
              color="warning"
              disabled={this.context.value.address !== ""}
              onClick={() => this.connectMetamask()}
            >
              {this.context.value.address !== ""
                ? "Metamask Connected"
                : "Connect Metamask"}
            </Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </>
    );
  }
}

export default withCookies(Header);
