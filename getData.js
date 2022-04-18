const Web3 = require("web3");

let web3;
const masterAbi = require("./masterAbi.json");
const tokenAbi = require("./erc20.json");
const LendingAbi = require("./LendingContractAbi");
const poolAbi = require("./poolAbi.json");
const crvpoolAbi = require("./crvPoolAbi.json");

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/401becb77e3b4ad596ae0ab402a631b6"
);
web3 = new Web3(provider);

async function getLendingData(userAddress, contractAddress) {
  const LendingInstance = new web3.eth.Contract(LendingAbi, contractAddress);

  let LendedAmount = await LendingInstance.methods
    .getCdpTotalDeposited(userAddress)
    .call();
  let borrowedAmount = await LendingInstance.methods
    .getCdpTotalDebt(userAddress)
    .call();

  let lendedToken = await LendingInstance.methods.token().call();
  let borrowedToken = await LendingInstance.methods.friesToken().call();
  const LendedInstance = new web3.eth.Contract(tokenAbi, lendedToken);
  const borrowedInstance = new web3.eth.Contract(tokenAbi, borrowedToken);

  let lendedSymbol = await LendedInstance.methods.symbol().call();
  let borrowedSymbol = await borrowedInstance.methods.symbol().call();
  let lendedDecimals = await LendedInstance.methods.decimals().call();
  let borrowedDecimals = await borrowedInstance.methods.decimals().call();

  if (LendedAmount != 0 || borrowedAmount != 0) {
    console.log(
      "Lended amount:",
      (LendedAmount / 10 ** lendedDecimals).toFixed(2),
      lendedSymbol
    );
    console.log(
      "Borrowed Amount:",
      (borrowedAmount / 10 ** lendedDecimals).toFixed(2),
      borrowedSymbol
    );
  }
}

async function getLPdata(userAddress) {
  const contract = "0xC9E86C84c343E2aA0EB8259152F87291dbf8186f";
  const LPinstance = new web3.eth.Contract(masterAbi, contract);

  let poolInfo = await LPinstance.methods.poolInfos(0).call();
  let poolAddress = poolInfo.token;
  let totalSupplyLP = poolInfo.totalAmount;

  let userInfo = await LPinstance.methods.userInfos(0, userAddress).call();
  let LPtokensReceived = userInfo.amount;

  let rewards = await LPinstance.methods.calculateIncome(0, userAddress).call();

  const poolInstance = new web3.eth.Contract(poolAbi, poolAddress);
  let reserves = await poolInstance.methods.getReserves().call();
  let token0reserve = reserves[0];
  let token1reserve = reserves[1];

  let token0 = await poolInstance.methods.token0().call();
  let token1 = await poolInstance.methods.token1().call();
  const token0instance = new web3.eth.Contract(tokenAbi, token0);
  const token1instance = new web3.eth.Contract(tokenAbi, token1);

  let symbol0 = await token0instance.methods.symbol().call();
  let symbol1 = await token1instance.methods.symbol().call();
  let decimals0 = await token0instance.methods.decimals().call();
  let decimals1 = await token1instance.methods.decimals().call();
  token0reserve = token0reserve / 10 ** decimals0;
  token1reserve = token1reserve / 10 ** decimals1;

  let token0amount = (LPtokensReceived / totalSupplyLP) * token0reserve;
  let token1amount = (LPtokensReceived / totalSupplyLP) * token1reserve;

  if (token0amount != 0 && token1amount != 0) {
    console.log(
      symbol0,
      "+",
      symbol1,
      token0amount.toFixed(2),
      "+",
      token1amount.toFixed(2)
    );
    console.log("Rewards:", (rewards / 10 ** decimals0).toFixed(2), symbol0);
  }
}
async function getCRVpoolData(userAddress) {
  const address = "0xC9E86C84c343E2aA0EB8259152F87291dbf8186f";
  const masterInstance = new web3.eth.Contract(masterAbi, address);
  let rewards = await masterInstance.methods
    .calculateIncome(1, userAddress)
    .call();

  let poolInfo = await masterInstance.methods.poolInfos(1).call();
  let tokenContract = poolInfo.token;

  let userInfo = await masterInstance.methods.userInfos(1, userAddress).call();
  let balance = userInfo.amount;

  let tokenInstance = new web3.eth.Contract(crvpoolAbi, tokenContract);
  let token0amount = await tokenInstance.methods.balances(0).call();
  let token1amount = await tokenInstance.methods.balances(1).call();

  let token0 = await tokenInstance.methods.coins(0).call();
  let token1 = await tokenInstance.methods.coins(1).call();
  let token0instance = new web3.eth.Contract(tokenAbi, token0);
  let token1instance = new web3.eth.Contract(tokenAbi, token1);

  let symbol0 = await token0instance.methods.symbol().call();
  let symbol1 = await token1instance.methods.symbol().call();
  let decimals0 = await token0instance.methods.decimals().call();
  let decimals1 = await token1instance.methods.decimals().call();

  if (token0amount != 0 && token1amount != 0 && balance != 0) {
    console.log(
      symbol0,
      "+",
      symbol1,
      (token0amount / 10 ** decimals0).toFixed(2),
      "+",
      (token1amount / 10 ** decimals1).toFixed(2)
    );
    console.log("rewards:", (rewards / 10 ** decimals0).toFixed(2));
  }
}

async function getdStakeData(userAddress, index) {
  const address = "0xC9E86C84c343E2aA0EB8259152F87291dbf8186f";
  const masterInstance = new web3.eth.Contract(masterAbi, address);

  const poolInfo = await masterInstance.methods.poolInfos(index).call();
  let token = poolInfo.token;

  let rewards = await masterInstance.methods
    .calculateIncome(index, userAddress)
    .call();
  let userInfo = await masterInstance.methods
    .userInfos(index, userAddress)
    .call();

  let stakedAmount = userInfo.amount;

  const tokenInstance = new web3.eth.Contract(tokenAbi, token);
  let symbol = await tokenInstance.methods.symbol().call();
  let decimals0 = await tokenInstance.methods.decimals().call();

  if (stakedAmount != 0) {
    console.log((stakedAmount / 10 ** decimals0).toFixed(2), symbol);
    console.log("rewards", (rewards / 10 ** decimals0).toFixed(2));
  }
}

const userAddress = "0x7b933624adb126ce3b0526f29b7d64f1e872d6a1";
const Lendingaddresses = [
  "0xd1ffa2cbAE34FF85CeFecdAb0b33E7B1DC19024b",
  "0x87F6fAA87358B628498E8DCD4E30b0378fEaFD07",
  "0x7E271Eb034dFc47B041ADf74b24Fb88E687abA9C",
];

for (let i = 0; i < Lendingaddresses.length; i++) {
  getLendingData(userAddress, Lendingaddresses[i]);
}
getLPdata(userAddress);
getCRVpoolData(userAddress);
getdStakeData(userAddress, 2);
getdStakeData(userAddress, 3);
getdStakeData(userAddress, 4);
