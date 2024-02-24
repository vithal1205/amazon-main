const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");

const router = express.Router();
//Post Method
router.post("/post", (req, res) => {
  res.send("Post API");
});

let dataStore = [];
//Get all Method
router.get("/create-data-source", initializeDataSource());

initializeDataSource()({}, { send: console.log });

// API for statistics
router.get("/statistics", (req, res) => {
  console.log(req.query);
  const { month } = req.query;

  if (!month) {
    return res.send("Month is mandatory!");
  }

  if (month < 1 || month > 12) return res.send("Month is invalid!");
  let filteredProducts = dataStore.filter(
    (item) => new Date(item.dateOfSale).getMonth() + 1 == month
  );

  let result = getStatisticsData(filteredProducts);

  res.send(result);
});

// API for bar chart
router.get("/bar-chart", (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.send("Month is mandatory!");
  }

  if (month < 1 || month > 12) return res.send("Month is invalid!");
  let filteredProducts = dataStore.filter(
    (item) => new Date(item.dateOfSale).getMonth() + 1 == month
  );

  let result = getBarCharData(filteredProducts);

  res.send(result);
});

router.get("/pie-chart", (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.send("Month is mandatory!");
  }

  if (month < 1 || month > 12) return res.send("Month is invalid!");
  let filteredProducts = dataStore.filter(
    (item) => new Date(item.dateOfSale).getMonth() + 1 == month
  );

  let result = getPieChartData(filteredProducts);

  res.send(result);
});

// API to fetch combined data
router.get("/combined-data", (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.send("Month is mandatory!");
  }

  if (month < 1 || month > 12) return res.send("Month is invalid!");
  let filteredProducts = dataStore.filter(
    (item) => new Date(item.dateOfSale).getMonth() + 1 == month
  );

  let result = {
    pieChart: getPieChartData(filteredProducts),
    barChart: getBarCharData(filteredProducts),
    statistics: getStatisticsData(filteredProducts),
  };

  res.send(result);
});

module.exports = router;
function getBarCharData(filteredProducts) {
  let result = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 0,
    "601-700": 0,
    "701-800": 0,
    "801-900": 0,
    "901-above": 0,
  };

  const keys = [
    "0-100",
    "101-200",
    "201-300",
    "301-400",
    "401-500",
    "501-600",
    "601-700",
    "701-800",
    "801-900",
    "901-above",
  ];
  for (let product of filteredProducts) {
    let keyIndex = Math.floor(product.price / 100);
    if (keyIndex > 9) keyIndex = 9;
    result[keys[keyIndex]]++;
  }
  return result;
}

function getStatisticsData(filteredProducts) {
  let result = {
    totalSaleAmount: 0,
    totalNumberOfSoldItems: 0,
    totalNumberOfNotSoldItems: 0,
  };
  for (let product of filteredProducts) {
    result.totalSaleAmount += product.price;
    if (product.sold) result.totalNumberOfSoldItems++;
    else result.totalNumberOfNotSoldItems++;
  }
  return result;
}

function getPieChartData(filteredProducts) {
  let result = {};
  for (let product of filteredProducts) {
    if (product.category in result) {
      result[product.category]++;
    } else {
      result[product.category] = 1;
    }
  }
  return result;
}

function initializeDataSource() {
  return async (req, res) => {
    let data = await fetch(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    dataStore = await data.json();

    res.send("Success");
  };
}
