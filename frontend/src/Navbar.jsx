import { Anchor, Flex, Title } from "@mantine/core";

function Navbar() {
  return (
    <Flex align={"center"} gap={"xl"}>
      <Anchor href="/">
        <Title c={"white"} fw={300}>
          DAIID
        </Title>
      </Anchor>
      <Anchor href="/process-image" c={"white"}>
        Upload
      </Anchor>
      <Anchor href="/monitor" c={"white"}>
        Monitor
      </Anchor>
    </Flex>
  );
}

export default Navbar;
