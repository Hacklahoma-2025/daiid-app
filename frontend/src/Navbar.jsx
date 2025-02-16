import { Anchor, Flex, Title } from "@mantine/core";

function Navbar() {
  return (
    <Flex align={"center"} gap={"xl"}>
      <Anchor href="/">
        <Title c={"white"} fw={300}>
          DAIID
        </Title>
      </Anchor>
      <Anchor href="/browse" c={"white"}>
        Browse
      </Anchor>
      <Anchor href="/upload" c={"white"}>
        Upload
      </Anchor>
    </Flex>
  );
}

export default Navbar;
