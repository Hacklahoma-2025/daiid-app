import "./App.css";
import {
  Container,
  Box,
  Group,
  Text,
  Image,
  Flex,
  Paper,
  rgba,
  Space,
  Button,
  Stack,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import Navbar from "./Navbar";
import { useForm } from "@mantine/form";
import { Center, CloseButton } from "@mantine/core";
import { useState } from "react";

function UploadPage() {
  return (
    <Container m={0} fluid align="center">
      <Navbar />
      <Space h={40} />
      <Paper p={20} mt={20} maw={450} bg={rgba("#8C96D6", 0.3)}>
        <Stack gap={0}>
          <Demo />
          <Box>
            <Button c={"black"} bg={"white"} size="md" mt={30}>
              Evaluate
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

function Demo() {
  const form = useForm({
    initialValues: { file: null },
  });

  const [preview, setPreview] = useState(null);

  const handleDrop = (files) => {
    const file = files[0]; // Only take the first file
    form.setFieldValue("file", file);
    setPreview(URL.createObjectURL(file));
    console.log(`File name: ${file.name}`);
    console.log(`File size: ${(file.size / 1024).toFixed(2)} kb`);
    console.log(`File type: ${file.type}`);
  };

  const selectedFile = form.values.file && (
    <Flex align="center" justify={"center"}>
      <Text key={form.values.file.name} c={"white"} mx={5}>
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
    <>
      {!preview ? (
        <Dropzone
          bg={rgba("#8C96D6", 0.3)}
          h={250}
          c={"white"}
          p={0}
          multiple={false} // Only allow one file
          accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}
          onDrop={handleDrop}
          onReject={() => form.setFieldError("file", "Select an image only")}
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
          <Text mb={5} mt="md" c={"white"}>
            Selected file:
          </Text>
          {selectedFile}
          <Box position="relative">
            <Image
              src={preview}
              alt="Preview"
              width="100%"
              fit="contain"
              mt={30}
            />
          </Box>
        </>
      )}

      {form.errors.file && (
        <Text c="red" mt={5}>
          {form.errors.file}
        </Text>
      )}
    </>
  );
}

export default UploadPage;
