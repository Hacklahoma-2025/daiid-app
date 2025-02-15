const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAIID Contract", function () {
  let DAIID, daiid, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const DAIIDFactory = await ethers.getContractFactory("DAIID");
    daiid = await DAIIDFactory.deploy();
    // No need to call daiid.deployed() because deploy() already returns a deployed contract.
  });

  it("Should allow a node to stake and register with initial reputation", async function () {
    const stakeAmount = ethers.parseEther("1"); // Updated here
    await daiid.connect(addr1).stake({ value: stakeAmount });
    const node = await daiid.nodes(addr1.address);
    expect(node.stake).to.equal(stakeAmount);
    expect(node.reputation).to.equal(50);
    expect(node.exists).to.equal(true);
  });

  it("Should allow voting and image registration", async function () {
    const stakeAmount = ethers.parseEther("1"); // Updated here
    // Both addr1 and addr2 stake
    await daiid.connect(addr1).stake({ value: stakeAmount });
    await daiid.connect(addr2).stake({ value: stakeAmount });

    // Create a dummy image hash and register it.
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("image1"));
    const ipfsCID = "QmTestCID";
    await daiid.registerImage(imageHash, ipfsCID);

    // addr1 votes 80, addr2 votes 60.
    await daiid.connect(addr1).vote(imageHash, 80);
    await daiid.connect(addr2).vote(imageHash, 60);

    // Check consensus (weighted average)
    const consensus = await daiid.getConsensus(imageHash);
    // Both votes weighted equally (1 ETH each): (80 + 60) / 2 = 70.
    expect(consensus).to.equal(70);
  });

  it("Should finalize vote and update reputations", async function () {
    const stakeAmount = ethers.parseEther("1"); // Updated here
    // Stake for addr1 and addr2
    await daiid.connect(addr1).stake({ value: stakeAmount });
    await daiid.connect(addr2).stake({ value: stakeAmount });

    // Register an image.
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("image2"));
    const ipfsCID = "QmTestCID2";
    await daiid.registerImage(imageHash, ipfsCID);

    // addr1 votes 90, addr2 votes 50 -> consensus should be 70.
    await daiid.connect(addr1).vote(imageHash, 90);
    await daiid.connect(addr2).vote(imageHash, 50);

    // Finalize the vote to update reputations and adjust stakes.
    await daiid.finalizeVote(imageHash);

    // Check consensus value.
    const consensus = await daiid.getConsensus(imageHash);
    expect(consensus).to.equal(70);

    // Check reputation updates.
    // For both voters, the vote difference is 20 (|90-70| and |70-50|),
    // so each should lose 1 reputation point (from an initial 50 to 49).
    const node1 = await daiid.nodes(addr1.address);
    const node2 = await daiid.nodes(addr2.address);
    expect(node1.reputation).to.equal(49);
    expect(node2.reputation).to.equal(49);
  });
});
