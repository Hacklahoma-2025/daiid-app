// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAIID {
    // --- Structures ---

    // Represents a node (voter) in the system.
    struct Node {
        uint256 stake; // Amount of Ether staked by the node.
        uint256 reputation; // Reputation score used to track performance.
        bool exists; // Whether this node is registered.
    }

    // Mapping to keep track of nodes.
    mapping(address => Node) public nodes;
    address[] public nodeAddresses;

    // Holds vote-related data for an image.
    struct ImageVote {
        uint256 totalWeight; // Total staked weight from all votes.
        uint256 weightedScore; // Sum of (vote score * stake) for all votes.
        string ipfsCID; // IPFS content identifier for the image.
        bool ipfsSet; // Flag to ensure image is registered only once.
        bool finalized; // Indicates if voting has been finalized.
        mapping(address => bool) voted; // Tracks if a node has already voted.
        mapping(address => uint256) voteScores; // Stores each node's vote.
        address[] voters; // List of voters for this image.
    }

    // Mapping from image hash to its voting data.
    mapping(bytes32 => ImageVote) private imageVotes;
    // List of registered image hashes (for browsing).
    bytes32[] public imageList;

    // --- Events ---
    event NodeStaked(address indexed node, uint256 amount);
    event Voted(
        address indexed node,
        bytes32 indexed imageHash,
        uint256 vote,
        uint256 weight
    );
    event ImageRegistered(bytes32 indexed imageHash, string ipfsCID);
    event VoteFinalized(bytes32 indexed imageHash, uint256 consensus);

    // --- Functions ---

    /// @notice Stake Ether to register as a node.
    /// @dev New nodes receive an initial reputation of 50.
    function stake() public payable {
        require(msg.value > 0, "Must stake some Ether");
        if (!nodes[msg.sender].exists) {
            nodes[msg.sender] = Node(msg.value, 50, true);
            nodeAddresses.push(msg.sender);
        } else {
            nodes[msg.sender].stake += msg.value;
        }
        emit NodeStaked(msg.sender, msg.value);
    }

    /// @notice Cast a vote on an image's AI-generated likelihood (0–100).
    /// @param imageHash The unique identifier for the image.
    /// @param voteScore The vote score (0–100).
    function vote(bytes32 imageHash, uint256 voteScore) public {
        require(nodes[msg.sender].exists, "Node not staked");
        require(voteScore <= 100, "Vote score must be between 0 and 100");

        ImageVote storage iv = imageVotes[imageHash];
        require(!iv.voted[msg.sender], "Already voted");

        uint256 weight = nodes[msg.sender].stake; // Weighted by staked amount.
        iv.totalWeight += weight;
        iv.weightedScore += voteScore * weight;
        iv.voted[msg.sender] = true;
        iv.voteScores[msg.sender] = voteScore;
        iv.voters.push(msg.sender);

        emit Voted(msg.sender, imageHash, voteScore, weight);
    }

    /// @notice Register an image by associating its hash with an IPFS CID.
    /// @param imageHash The unique identifier for the image.
    /// @param ipfsCID The IPFS content identifier.
    function registerImage(bytes32 imageHash, string memory ipfsCID) public {
        ImageVote storage iv = imageVotes[imageHash];
        require(!iv.ipfsSet, "Image already registered");
        iv.ipfsCID = ipfsCID;
        iv.ipfsSet = true;
        imageList.push(imageHash);
        emit ImageRegistered(imageHash, ipfsCID);
    }

    /// @notice Get the current consensus (weighted average) for an image.
    /// @param imageHash The unique identifier for the image.
    /// @return The consensus vote (0–100).
    function getConsensus(bytes32 imageHash) public view returns (uint256) {
        ImageVote storage iv = imageVotes[imageHash];
        if (iv.totalWeight == 0) return 0;
        return iv.weightedScore / iv.totalWeight;
    }

    /// @notice Finalize the voting for an image to update reputations and adjust stakes.
    /// @dev For each voter, if the vote is close to the consensus, reward reputation.
    ///      If the vote is significantly off, penalize reputation and slash stake.
    ///      This function should be called only once per image.
    /// @param imageHash The unique identifier for the image.
    function finalizeVote(bytes32 imageHash) public {
        ImageVote storage iv = imageVotes[imageHash];
        require(!iv.finalized, "Vote already finalized");
        require(iv.totalWeight > 0, "No votes cast");

        uint256 consensus = iv.weightedScore / iv.totalWeight;

        // Iterate through all voters for this image.
        for (uint i = 0; i < iv.voters.length; i++) {
            address voter = iv.voters[i];
            uint256 nodeVote = iv.voteScores[voter];
            uint256 diff = nodeVote > consensus
                ? nodeVote - consensus
                : consensus - nodeVote;

            // Update reputation and adjust stake based on vote accuracy.
            if (diff <= 10) {
                // Accurate vote: reward with +5 reputation.
                nodes[voter].reputation += 5;
            } else if (diff > 30) {
                // Bad vote: penalize with -5 reputation and slash 5% of stake.
                if (nodes[voter].reputation >= 5) {
                    nodes[voter].reputation -= 5;
                } else {
                    nodes[voter].reputation = 0;
                }
                uint256 slashAmount = (nodes[voter].stake * 5) / 100;
                nodes[voter].stake -= slashAmount;
            } else {
                // Moderately off vote: slight penalty (-1 reputation).
                if (nodes[voter].reputation >= 1) {
                    nodes[voter].reputation -= 1;
                } else {
                    nodes[voter].reputation = 0;
                }
            }
        }

        iv.finalized = true;
        emit VoteFinalized(imageHash, consensus);
    }

    /// @notice Get image details for browsing purposes.
    /// @param index The index in the image list.
    /// @return imageHash The image hash.
    /// @return ipfsCID The IPFS content identifier.
    /// @return consensus The consensus score.
    function getImageData(
        uint index
    )
        public
        view
        returns (bytes32 imageHash, string memory ipfsCID, uint256 consensus)
    {
        require(index < imageList.length, "Index out of bounds");
        bytes32 hash = imageList[index];
        ImageVote storage iv = imageVotes[hash];
        uint256 consensusScore = iv.totalWeight == 0
            ? 0
            : iv.weightedScore / iv.totalWeight;
        return (hash, iv.ipfsCID, consensusScore);
    }

    /// @notice Get the total number of registered images.
    /// @return The image count.
    function getImageCount() public view returns (uint256) {
        return imageList.length;
    }
}
