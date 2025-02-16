import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Text,
    Image,
    Flex,
    Paper,
    Stack,
    Title,
    ScrollArea,
    rgba,
    Table
} from "@mantine/core";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import { subscribe_vote_submission } from "../services/ganache_connection.js";
import getConsensus from "../services/GetConsensus.js";

function Monitor() {
    const { file, preview } = useLocation().state || {};
    const [votes, setVotes] = useState([]);
    const [consensus, setConsensus] = useState("x");
    const [base64, setBase64] = useState(null);
    const [totalWeight, setTotalWeight] = useState(1n);

    // Convert uploaded file to base64
    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onerror = () => console.error("Failed to read file");
            reader.onload = () => setBase64(reader.result);
            reader.readAsDataURL(file);
        }
    }, [file]);

    // Subscribe to vote events
    useEffect(() => {
        console.log("Subscribing to vote events...");
        const subscription = subscribe_vote_submission((voteData) => {
            setVotes((prevVotes) => [...prevVotes, voteData]);
        });

        return () => {
            if (subscription?.unsubscribe) {
                console.log("Unsubscribing from vote events...");
                subscription.unsubscribe();
            }
        };
    }, []);

    // Update consensus and total weight whenever votes or base64 changes
    useEffect(() => {
        const weightSum = votes.reduce(
            (acc, vote) => acc + vote.weight,
            1n
        );
        setTotalWeight(weightSum);

        if (base64) {
            getConsensus(base64)
                .then((result) => setConsensus(result))
                .catch((err) => console.error("Error updating consensus:", err));
        }
    }, [votes, base64]);

    return (
        <Container m={0} fluid align="center" h={"90vh"}>
            <Navbar />
            <Flex
                h={"75vh"}
                mt={20}
                align={"center"}
                justify={"space-around"}
                direction={{ base: "column", lg: "row" }}
            >
                <Paper
                    p={20}
                    mt={20}
                    w={{ base: "100%", md: "40%" }}
                    bg={rgba("#8C96D6", 0.3)}
                >
                    <Stack gap={0}>
                        <ScrollArea h={350} my={5}>
                            <Table highlightOnHover withBorder style={{ color: "white" }}>
                                <thead>
                                    <tr>
                                        <th>Node</th>
                                        <th>Score (%)</th>
                                        <th>Weight (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {votes.map((vote, index) => (
                                        <tr key={index}>
                                            <td>{vote.node.substring(0, 10)}...</td>
                                            <td>{vote.score}%</td>
                                            <td>{((Number(vote.weight) / Number(totalWeight)) * 100).toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </ScrollArea>;
                    </Stack>
                </Paper>
            </Flex>
        </Container>
    );
}

export default Monitor;