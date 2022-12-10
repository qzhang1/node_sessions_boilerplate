import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import LandingPage from "./features/landing/LandingPage";
import Signup from "./features/user/components/Signup";
import Login from "./features/user/components/Login";
import { userSelector } from "./features/user/userSlice";
import { Header } from "./features/user/components/Header";

function App() {
  const { isLoggedIn } = useSelector(userSelector);

  return (
    <Router>
      <div className="App">
        <CssBaseline />
        <Header />
        <Container maxWidth="md" component="main">
          <Grid container spacing={5}>
            <Switch>
              <Route exact path="/">
                <LandingPage />
              </Route>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/signup">
                <Signup />
              </Route>
            </Switch>
          </Grid>
        </Container>

        {/* <ul>
          <li>
            <Link to="/">Landing</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          {!isLoggedIn && (
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          )}
        </ul> */}
      </div>
    </Router>
  );
}

export default App;
