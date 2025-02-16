import { Anchor, Flex, Title } from "@mantine/core";

function Navbar() {
  return (
    <Flex align={"center"} gap={"xl"}>
      <Title c={"white"} fw={300}>
        DAIID
      </Title>
      <Anchor href="/" c={"white"}>
        Home
      </Anchor>
      <Anchor href="/upload" c={"white"}>
        Upload
      </Anchor>
    </Flex>
  );
}

export default Navbar;
