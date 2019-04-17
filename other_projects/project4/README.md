# Private Blockchain Notary Service

Star Registry service that allows users to claim ownership of their favorite star in the night sky.

## Framework Used

Hapi.js

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the [Node.js web site](https://nodejs.org/en/).


### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install hapi.js with --save flag
```
npm install hapi --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```

## Testing

To test code:

1: Open a command prompt or shell terminal after install node.js and other js libraries.

2: Enter a node session by  

```
npm start
```

or with server.js

```
node server.js
```

## Endpoint Documentation

### Validate User Request

**Method**

```
POST
```

**Endpoint**

```
http://localhost:8000/requestValidation
```

**Parameters**

```
address
```

**Example with Curl**

```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'
```

### Allow User Message Signature

**Method**

```
POST
```

**Endpoint**

```
http://localhost:8000/message-signature/validate
```

**Parameters**

```
address, signature
```

**Example with Curl**
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```

### Star registration

**Method**

```
POST
```

**Endpoint**

```
http://localhost:8000/block
```

**Parameters**

```
address, star
```

**Example with Curl**

```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```

### Star Lookup

#### Get block by address

**Method**

```
GET
```

**Endpoint**

```
http://localhost:8000/stars/address:{address}
```

**Parameter**

```
address
```

**Example with Curl**

```
curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
```

#### Get block by hash

**Method**

```
GET
```

**Endpoint**

```
http://localhost:8000/stars/hash:{hash}
```

**Parameter**

```
hash
```

**Example with Curl**
```
curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
```

#### Get block by height

**Method**

```
GET
```

**Endpoint**

```
http://localhost:8000/block/:height
```

**Parameter**

```
height
```

**Example with Curl**
```
curl "http://localhost:8000/block/1"
```


