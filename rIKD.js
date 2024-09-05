import WebSocket from "ws";
import axios from "axios";
import * as cheerio from "cheerio";

const Get = async () => {
  const offsetsRequest = await axios.get(
    "https://www.izko.org.tr/Home/GuncelKur"
  );
  const $ = cheerio.load(offsetsRequest.data);

  return new Promise(async (r, a) => {
    const URL =
      "wss://socket.haremaltin.com/socket.io/?EIO=4&transport=websocket";
    const wss = new WebSocket(URL);

    wss.onopen = (event) => {
      wss.send("40");
    };

    wss.onclose = (event) => {
      Get();
    };

    wss.onmessage = async (event) => {
      const offsets = {
        yirmiikiP: parseFloat(
          $("#data-container").attr("data-yirmiiki-profit").replace(",", ".")
        ),
        yirmiikiN: parseFloat(
          $("#data-container").attr("data-yirmiiki-number").replace(",", ".")
        ),
        ondortP: parseFloat(
          $("#data-container").attr("data-ondort-profit").replace(",", ".")
        ),
        ondortN: parseFloat(
          $("#data-container").attr("data-ondort-number").replace(",", ".")
        ),
        onsekizP: parseFloat(
          $("#data-container").attr("data-onsekiz-profit").replace(",", ".")
        ),
        onsekizN: parseFloat(
          $("#data-container").attr("data-onsekiz-number").replace(",", ".")
        ),
        gramP: parseFloat(
          $("#data-container").attr("data-gram-profit").replace(",", ".")
        ),
        gramN: parseFloat(
          $("#data-container").attr("data-gram-number").replace(",", ".")
        ),
        yeniceyrekP: parseFloat(
          $("#data-container").attr("data-yeniceyrek-profit").replace(",", ".")
        ),
        yeniceyrekN: parseFloat(
          $("#data-container").attr("data-yeniceyrek-number").replace(",", ".")
        ),
        eskiceyrekP: parseFloat(
          $("#data-container").attr("data-eskiceyrek-profit").replace(",", ".")
        ),
        eskiceyrekN: parseFloat(
          $("#data-container").attr("data-eskiceyrek-number").replace(",", ".")
        ),
        ataP: parseFloat(
          $("#data-container").attr("data-ata-profit").replace(",", ".")
        ),
        ataN: parseFloat(
          $("#data-container").attr("data-ata-number").replace(",", ".")
        ),
      };

      let jss = event.data.split("[");
      let responseCode = jss.shift();
      if (responseCode == "42" && jss.length) {
        jss.concat("[");
        const response = JSON.parse("[" + jss);
        // Parse
        const profits = {
          yirmiiki: offsets.yirmiikiP,
          ondort: offsets.ondortP,
          onsekiz: offsets.onsekizP,
          gram: offsets.gramP,
          yeniceyrek: offsets.yeniceyrekP,
          eskiceyrek: offsets.eskiceyrekP,
          ata: offsets.ataP,
        };

        const numbers = {
          yirmiiki: offsets.yirmiikiN,
          ondort: offsets.ondortN,
          onsekiz: offsets.onsekizN,
          gram: offsets.gramN,
          yeniceyrek: offsets.yeniceyrekN,
          eskiceyrek: offsets.eskiceyrekN,
          ata: offsets.ataN,
        };

        const types = [
          "yirmiiki",
          "ondort",
          "onsekiz",
          "gram",
          "yeniceyrek",
          "eskiceyrek",
          "ata",
        ];

        const calculatedPrices = {};

        for (var key in response[1].data) {
          let currency = response[1].data[key];
          if (currency.code === "ALTIN") {
            types.forEach((type) => {
              calculatedPrices[type] =
                Math.ceil(
                  (currency.satis * 1 * profits[type] + numbers[type]) / 10
                ) * 10;
            });
            calculatedPrices["yeniyarim"] =
              Math.ceil((calculatedPrices["yeniceyrek"] * 2) / 10) * 10;
            calculatedPrices["eskiyarim"] =
              Math.ceil((calculatedPrices["eskiceyrek"] * 2) / 10) * 10;
            calculatedPrices["yenitam"] =
              Math.ceil((calculatedPrices["yeniceyrek"] * 4) / 10) * 10;
            calculatedPrices["eskitam"] =
              Math.ceil((calculatedPrices["eskiceyrek"] * 4) / 10) * 10;
          }
        }
        const data = {
          Gram: calculatedPrices["gram"] + ".00",
          Ceyrek: calculatedPrices["eskiceyrek"] + ".00",
          Yarim: calculatedPrices["eskiyarim"] + ".00",
          Tam: calculatedPrices["eskitam"] + ".00",
        };
        // Parse end
        r(data);
      }
    };
  });
};

export default { Get };
