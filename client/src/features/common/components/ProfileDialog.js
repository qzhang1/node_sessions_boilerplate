import {
  Dialog,
  DialogTitle,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  DialogContent,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export default function ProfileDialog({ open, onClose, profile }) {
  console.log(open);
  const profileInfo = [
    {
      name: "Email",
      value: profile.email,
    },
    {
      name: "Provider",
      value: profile.provider,
    },
    {
      name: "Role",
      value: profile.roles,
    },
  ];
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Profile</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "400px",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <List
            sx={{
              width: "100%",
              maxWidth: "360px",
              bgColor: "background.paper",
            }}
          >
            {profileInfo.map((p) => (
              <ListItem key={p.name}>
                <ListItemText primary={p.name} secondary={p.value} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
