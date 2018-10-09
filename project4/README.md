# Blockchain Web Service

Blockchain has the potential to change the way that the world approaches data. 
Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Framework Used

Hapi.js

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].


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

3: Use Postman software (https://www.getpostman.com/) to send the HTTP requests.
  - To send GET message, specify the url as http://localhost:8000/block/{height} and click send.
  - To send POST message, specify the url as http://localhost:8000/block/, go to body section to write the form data with the key "body" and value "Testing block with test string data", and click send.



