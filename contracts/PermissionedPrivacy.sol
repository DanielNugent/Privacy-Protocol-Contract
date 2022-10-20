//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title PrivacyPreserving
 * @dev A privacy preserving smart contract
 */
contract PermissionedPrivacy is Ownable {

    struct hashOfScan {
        uint256 left; //MS 256 bits
        uint256 right; //LS 256 bits
    }

    event RegisteredHashOfScan(uint256 _left, uint256 _right);
    event StoredRecordLocation(uint256 indexed _transactionID, string _record);
    event CreatedTransaction(uint256 indexed _publicID, uint256 _hashOfRecord);

    hashOfScan[] internal hashOfScans;
    //map the MS 256 bits of the Hash of scan to the least significant ones
    mapping(uint256 => uint256) internal isRegistered;
    //map publicID -> list of hashes of records
    mapping(uint256 => uint256[]) internal transactions;
    mapping(uint256 => string) internal transactionIDToRecord;

    /**
     * @dev Register the hash of a user's iris scan
     * @param _left MS 256 bits of LSH of the scan
     * @param _right LS 256 bits of LSH of the scan
     */
    function registerHashOfScan(uint256 _left, uint256 _right) external {
        require(isRegistered[_left] != _right, "That hash of scan is already registered.");
        hashOfScans.push(hashOfScan(_left, _right));
        isRegistered[_left] = _right;
        emit RegisteredHashOfScan(_left, _right);
    }
    /**
     * @dev Register multiples hashes of a users iris scan - permissioned for the contract owner
     * @param _hashOfScans LSH of the scan, in 2 index step, each even index marks the MS 256 bits of a new scan and even+1 marks LS 256 bits
     */
    function batchRegisterHashOfScan(uint256[] calldata _hashOfScans) external onlyOwner {
        //require(isRegistered[_hashOfScan] == false, "That hash of scan is already registered.");
        uint256 hashOfScansLength = _hashOfScans.length;
        require(hashOfScansLength % 2 == 0, "Each Hash Of Scan must contain the MS 256 and LS 256 bits.");
        for(uint i = 0; i < hashOfScansLength; i+=2){
            hashOfScans.push(hashOfScan(_hashOfScans[i], _hashOfScans[i+1]));
            isRegistered[_hashOfScans[i]] = _hashOfScans[i+1];
        }
    }

    /**
     * @dev Return hashOfScans 
     * @return value of 'hashOfScans'
     */
    function getHashOfScans() external view returns (hashOfScan[] memory){
        return hashOfScans;
    }
    /**
     * @dev Store a transaction to record the details of a record to store
     * @param _transactionID The transactionID to map the location of the record
     * @param _record The storage location of the encrypted record
     */
    function storeRecordLocation(uint256 _transactionID, string memory _record) external {
        require(keccak256(bytes(transactionIDToRecord[_transactionID])) == keccak256(bytes("")), "That transactionID already exists.");
        transactionIDToRecord[_transactionID] = _record;
        emit StoredRecordLocation(_transactionID, _record);
    }
    /**
     * @dev Store a hash of a record in a mapping from the publicID to the hash of the records 
     * @param _transactionID The transactionID mapping to the location of the encrypted record
     * @return value of the location of the record if it exists
     */
    function retrieveRecordLocation(uint256 _transactionID) external view returns (string memory) {
        string memory recordLocation = transactionIDToRecord[_transactionID];
        require(keccak256(bytes(recordLocation)) != keccak256(bytes("")), "The location of the record is empty.");
        return recordLocation;
    }
    /**
     * @dev Store a transaction to record the details of a record to store
     * @param _publicID The public ID
     * @param _hashOfRecord The hash of the record
     */
    function addTransaction(uint256 _publicID, uint256 _hashOfRecord) external {
        transactions[_publicID].push(_hashOfRecord);
        emit CreatedTransaction(_publicID, _hashOfRecord);
    }
    /**
     * @dev Return transactions of given _publicID
     * @param _publicID The public ID of the transactions
     * @return value of 'transactions[_publicID]'
     */
    function getTransactions(uint256 _publicID) external view returns (uint256[] memory){
        return transactions[_publicID];
    }     
}