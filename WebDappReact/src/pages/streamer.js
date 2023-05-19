import React, { Component } from "react";
import autoBind from "react-autobind";
import Chat from "../components/chat";
import Header from "../components/headerChat";
import { withHooksHOC } from "../utils/params";
import Summary from "../components/summary";
import VPhsl from "../components/videoplayerhsl";
import usersData from "../constants/usersData";

function getUserData(usersData, nameURL) {
  let temp = {};
  for (let i = 0; i < usersData.length; i++) {
    if (nameURL === usersData[i].nameURL) {
      temp = usersData[i];
    }
  }
  return temp;
}

class Streamer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordId: "",
      live: "",
      amount: "",
      donors: [],
      streamer: getUserData(usersData, this.props.params.nameurl),
    };
    autoBind(this);
    this.balanceCheck = null;
  }

  componentDidMount() {
    var myHeaders = new Headers();
    myHeaders.append("x-tva-sa-id", process.env.REACT_APP_X_TVA_SA_ID);
    myHeaders.append("x-tva-sa-secret", process.env.REACT_APP_X_TVA_SA_SECRET);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.thetavideoapi.com/stream/${this.state.streamer.streamID}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        let streamer = {
          ...this.state.streamer,
          isActive: result.body.status === "on" ? true : false,
          playback_url: result.body.playback_url,
        };
        this.setState({
          streamer,
        });
      })
      .catch((error) => console.log("error", error));
  }

  componentWillUnmount() {
    clearInterval(this.balanceCheck);
  }

  render() {
    return (
      <>
        <Header />
        <Chat params={this.props.params} />
        <Summary params={this.props.params} />
        <div
          style={{
            position: "absolute",
            top: "6%",
            right: "20%",
            left: "20%",
            width: "60vw",
            height: "94vh",
            backgroundColor: "#18181b",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            overflowY: "scroll",
            overflowX: "hidden",
          }}
        >
          {this.state.streamer.isActive === true ? (
            <>
              <VPhsl
                src={this.state.streamer.playback_url}
                width={"100%"}
                height={"auto"}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    color: "white",
                    fontSize: "20px",
                  }}
                >
                  <img
                    alt="isdasg0001"
                    src={this.state.streamer.logo}
                    width="48px"
                    height="48px"
                    style={{
                      borderRadius: "100px",
                      border: "6px red solid",
                    }}
                  />
                  Live
                </div>
                <span
                  style={{
                    marginLeft: "10px",
                    color: "white",
                    paddingRight: window.innerWidth * 0.3,
                  }}
                >
                  {"3 watching now"}
                  <br />
                  {this.state.streamer.name + " " + this.state.streamer.title}
                  <br />
                  {this.state.streamer.charity}
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{width:"100%", height: "100%" }}>
                <iframe
                  src={`https://player.thetavideoapi.com/video/${this.state.streamer.clip}`}
                  border="0"
                  width={"100%"}
                  height={window.innerHeight*0.7}
                  allowFullScreen
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                <img
                  alt="ig00sadc01"
                  src={this.state.streamer.logo}
                  width="64px"
                  height="64px"
                  style={{
                    borderRadius: "100px",
                    border: "6px black solid",
                  }}
                />
                <span
                  style={{
                    marginLeft: "10px",
                    color: "white",
                    paddingRight: window.innerWidth * 0.3,
                  }}
                >
                  {this.state.streamer.name + " - " + this.state.streamer.title}
                  <br />
                  {this.state.streamer.charity}
                </span>
              </div>
            </>
          )}
          <div
            style={{
              width: "100%",
              backgroundColor: "#0E0E10",
              display: "flex",
              flexDirection: "row",
              paddingTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "100px",
                color: "white",
              }}
            >
              <img
                alt="footer"
                src={this.state.streamer.footer}
                width="100%"
                height="auto"
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withHooksHOC(Streamer);
