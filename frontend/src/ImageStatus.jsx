import "./App.css";
import {
  Container,
  Box,
  Text,
  Image,
  Flex,
  Paper,
  rgba,
  Button,
  Stack,
  Title,
  ScrollArea,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import Navbar from "./Navbar";
import { useForm } from "@mantine/form";
import { Center, CloseButton } from "@mantine/core";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  subscribe_image_registration,
  subscribe_vote_submission,
  subscribe_vote_finalization,
} from "../services/ganache_connection.js";

function ImageStatus() {
  const percent = 34;
  const location = useLocation();
  const { file, preview } = location.state || {};
  console.log(file, preview);

  const [votes, setVotes] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  /// State to accumulate vote submissions
  useEffect(() => {
    console.log("Votes updated:", votes);
    setTotalWeight(votes.reduce((acc, vote) => acc + Number(vote.weight), 0));
  }, [votes]);

  useEffect(() => {
    // Subscribe to vote events
    const subscribeVotes = async () => {
      const subscription = await subscribe_vote_submission((voteData) => {
        // Append new vote data to the votes array
        setVotes((prevVotes) => [...prevVotes, voteData]);
        console.log(voteData);
      });

      // (Optional) unsubscribe when the component unmounts
      return () => {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      };
    };

    const unsubscribe = subscribeVotes();

    // Clean up subscription on unmount
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

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
        <Paper p={20} mt={20} maw={450} bg={rgba("#8C96D6", 0.3)}>
          <Stack gap={0}>
            <Box position="relative">
              <Image
                src={preview}
                alt="Preview"
                width="100%"
                fit="contain"
                mt={30}
              />
            </Box>
          </Stack>
        </Paper>
        <Paper
          p={20}
          mt={20}
          w={{ base: "100%", md: "40%" }}
          bg={rgba("#8C96D6", 0.3)}
        >
          <Stack gap={0}>
            <Text align="center" size="lg" c={"white"}>
              This image is
            </Text>
            <Title align="center" c={"white"}>
              {percent}%
            </Title>
            <Text align="center" size="lg" c={"white"}>
              likely to be AI generated.
            </Text>
            <ScrollArea h={350} my={5}>
              {votes.map((i) => (
                <Paper
                  bg={rgba("#8C96D6", 0.3)}
                  c={"white"}
                  r="md"
                  p={15}
                  my={15}
                  key={i}
                >
                  {i.node} voted {i.score}% {Number(i.weight) / totalWeight *100}%
                </Paper>
              ))}
            </ScrollArea>
          </Stack>
        </Paper>
      </Flex>
    </Container>
  );
}

export default ImageStatus;
