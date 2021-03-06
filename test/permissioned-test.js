const { expect } = require("chai");
const { ethers } = require("hardhat");

let Permissioned;
let privacy;

describe("PermissionedPrivacy contract", function () {
  before(async function () {
    Permissioned = await ethers.getContractFactory("PermissionedPrivacy");
    privacy = await Permissioned.deploy();
    await privacy.deployed();
  });

  describe("Hash of Scan", function () {
    let hashOfScan = "0x1234";
    let hashOfScan2 = "0x12345";

    it("Should add a hash of scan if Owner", async function () {
      await privacy.registerHashOfScan(hashOfScan);
      expect(await privacy.getHashOfScans()).to.deep.equal([
        ethers.BigNumber.from(hashOfScan),
      ]);
    });

    it("Shouldn't add a hash of scan if not the contract Owner", async function () {
        const [_, addr1] = await ethers.getSigners();
      await expect(privacy.connect(addr1).registerHashOfScan(hashOfScan2)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should throw an error if trying to register an exists hash of scan", async function () {
      await expect(privacy.registerHashOfScan(hashOfScan)).to.be.revertedWith(
        "That hash of scan is already registered."
      );
    });
  });
  describe("Transactions", function () {
    let transaction = {
      publicID: "0x3456",
      hashOfRecord: "0x4567",
    };
    it("Should add a transaction", async function () {
      await privacy.addTransaction(
        transaction.publicID,
        transaction.hashOfRecord
      );
      expect(await privacy.getTransactions()).to.deep.equal([
        [
          ethers.BigNumber.from(transaction.publicID),
          ethers.BigNumber.from(transaction.hashOfRecord),
        ],
      ]);
    });
  });
  describe("Storing records", function () {
    let txIDToRecord = {
      transactionID: "0x7890",
      record: "0x5678",
    };
    let dummyTxID = "0x0009";
    it("Should store the encrypted record location mapped from a transactionID", async function () {
      await privacy.storeRecordLocation(
        txIDToRecord.transactionID,
        txIDToRecord.record
      );
      expect(
        await privacy.retrieveRecordLocation(txIDToRecord.transactionID)
      ).to.equal(txIDToRecord.record);
    });
    it("Should revert the transaction if the transactionID is duplicated", async function () {
      await expect(
        privacy.storeRecordLocation(
          txIDToRecord.transactionID,
          txIDToRecord.record
        )
      ).to.be.revertedWith("That transactionID already exists.");
    });
    it("Should revert the transaction if the transactionID doesn't map to anything", async function () {
      await expect(
        privacy.retrieveRecordLocation(dummyTxID)
      ).to.be.revertedWith("The location of the record is empty.");
    });
  });
});
