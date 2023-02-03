const BridgeEth = artifacts.require("./BridgeEth.sol");

const privKey =
  "5cba9caf051ee2e460bb9ce372cdb51fc6b8782d88dad729cb7baf63d99d95b2";

module.exports = async (done) => {
  const accounts = await web3.eth.getAccounts();
  const bridgeEth = await BridgeEth.deployed();
  const amount = 1000;
  const message = web3.utils
    .soliditySha3(
      { t: "address", v: accounts[0] },
      { t: "address", v: accounts[1] },
      { t: "uint256", v: amount }
    )
    .toString("hex");
  const { signature } = web3.eth.accounts.sign(message, privKey);
  await bridgeEth.proposeTransaction(
    accounts[0], //sender
    accounts[1], // receiver
    amount, // amount to transfer
    [accounts[0], accounts[1], accounts[2]], // array of potential signers
    accounts[0], // proposer
    signature
  );

  done();
};
