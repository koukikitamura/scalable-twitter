import { initAWS } from "@src/infrastructure/aws";
import * as AWS from "aws-sdk";
import { CreateTableInput } from "aws-sdk/clients/dynamodb";

initAWS();

const createTwitterTableInput: CreateTableInput = {
  TableName: "twitter",
  AttributeDefinitions: [
    { AttributeName: "ID", AttributeType: "N" },
    { AttributeName: "DataType", AttributeType: "S" },
    { AttributeName: "DataValue", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "ID", KeyType: "HASH" },
    { AttributeName: "DataType", KeyType: "RANGE" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "DataValue-index",
      Projection: {
        ProjectionType: "ALL",
      },
      KeySchema: [
        {
          AttributeName: "DataValue",
          KeyType: "HASH",
        },
        {
          AttributeName: "DataType",
          KeyType: "RANGE",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    },
  ],
};

const ddb = new AWS.DynamoDB();

ddb.createTable(createTwitterTableInput, (err, data) => {
  if (err) {
    console.info("Unable to create table.");
    console.error(err);
  } else {
    console.info("Create table.");
  }
});
