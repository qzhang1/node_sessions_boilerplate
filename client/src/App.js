import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CssBaseline, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";

import LandingPage from "./features/landing/LandingPage";
import Authenticate from "./features/user/components/Authenticate";
import { Header } from "./features/common/components/Header";

function App() {
  return (
    <Router>
      <div className="App">
        <CssBaseline />
        <Stack spacing={2}>
          <Header />
          <Grid container spacing={2} display="flex" justifyContent="center">
            <Grid item xs={10}>
              <Switch>
                <Route exact path="/">
                  <LandingPage />
                </Route>
                <Route path="/authenticate">
                  <Authenticate />
                </Route>
              </Switch>
            </Grid>
          </Grid>
        </Stack>
      </div>
    </Router>
  );
}

export default App;
