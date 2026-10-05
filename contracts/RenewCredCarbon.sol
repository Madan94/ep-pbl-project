// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RenewCredCarbon
 * @dev Decentralized Carbon Credit Registry Smart Contract.
 * Stores AI-verified carbon generation records, issues digital carbon credit certificates,
 * handles P2P credit transfers, and enforces credit retirement.
 */
contract RenewCredCarbon {
    address public contractOwner;
    uint256 public nextCreditId = 1;

    struct CarbonCredit {
        uint256 id;
        string projectId;
        string deviceId;
        uint256 energyKWh;       // Scaled by 10^4
        uint256 co2ReducedKg;    // Scaled by 10^4
        uint256 credits;         // Scaled by 10^9
        uint256 timestamp;
        string certificateHash;
        bool verified;
        bool retired;
        string retirementReason;
        address owner;
    }

    // Mapping from Credit ID -> CarbonCredit Record
    mapping(uint256 => CarbonCredit) public carbonCredits;

    // Mapping from Certificate Hash -> Credit ID (prevent duplicate minting)
    mapping(string => uint256) public hashToCreditId;

    // Events
    event VerifiedRecordSubmitted(uint256 indexed id, string projectId, string certificateHash);
    event CarbonCreditMinted(uint256 indexed id, address indexed owner, uint256 credits);
    event CarbonCreditTransferred(uint256 indexed id, address indexed from, address indexed to);
    event CarbonCreditRetired(uint256 indexed id, address indexed owner, string reason);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "RenewCred: Caller is not contract owner");
        _;
    }

    modifier creditExists(uint256 id) {
        require(id > 0 && id < nextCreditId, "RenewCred: Credit ID does not exist");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    /**
     * @notice Submits an AI-verified carbon record and mints a digital credit token.
     */
    function submitVerifiedRecord(
        string memory _projectId,
        string memory _deviceId,
        uint256 _energyKWh,
        uint256 _co2ReducedKg,
        uint256 _credits,
        string memory _certificateHash,
        address _recipient
    ) public returns (uint256) {
        require(hashToCreditId[_certificateHash] == 0, "RenewCred: Certificate hash already registered");

        uint256 id = nextCreditId++;
        address owner = _recipient != address(0) ? _recipient : msg.sender;

        carbonCredits[id] = CarbonCredit({
            id: id,
            projectId: _projectId,
            deviceId: _deviceId,
            energyKWh: _energyKWh,
            co2ReducedKg: _co2ReducedKg,
            credits: _credits,
            timestamp: block.timestamp,
            certificateHash: _certificateHash,
            verified: true,
            retired: false,
            retirementReason: "",
            owner: owner
        });

        hashToCreditId[_certificateHash] = id;

        emit VerifiedRecordSubmitted(id, _projectId, _certificateHash);
        emit CarbonCreditMinted(id, owner, _credits);

        return id;
    }

    /**
     * @notice Transfers ownership of a carbon credit to a buyer.
     */
    function transferCredit(uint256 _id, address _to) public creditExists(_id) {
        CarbonCredit storage credit = carbonCredits[_id];
        require(msg.sender == credit.owner, "RenewCred: Not credit owner");
        require(!credit.retired, "RenewCred: Cannot transfer retired credit");
        require(_to != address(0), "RenewCred: Invalid recipient address");

        address previousOwner = credit.owner;
        credit.owner = _to;

        emit CarbonCreditTransferred(_id, previousOwner, _to);
    }

    /**
     * @notice Permanently retires a carbon credit to offset carbon footprint.
     */
    function retireCredit(uint256 _id, string memory _reason) public creditExists(_id) {
        CarbonCredit storage credit = carbonCredits[_id];
        require(msg.sender == credit.owner, "RenewCred: Not credit owner");
        require(!credit.retired, "RenewCred: Credit already retired");

        credit.retired = true;
        credit.retirementReason = _reason;

        emit CarbonCreditRetired(_id, msg.sender, _reason);
    }

    /**
     * @notice Returns details of a specific carbon credit.
     */
    function getCredit(uint256 _id) public view creditExists(_id) returns (CarbonCredit memory) {
        return carbonCredits[_id];
    }
}
