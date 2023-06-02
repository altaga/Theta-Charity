# ThetaCharity
 
 <img src="https://i.ibb.co/Hh3SfjZ/logo-84b6afc1aa45b23a6d63.png" >

<p>

Theta-Charity is a Theta Network based decentralized streaming platform where creators can create charity-based streams for social, environmental and economic causes.

# Watch our demo video:

[![Demo](https://i.ibb.co/j3DCtPZ/image.png)](pending)

# Test the product:

## URL: https://theta-charity.com/

## Requirements

- Use Theta Network Mainnet on Metamask Wallet!
  - Get it on Metamask: https://metamask.io/
  - Setup Theta Network Mainnet on Metamask: https://docs.thetatoken.org/docs/web3-stack-metamask

# Diagram:

<img src="https://i.ibb.co/ZXbk4Rp/scheme-drawio.png">

## Tech we Use:

- Theta Network: 
  - All contracts in the project are actively used in the Theta Mainnet network.
    - Pre-deploy wTheta Token Contract: [0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0](https://explorer.thetatoken.org/account/0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0)
    - Charity Contract:  [0xF120b928Af227ce3941333c7D0945731958257A6](https://explorer.thetatoken.org/account/0xF120b928Af227ce3941333c7D0945731958257A6)
    - NFT Contract: [0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B](https://explorer.thetatoken.org/account/0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B)
- Theta Video: 
  - We use the dashboard APIs to make requests for livestreams and videos on demand already on the theta video platform.
    - https://docs.thetatoken.org/docs/theta-video-api-overview
- Theta Scan: 
  - We use these APIs to access the NFT balances of each account easily, since the RPC calls do not provide a function to obtain the balances.
    - https://www.thetascan.io/document/
- XMTP:
  - Sign in for authentication to the private conversation.
  - Send direct messages through a private chat.
  - Get message history with the same account.
- AWS:
 - EC2: EC2 virtual machine that runs all the microservices through Docker containers.
 - ELB: Load balancer that provides system scalability and in turn allows us to use our domain and the ssl certificate on the web page.
 - Route53: Hosting service that allows us to use our domain with AWS services.

# How it's built:

## Theta Network:

All transactions they make on Theta Network Mainnet. In total the platform has 2 main interactions with the Theta Network.
 
- Donations from the native token to the main contract of the charity.

<img src="https://i.ibb.co/wC58H18/image.png">

- NFT-based DRM content and NFT mint.

NFT from collection: [0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B](https://explorer.thetatoken.org/account/0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B)
<img src="https://i.ibb.co/Bsq2qzP/image.png">

NFT-based DRM content:
<img src="https://i.ibb.co/S7cH4nX/image.png">

## Theta Video:

All the streaming services and NFT-based DRM content were done through Theta Video.

<img src="https://i.ibb.co/BqhgDVM/image.png">

To manage Streamers, the profiles of each of the Streamers were created within the Theta Video dashboard, with which we were able to provide each Streamer with their keys to perform their Streams.

<img src="https://i.ibb.co/r0MQS5g/image.png">

Thanks to the Theta Video APIs it was possible for us to obtain if the Streamers were doing a Live, thanks to this the viewers could always be aware when a live stream is made.

<img src="https://i.ibb.co/5ndm1gG/image.png">

The section of code that allows us to obtain the livestreams, video on demand and states (live or offline) is the following.

    var myHeaders = new Headers();
        myHeaders.append("x-tva-sa-id", process.env.REACT_APP_X_TVA_SA_ID);
        myHeaders.append("x-tva-sa-secret", process.env.REACT_APP_X_TVA_SA_SECRET);
        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        fetch("https://api.thetavideoapi.com/service_account/srvacc_ppjbd7h6tm0vx63arzysz2uqw/streams", requestOptions)
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

## Theta Scan:

Theta Scan APIs were used to easily obtain the NFT balances of the account that you connect from Metamask to the platform.

<img src="https://i.ibb.co/NrNhjLg/image.png">

The code we used to make the API calls of this API was the following:

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

## XMTP:

Because our app requires a reliable service to carry out a private chat, it was decided to include the XMTP Client to carry out private messages between donors.

- [SOURCE CODE](./WebDappReact/src/components/chat.js)

This service has 3 fundamental parts, sign in, get the conversation history and new incoming messages.

    async startDM(address) {
        // Setup Metamask as provider
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        // Create new Client
        const xmtp = await Client.create(provider.getSigner())
        // It is very important that the Address is correctly written with ChecksumAddress, otherwise XMTP will not work.
        this.conversation = await xmtp.conversations.newConversation(this.web3.utils.toChecksumAddress(address))
        // Get all history
        const messages = await this.conversation.messages()
        let tempMessages = []
        messages.forEach((item, index) => {
            try {

                tempMessages.push(JSON.parse(item.content))
            }
            catch {
                //
            }
        })
        this.setState({
            historyDM: tempMessages
        })
        // Listen for new messages in the this.conversation
        const account = this.web3.utils.toChecksumAddress(address)
        for await (const message of await this.conversation.streamMessages()) {
            // Break if dm account change
            if (account !== this.web3.utils.toChecksumAddress(address)) {
                console.log("Break:" + account)
                break
            }
            let historyDM = this.state.historyDM
            if (historyDM[historyDM.length - 1].message !== JSON.parse(message.content).message) {
                historyDM.push({
                    address: message.senderAddress,
                    message: JSON.parse(message.content).message
                })
                this.setState({
                    historyDM
                })
            }
        }
    }

Finally, to send new messages to the other address, we will use the following line of code.

    // Send New message
    async sendMessageXMTP() {
        let tempMes = this.state.message
        this.socketPub.send(JSON.stringify({
            address: this.context.value.address,
            to: this.state.to,
            message: tempMes,
            dm: true
        }))
        this.conversation.send(JSON.stringify({
            address: this.context.value.address,
            message: tempMes
        }))
        this.setState({
            message: "",
        })
    }

## Cloud Micro Services:

All the microservices that we use in the cloud are deployed through docker, in containers, to be able to easily deploy the platform in a virtual machine, in the case of AWS an EC2 machine, however the containers are agnostic to the platform, so you can run the project on any virtual machine in any cloud.

<img src="https://i.ibb.co/9yBRYZj/New-Project.png">

### Static Website Web and Chat WebSocket Server.

For the deployment of the application, the Docker Compose container orchestrator was used since we had to reliably run the static web page container and the websocket for the application chat simultaneously.

<img src="https://i.ibb.co/4ZY0ZXp/docker-drawio-2-1.png">

The configuration to run the containers correctly is in the following file.

- [compose.yaml](./WebDappContainers/compose.yml)

### Route 53:

This service provides us with the hosting of the web page, in order to be able to use it so that the domain https://theta-charity.com/ connects directly to our services deployed in EC2.

<img src="https://i.ibb.co/G05xwCm/docker-drawio-3.png">

### Elastic Load Balancer:

Finally, with all these services created, we use a Load Balancer to be able to use our website from Route53 together with its SSL certificate.

<img src="https://i.ibb.co/RzDb3GY/docker-drawio-5.png">

- [Complete Server Code](./WebDappContainers)

# References

https://www.twitch.tv/creatorcamp/en/connect-and-engage/charity-streaming/

https://www.donordrive.com/charity-streaming/

https://www.youtube.com/watch?v=Hh4T4RuK1H8
