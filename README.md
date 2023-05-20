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
  - Todos los contratos en el proyecto se utilizan activamente en la red de Theta Mainnet.
    - Pre-deploy wTheta Token Contract: [0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0](https://explorer.thetatoken.org/account/0xAf537FB7E4c77C97403De94Ce141b7EdB9F7fCf0)
    - Charity Contract:  [0xF120b928Af227ce3941333c7D0945731958257A6](https://explorer.thetatoken.org/account/0xF120b928Af227ce3941333c7D0945731958257A6)
    - NFT Contract: [0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B](https://explorer.thetatoken.org/account/0x1c212b56BE6a9C96F1744d9f3CdD44De588de16B)
- Theta Video: 
  - Utilizamos las APIs del dashboard para relizar las peticiones de los livestreams y los videos on demand ya en la plataforma de theta video.
    - https://docs.thetatoken.org/docs/theta-video-api-overview
- Theta Scan: 
  - Utilizamos estas APIs para acceder a los balances de NFTs de cada cuenta facilmente, ya que los RPC calls no proveen una funcion para obtener los balances facilmente.
    - https://www.thetascan.io/document/
- XMTP:
  - Sign in for authentication to the private conversation.
  - Send direct messages through a private chat.
  - Get message history with the same account.
- AWS:
  - EC2: Maquina virtual de EC2 que corre todos los microsevicios mediante contenedores de Docker.
  - ELB: Load balancer que provee escalabilidad del sistema y a su vez nos permite usar nuestro dominio y el certificado ssl en la pagina web.
  - Route53: Hosting service que nos permite utilizar nuestro dominio con los servicios de AWS.

# How it's built:

## Theta Network:

Todas las transacciones que realizan en Theta Network Mainnet. En total la plataforma tiene 2 interacciones principales con la Theta Network.

- Donaciones de la native token al contrato principal de la caridad.

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

Las APIs de Theta Scan fueron utilizadas para obtener de forma sencilla los balances de NFTs de la cuenta que conectes desde Metamask a la plataforma.

<img src="https://i.ibb.co/NrNhjLg/image.png">

El codigo que utilizamos para realizar las API calls de esta API fue el sifguiente.

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

Todos los microsevicios que usamos en la nube son desplegados mediante docker, en contenedores, para poder desplegar la plataforma de forma sencilla en una maquina virtual, en el caso e AWS una maquina EC2, sin embargo los contenedores son agnosticos a la plataforma, entonces puedes correr el proyecto en cualquier maquina virtual de cualquier cloud.

<img src="https://i.ibb.co/9yBRYZj/New-Project.png">

### Static Website Web and Chat WebSocket Server.

Para el despliegue de la aplicacion se utilizo el orquestador de contenedores Docker Compose ya que debiamos correr en simultaneo de manera fiable el contenedor de la pagina web estatica y el websocket para el chat de la aplicacion.

<img src="https://i.ibb.co/4ZY0ZXp/docker-drawio-2-1.png">

La configuracion para correr los contenedores correctamente esta en el siguiente archivo.

- [compose.yaml](./WebDappContainers/compose.yml)

### Route 53:

Este servicio nos provee del hosting de la pagina web, con el fin de poderla utilizar para que el dominio https://theta-charity.com/ se conecte directamente a nuestros servicios desplegados en EC2.

<img src="https://i.ibb.co/G05xwCm/docker-drawio-3.png">

### Elastic Load Balancer:

Por ultimo ya con todos estos servicios creados, utilizamos un Load Balancer para poder usar nuestra pagina web desde Route53 junto con su certificado SSL.

<img src="https://i.ibb.co/RzDb3GY/docker-drawio-5.png">

- [Complete Server Code](./WebDappContainers)

# References

https://www.twitch.tv/creatorcamp/en/connect-and-engage/charity-streaming/

https://www.donordrive.com/charity-streaming/

https://www.youtube.com/watch?v=Hh4T4RuK1H8
