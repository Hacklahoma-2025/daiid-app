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
import { useNavigate } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/upload");
  };

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
          <Button c={"black"} bg={"white"} size="md" onClick={handleClick}>
            Let's check!
          </Button>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
