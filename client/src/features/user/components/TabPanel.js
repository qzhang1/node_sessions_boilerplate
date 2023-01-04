import Box from "@mui/material/Box";

const TabPanel = ({ tabIdx, children }) => {
  return (
    <Box
      sx={{
        marginTop: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      hidden
    >
      {children}
    </Box>
  );
};

export default TabPanel;
