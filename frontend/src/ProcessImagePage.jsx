import {
  Grid,
  Center,
  CloseButton,
  Group,
  Container,
  Box,
  Text,
  Title,
  Flex,
  Image,
  Paper,
  rgba,
  Space,
  Button,
  Stack,
  ScrollArea,
  Table,
  GridCol,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import registerImage from "../services/uploadRequest_new.js";
import { subscribe_vote_submission } from "../services/ganache_connection.js";
import getConsensus from "../services/GetConsensus.js";

function ProcessImage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [statusPage, setStatusPage] = useState(false);
  const [consensus, setConsensus] = useState("X");
  const [votes, setVotes] = useState([]);
  const [base64, setBase64] = useState(null);
  const [totalWeight, setTotalWeight] = useState(1n);

  const form = useForm({
    initialValues: { file: null },
  });

  const handleDrop = (files) => {
    const file = files[0]; // Only take the first file
    setFile(file);
    console.log(file);
    form.setFieldValue("file", file);
    setPreview(URL.createObjectURL(file));
    console.log(`File name: ${file.name}`);
    console.log(`File size: ${(file.size / 1024).toFixed(2)} kb`);
    console.log(`File type: ${file.type}`);
  };

  useEffect(() => {
    const subscribeAndRegister = async () => {
      if (base64) {
        console.log("Subscribing to vote events...");
        const subscription = subscribe_vote_submission((voteData) => {
          setVotes((prevVotes) => [...prevVotes, voteData]);
        });

        await registerImage(base64);

        return () => {
          if (subscription?.unsubscribe) {
            console.log("Unsubscribing from vote events...");
            subscription.unsubscribe();
          }
        };
      }
    };

    subscribeAndRegister();
  }, [base64]);

  useEffect(() => {
    const weightSum = votes.reduce((acc, vote) => acc + vote.weight, 1n);
    setTotalWeight(weightSum);

    if (base64 && votes.length > 0) {
      getConsensus(base64)
        .then((result) => setConsensus(result))
        .catch((err) => console.error("Error updating consensus:", err));
    }
  }, [votes]);

  const handleClick = async () => {
    setStatusPage(true);
    if (file) {
      try {
        // Compute base64 string from file
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file); // Reads file as a base64 encoded data URL
        });

        // Output base64 string
        console.log("Base64 output:", base64);

        // Set the base64 state
        setBase64(base64);
      } catch (error) {
        console.error("Error computing base64:", error);
      }
    } else {
      console.warn("No file selected.");
    }
  };

  const selectedFile = form.values.file && (
    <Flex align="center" justify={"center"}>
      <Text key={form.values.file.name} c={"white"} mx={5} fw={300}>
        <b>{form.values.file.name}</b>
      </Text>
      <CloseButton
        mx={5}
        size="md"
        onClick={() => {
          form.setFieldValue("file", null);
          setPreview(null);
        }}
        style={{
          backgroundColor: "white",
          borderRadius: "50%",
        }}
      />
    </Flex>
  );

  return (
    <Container m={0} fluid align="center">
      <Navbar />
      <Space h={20} />
      <Flex
        h={"75vh"}
        mt={20}
        align={"center"}
        justify={"space-around"}
        direction={{ base: "column", lg: "row" }}
      >
        {!statusPage ? (
          <Paper p={20} mt={20} maw={450} mih={450} bg={rgba("#8C96D6", 0.3)}>
            <Stack gap={10} justify="space-evenly" mih={450}>
              {!preview ? (
                <Dropzone
                  bg={rgba("#8C96D6", 0.3)}
                  mih={250}
                  c={"white"}
                  p={0}
                  multiple={false} // Only allow one file
                  accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}
                  onDrop={handleDrop}
                  onReject={() =>
                    form.setFieldError("file", "Select an image only")
                  }
                >
                  <Center h={250} p={10}>
                    <Dropzone.Idle>
                      Drop your image here or select a file from your computer
                    </Dropzone.Idle>
                    <Dropzone.Accept>
                      Drop your image here or select a file from your computer
                    </Dropzone.Accept>
                    <Dropzone.Reject>File is invalid</Dropzone.Reject>
                  </Center>
                </Dropzone>
              ) : (
                <>
                  <Text mb={5} mt="md" c={"white"} size="lg" fw={600}>
                    Selected file
                  </Text>
                  {selectedFile}
                  <Box position="relative">
                    <Image
                      src={preview}
                      alt="Preview"
                      width="100%"
                      fit="contain"
                      mt={15}
                    />
                  </Box>
                </>
              )}

              {form.errors.file && (
                <Text c="red" mt={5}>
                  {form.errors.file}
                </Text>
              )}

              <Box>
                {!preview ? (
                  <Button
                    c={"black"}
                    bg={"white"}
                    size="md"
                    mt={30}
                    disabled
                    variant="dimmed"
                  >
                    Evaluate
                  </Button>
                ) : (
                  <Button
                    c={"black"}
                    bg={"white"}
                    size="md"
                    mt={30}
                    onClick={handleClick}
                  >
                    Evaluate
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper p={20} mt={20} maw={450} bg={rgba("#8C96D6", 0.3)}>
              <Stack gap={0}>
                <Box position="relative">
                  <Image
                    src={preview}
                    alt="Preview"
                    width="100%"
                    fit="contain"
                  />
                </Box>
              </Stack>
            </Paper>
            <Paper
              p={20}
              pt={40}
              mt={20}
              w={{ base: "100%", md: "40%" }}
              bg={rgba("#8C96D6", 0.3)}
            >
              <Stack gap={0}>
                <Text align="center" size="lg" c={"white"}>
                  This image is
                </Text>
                <Title align="center" c={"white"}>
                  {consensus === null ? "X" : `${consensus}%`}
                </Title>
                <Text align="center" size="lg" c={"white"}>
                  likely to be AI generated.
                </Text>
                <Space h={15} />
                <Grid mt={10}>
                  <GridCol span={6}>
                    <Text c={"white"} fw={600}>
                      Node
                    </Text>
                  </GridCol>
                  <GridCol span={3}>
                    <Text c={"white"} fw={600}>
                      Score (%)
                    </Text>
                  </GridCol>
                  <GridCol span={3}>
                    {" "}
                    <Text c={"white"} fw={600}>
                      Weight (%)
                    </Text>
                  </GridCol>
                </Grid>
                <ScrollArea h={275} my={5}>
                  <Table c={"white"} verticalSpacing={"md"}>
                    <Table.Tbody>
                      {votes.map((vote, index) => (
                        <Table.Tr key={index}>
                          <Table.Td w={"50%"} align="center">
                            {vote.node.substring(0, 20)}...
                          </Table.Td>
                          <Table.Td w={"25%"} align="center">
                            {vote.score}%
                          </Table.Td>
                          <Table.Td w={"25%"} align="center">
                            {(
                              (Number(vote.weight) / Number(totalWeight)) *
                              100
                            ).toFixed(2)}
                            %
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
            </Paper>
          </>
        )}
      </Flex>
    </Container>
  );
}

export default ProcessImage;
