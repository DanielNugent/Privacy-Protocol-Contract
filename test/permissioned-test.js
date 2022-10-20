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
    let hashOfScan1_left = "0x1234";
    let hashOfScan1_right = "0x5678";
    let hashOfScan2_left = "0x2345";
    let hashOfScan2_right = "0x6789";

    it("Should add a hash of scan", async function () {
      await privacy.registerHashOfScan(hashOfScan1_left, hashOfScan1_right);
      expect(await privacy.getHashOfScans()).to.deep.equal([
        [
          ethers.BigNumber.from(hashOfScan1_left),
          ethers.BigNumber.from(hashOfScan1_right),
        ],
      ]);
    });

    it("Shouldn't add a hashes of scan (batch) if not the contract Owner", async function () {
      const [_, addr1] = await ethers.getSigners();
      await expect(
        privacy
          .connect(addr1)
          .batchRegisterHashOfScan([hashOfScan2_left, hashOfScan2_right])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should throw an error if trying to register an exists hash of scan", async function () {
      await expect(
        privacy.registerHashOfScan(hashOfScan1_left, hashOfScan1_right)
      ).to.be.revertedWith("That hash of scan is already registered.");
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
      expect(await privacy.getTransactions(transaction.publicID)).to.deep.equal(
        [ethers.BigNumber.from(transaction.hashOfRecord)]
      );
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
