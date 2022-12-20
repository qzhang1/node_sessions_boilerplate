import { Box, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { userSelector, fetchUserProfile } from "../user/userSlice";
import StockService from "../common/services/stockService.js";

const stockService = new StockService();
export default function LandingPage() {
  const dispatch = useDispatch();
  const { profile, isLoggedIn } = useSelector(userSelector);
  const history = useHistory();

  const [tickerData, setTickerData] = useState(null);
  const { register, handleSubmit } = useForm();
  const handleTickerSubmit = async (input) => {
    const [data, error, status] = await stockService.getIntraday(input.ticker);
    if (status === 403) {
      history.push("/authenticate");
    }
    if (status !== 200 || error) {
      toast.error(
        `failed to retrieve ticker data with status: ${status}, error: ${error}`
      );
    }
    toast.success("successfully retrieved data for " + input.ticker);
    setTickerData(data);
  };
  useEffect(() => {
    if (!profile.id) {
      if (!isLoggedIn) {
        history.push("/authenticate");
      }

      dispatch(fetchUserProfile({}));
    }
  }, [profile.id, isLoggedIn, history]);

  return (
    <>
      <Stack alignItems="center">
        <Box>
          <h3>
            <strong>Welcome to Landing Page</strong>
          </h3>
        </Box>
        <Box>
          <Box component="form" onSubmit={handleSubmit(handleTickerSubmit)}>
            <TextField
              margin="normal"
              fullWidth
              name="ticker"
              label="ticker"
              id="ticker"
              {...register("ticker", {
                required: true,
              })}
            />
          </Box>
        </Box>
        {tickerData && (
          <Box>
            <LineChart width={800} height={400} data={tickerData}>
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip />
            </LineChart>
          </Box>
        )}
      </Stack>
      <Toaster />
    </>
  );
}
