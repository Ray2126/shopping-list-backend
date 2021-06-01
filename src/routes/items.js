const express = require('express');
const AWS = require("aws-sdk");

const ITEMS_TABLE = process.env.ITEMS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const router = express.Router();

router.get("/items", async function (req, res) {
  const params = {
    TableName: ITEMS_TABLE,
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    if (Items) {
      res.json(Items);
    } else {
      res
        .status(404)
        .json({ error: 'Could not scan items table' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not list items" });
  }
});

router.get("/items/:itemId", async function (req, res) {
  const params = {
    TableName: ITEMS_TABLE,
    Key: {
      itemId: req.params.itemId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const { itemId, name } = Item;
      res.json({ itemId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find item with provided "itemId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive item" });
  }
});

router.post("/items", async function (req, res) {
  const { itemId, name } = req.body;
  if (typeof itemId !== "string") {
    res.status(400).json({ error: '"itemId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: ITEMS_TABLE,
    Item: {
      itemId: itemId,
      name: name,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ itemId, name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create item" });
  }
});

router.delete("/items/:itemId", async function (req, res) {
  const params = {
    TableName: ITEMS_TABLE,
    Key: {
      itemId: req.params.itemId,
    },
  };

  try {
    await dynamoDbClient.delete(params).promise();
    res.json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not delete item" });
  }
});

router.put("/items/:itemId", async function (req, res) {
  const { name } = req.body;
  const { itemId } = req.params;
  if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  } 
  const params = {
    TableName: ITEMS_TABLE,
    Key: {
      itemId,
    },
    Item: {
      itemId,
      name,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ itemId: req.params.itemId, name })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not update item" });
  }
});

module.exports = router;