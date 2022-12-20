import { Router } from "express";
import { isUserAuthenticated } from "../../middleware/auth.js";

export default function (stockService) {
  const router = Router();

  router.use(isUserAuthenticated);

  router.get("/intraday/:ticker", async (req, res) => {
    const ticker = req.params.ticker;
    if (!ticker?.length) {
      res.status(400).json({
        error: `invalid ticker provided: ${ticker}`,
      });
      return;
    }

    const [result, error] = await stockService.getIntraday(ticker);
    res.status(200).json({
      tickerData: result,
      error,
    });
  });
  return router;
}
