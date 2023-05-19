import React, { Component } from "react";
import usersData from "../constants/usersData";
import autoBind from "react-autobind";
import Web3 from "web3";
import ContextModule from "../utils/contextModule";
import VPhsl from "./videoplayerhslmain";
import { Link } from "react-router-dom";

class Streamers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamers: usersData,
    };
    autoBind(this);
    this.web3 = new Web3(`${process.env.REACT_APP_RPC}`);
    this.contract = null;
    this.counter = 0;
    this.interval = null;
  }

  static contextType = ContextModule;

  async componentDidMount() {
    let flag = false;
    var myHeaders = new Headers();
    myHeaders.append("x-tva-sa-id", process.env.REACT_APP_X_TVA_SA_ID);
    myHeaders.append("x-tva-sa-secret", process.env.REACT_APP_X_TVA_SA_SECRET);
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetch(
      "https://api.thetavideoapi.com/service_account/srvacc_ppjbd7h6tm0vx63arzysz2uqw/streams",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        let streamers = this.state.streamers;
        let temp = result.body.streams.map((item, index) => {
          return {
            isActive: item.status === "on" ? true : false,
            playback_url: item.playback_url,
            streamID: item.id,
          };
        });
        streamers = streamers.map((item) => {
          for (let i = 0; i < temp.length; i++) {
            if (item.streamID === temp[i].streamID) {
              return {
                ...item,
                ...temp[i],
              };
            }
          }
          return {
            ...item,
          };
        });
        this.setState(
          {
            streamers,
          },
          () => {
            flag = true;
          }
        );
      })
      .catch((error) => console.log("error", error));
    this.interval = setInterval(() => {
      if (flag) {
        flag = false;
        var myHeaders = new Headers();
        myHeaders.append("x-tva-sa-id", process.env.REACT_APP_X_TVA_SA_ID);
        myHeaders.append(
          "x-tva-sa-secret",
          process.env.REACT_APP_X_TVA_SA_SECRET
        );
        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        fetch(
          "https://api.thetavideoapi.com/service_account/srvacc_ppjbd7h6tm0vx63arzysz2uqw/streams",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            let streamers = this.state.streamers;
            let temp = result.body.streams.map((item, index) => {
              return {
                isActive: item.status === "on" ? true : false,
                playback_url: item.playback_url,
                streamID: item.id,
              };
            });
            streamers = streamers.map((item) => {
              for (let i = 0; i < temp.length; i++) {
                if (item.streamID === temp[i].streamID) {
                  return {
                    ...item,
                    ...temp[i],
                  };
                }
              }
              return {
                ...item,
              };
            });
            this.setState(
              {
                streamers,
              },
              () => {
                flag = true;
              }
            );
          })
          .catch((error) => console.log("error", error));
      }
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <>
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
            alignItems: "flex-start",
            borderRight: "1px solid",
            borderTop: "1px solid",
            overflow: "hidden",
          }}
        >
          {this.state.streamers.map((item, index) => (
            <div
              key={"Streamer:" + index}
              style={{ borderBottom: "1px solid", width: "100%" }}
            >
              <div
                onClick={() =>
                  window.open(`/streamer/${item.nameURL}`, "_blank")
                }
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: "10px",
                  marginBottom: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  alt="ig00dsa01"
                  src={item.logo}
                  width="50px"
                  height="50px"
                  style={{
                    borderRadius: "100px",
                    border: `6px ${item.isActive ? "red" : "black"} solid`,
                  }}
                />
                <span style={{ marginLeft: "10px", color: "white" }}>
                  {item.name}
                  <br />
                  {item.charity}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: "6%",
            right: "20%",
            left: "20%",
            width: "80%",
            height: "94%",
            backgroundColor: "#0E0E10",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
            padding: "10px",
            overflowY: "scroll",
          }}
        >
          Clips we think you’ll like
          <br />
          <br />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {this.state.streamers.map((item, index) => (
              <Link
                key={"StreamerVideo:" + index}
                to={`/streamer/${item.nameURL}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
              >
                <div style={{ margin: "0px 20px 0px" }}>
                  {item.isActive ? (
                    <VPhsl
                      src={item.playback_url}
                      width={window.innerWidth * 0.2}
                      height={window.innerHeight * 0.2}
                    />
                  ) : (
                    <VPhsl
                      src={`https://media.thetavideoapi.com/${item.clip}/master.m3u8`}
                      poster={item.thumbnail}
                      width={window.innerWidth * 0.2}
                      height={window.innerHeight * 0.2}
                    />
                  )}
                </div>
                <span style={{ color: "white", margin: "0px 20px 20px" }}>
                  {item.name + " "}
                  {item.isActive && <span style={{ color: "red" }}> LIVE</span>}
                  <br />
                  {item.charity}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Streamers;
