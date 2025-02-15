const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAIID Contract", function () {
  let daiid, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const DAIIDFactory = await ethers.getContractFactory("DAIID");
    daiid = await DAIIDFactory.deploy();
  });

  it("Should allow a node to stake and register with initial reputation", async function () {
    const stakeAmount = ethers.parseEther("1");
    await daiid.connect(addr1).stake({ value: stakeAmount });
    const node = await daiid.nodes(addr1.address);
    expect(node.stake).to.equal(stakeAmount);
    expect(node.reputation).to.equal(50);
    expect(node.exists).to.equal(true);
  });

  it("Should allow voting and image registration", async function () {
    const stakeAmount = ethers.parseEther("1");
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
    // With 1 ETH stake each: (80 + 60) / 2 = 70.
    expect(consensus).to.equal(70);
  });

  it("Should revert finalization if fewer than 4 votes are cast", async function () {
    const stakeAmount = ethers.parseEther("1");
    // Only two voters stake and vote.
    await daiid.connect(addr1).stake({ value: stakeAmount });
    await daiid.connect(addr2).stake({ value: stakeAmount });

    // Register an image.
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("image2"));
    const ipfsCID = "QmTestCID2";
    await daiid.registerImage(imageHash, ipfsCID);

    // addr1 votes 90, addr2 votes 50.
    await daiid.connect(addr1).vote(imageHash, 90);
    await daiid.connect(addr2).vote(imageHash, 50);

    // Finalization should revert because fewer than 4 votes have been cast.
    await expect(daiid.finalizeVote(imageHash)).to.be.revertedWith(
      "At least 4 votes required"
    );
  });

  it("Should finalize vote and update reputations when 4 votes are cast", async function () {
    const stakeAmount = ethers.parseEther("1");
    // Four different signers stake.
    await daiid.connect(owner).stake({ value: stakeAmount });
    await daiid.connect(addr1).stake({ value: stakeAmount });
    await daiid.connect(addr2).stake({ value: stakeAmount });
    await daiid.connect(addr3).stake({ value: stakeAmount });

    // Register an image.
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("image3"));
    const ipfsCID = "QmTestCID3";
    await daiid.registerImage(imageHash, ipfsCID);

    // Four votes:
    // For example, let:
    //  - owner votes 80,
    //  - addr1 votes 90,
    //  - addr2 votes 50,
    //  - addr3 votes 70.
    // Total weighted score = 80 + 90 + 50 + 70 = 290, total weight = 4 ETH,
    // so consensus = floor(290 / 4) = 72.
    await daiid.connect(owner).vote(imageHash, 80);
    await daiid.connect(addr1).vote(imageHash, 90);
    await daiid.connect(addr2).vote(imageHash, 50);
    await daiid.connect(addr3).vote(imageHash, 70);

    // Finalize the vote (should succeed because 4 votes are cast).
    await daiid.finalizeVote(imageHash);

    // Check consensus value.
    const consensus = await daiid.getConsensus(imageHash);
    expect(consensus).to.equal(72);

    // Reputation adjustments according to the logic:
    // For a consensus of 72:
    // - owner: |80 - 72| = 8  -> accurate (<= 10): +5 reputation => 50 + 5 = 55.
    // - addr1: |90 - 72| = 18 -> moderately off (>10 and <=30): -1 reputation => 50 - 1 = 49.
    // - addr2: |72 - 50| = 22 -> moderately off: -1 reputation => 50 - 1 = 49.
    // - addr3: |70 - 72| = 2  -> accurate: +5 reputation => 50 + 5 = 55.
    const nodeOwner = await daiid.nodes(owner.address);
    const node1 = await daiid.nodes(addr1.address);
    const node2 = await daiid.nodes(addr2.address);
    const node3 = await daiid.nodes(addr3.address);

    expect(nodeOwner.reputation).to.equal(55);
    expect(node1.reputation).to.equal(49);
    expect(node2.reputation).to.equal(49);
    expect(node3.reputation).to.equal(55);
  });
});
