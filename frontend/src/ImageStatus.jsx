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
import { useState } from "react";

function ImageStatus() {
  const percent = 34;
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
            <Box>
              <Button c={"black"} bg={"white"} size="md" mt={30}>
                Evaluate
              </Button>
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
              {[...Array(10).keys()].map((i) => (
                <Paper
                  bg={rgba("#8C96D6", 0.3)}
                  c={"white"}
                  r="md"
                  p={15}
                  my={15}
                  key={i}
                >
                  Voting data from a specific node. Lots of data.
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
