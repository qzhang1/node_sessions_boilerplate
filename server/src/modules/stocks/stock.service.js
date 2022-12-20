export default class StockService {
  constructor(apiKey, httpClient, cacheClient) {
    this.apiKey = apiKey;
    this.httpClient = httpClient;
    this.cacheClient = cacheClient;
  }

  async getIntraday(ticker) {
    if (!ticker?.trim()?.length) {
      return [null, new Error("ticker is empty or invalid")];
    }
    const now = new Date(),
      today = now.getDay();
    let cacheKey = now.toDateString().replaceAll(" ", "_") + `_${ticker}`;
    if (today == 1) {
      const threeDayOffset = 24 * 60 * 60 * 1000 * 3;
      const lastFriday = new Date(now.setTime(now.getTime() - threeDayOffset));
      cacheKey = lastFriday.toDateString().replaceAll(" ", "_") + `_${ticker}`;
    }
    const cacheResult = await this.cacheClient.get(cacheKey);
    if (cacheResult) {
      return [JSON.parse(cacheResult), null];
    }

    const { data, status } = await this.httpClient.get(
      `/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&apikey=${this.apiKey}`
    );
    if (status !== 200) {
      return [null, new Error(`"getIntraday": failed with status: ${status}`)];
    }
    const timeSeries = data["Time Series (5min)"];
    const result = [];
    for (let ts in timeSeries) {
      const [_, timestamp] = ts.split(" ");
      result.push({
        timestamp,
        price: parseFloat(timeSeries[ts]["4. close"]),
      });
    }
    result.reverse();
    await this.cacheClient.set(cacheKey, JSON.stringify(result), {
      EX: 86400,
    });
    return [result, null];
  }
}
