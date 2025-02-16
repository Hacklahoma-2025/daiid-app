import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  Box,
  Button,
  Container,
  Flex,
  Space,
  Text,
  Title,
} from "@mantine/core";

function UploadPage() {
  const [count, setCount] = useState(0);

  return (
    <Container>
      <Flex direction="column" h={"90vh"} justify={"center"}>
        <Title size={"4rem"} c={"white"} fw={300}>
          DAIID
        </Title>

        <Text c={"white"} fw={600} mb={"xl"}>
          Is the media you are consuming AI generated?
        </Text>
        <Space h={"xl"} />
        <Box>
        </Box>
      </Flex>
    </Container>
  );
}

export default UploadPage;
