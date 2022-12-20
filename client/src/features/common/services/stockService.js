import axios from "axios";

export default class StockService {
  constructor() {
    this._client = axios.create({
      baseURL: `${process.env.REACT_APP_BFF_BASE_URL}/stocks`,
      timeout: process.env.REACT_APP_BFF_CLIENT_TIMEOUT,
    });
  }

  async getIntraday(ticker) {
    const {
      data: { tickerData, error },
      status,
    } = await this._client.get(`/intraday/${ticker}`, {
      withCredentials: true,
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return [tickerData, error, status];
  }
}
