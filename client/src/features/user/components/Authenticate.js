import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import LockOutLinedIcon from "@mui/icons-material/LockOutlined";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import toast from "react-hot-toast";
import { userSelector, loginUser, signupUser } from "../userSlice";
import { useEffect, useState } from "react";
import { Stack, Tab, Tabs } from "@mui/material";

const Authenticate = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [tab, setTab] = useState(0);
  const { register, handleSubmit } = useForm();
  const { profile } = useSelector(userSelector);
  const handleLogin = (data) => dispatch(loginUser(data));
  const handleSignup = (data) => dispatch(signupUser(data));
  const handleTabChange = (e, newVal) => setTab(newVal);

  useEffect(() => {
    if (profile.id) {
      history.push("/");
    }
  }, [profile.id, history]);

  return (
    <Container>
      <Stack spacing={2}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="login" id="login-tab" />
          <Tab label="signup" id="signup-tab" />
        </Tabs>
        <Box
          sx={{
            marginTop: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!tab ? (
            <>
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutLinedIcon />
              </Avatar>
              <Typography component="h3" variant="h5">
                Log In
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit(handleLogin)}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  {...register("email", {
                    required: true,
                    validate: (value) =>
                      value.length > 10 && value.indexOf("@") > 0,
                  })}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: true,
                    min: 8,
                  })}
                />
                {/* <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                /> */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Log In
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <AppRegistrationIcon />
              </Avatar>
              <Typography component="h3" variant="h5">
                Signup
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit(handleSignup)}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  {...register("email", {
                    required: true,
                    validate: (value) =>
                      value.length > 10 && value.indexOf("@") > 0,
                  })}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: true,
                    min: 8,
                  })}
                />
                {/* <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                /> */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign up
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default Authenticate;
