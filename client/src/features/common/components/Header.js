import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, profileSelector } from "../../user/userSlice";
import ProfileDialog from "./ProfileDialog";

export function Header() {
  const dispatch = useDispatch();
  console.time("time this selector");
  const profile = useSelector(profileSelector);
  console.timeEnd("time this selector");
  const isLoggedIn = !!profile;
  const appName = "Node-Sessions";

  const [anchorElUser, setAnchorElUser] = useState(null);
  const menuOpen = Boolean(anchorElUser);
  const [open, setOpen] = useState(false);

  const handleDialogOpen = () => {
    console.log("clicked");
    setOpen(true);
    setAnchorElUser(null);
  };
  const handleDialogClose = () => setOpen(false);

  const handleOpenUserMenu = (event) => {
    console.log(event.currentTarget);
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser({}));
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "inter,sans-serif",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {appName}
          </Typography>

          {isLoggedIn && (
            <Box sx={{ flexGrow: 0, marginLeft: "auto" }}>
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </IconButton>

              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={menuOpen}
                onClose={handleCloseUserMenu}
              >
                <MenuItem key="profile" onClick={handleDialogOpen}>
                  <Typography textAlign={"center"}>Profile</Typography>
                </MenuItem>
                <MenuItem key="logout" onClick={handleLogout}>
                  <Typography textAlign={"center"}>Logout</Typography>
                </MenuItem>
              </Menu>
              <ProfileDialog
                profile={profile}
                open={open}
                onClose={handleDialogClose}
              />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
