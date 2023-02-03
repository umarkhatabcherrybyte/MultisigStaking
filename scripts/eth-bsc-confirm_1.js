const BridgeEth = artifacts.require("./BridgeEth.sol");

const privKey =
  "297b88a79adffda6a5e37e1cc34da8a29cd60d14f66c15f21006f39e0d69540a"; // private key of account 1

module.exports = async (done) => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts[1]);
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
  /**
 * bytes32 txHash,
        address signer,
        bytes memory signature
 */

  await bridgeEth.confirmTransaction(
    accounts[0],
    accounts[1],
    amount,
    accounts[1],
    signature
  );
  done();
};
