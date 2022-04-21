import { IUserRepository } from "@src/domain/repository";
import { dateToUnixTime, unixTimeToDate } from "@src/domain/time";
import { User } from "@src/domain/user";
import { logger } from "@src/logger";
import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { config } from "@src/config";

export class UserRepository implements IUserRepository {
  async create(entity: User): Promise<void> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.PutItemInput = {
      TableName: config.DatabaseTableName,
      Item: {
        ID: entity.id,
        DataType: "userProfile",
        DataValue: entity.username,
        AvatarURL: entity.avatarURL,
        Introduction: entity.introduction,
        RegisterDate: dateToUnixTime(entity.registerDate),
      },
    };

    await ddb.put(params).promise();
    logger.debug(`PutItem: ${JSON.stringify(params)}`);
  }

  async findById(id: number): Promise<User | null> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.GetItemInput = {
      TableName: config.DatabaseTableName,
      Key: {
        ID: id,
        DataType: "userProfile",
      },
    };

    const result = await ddb.get(params).promise();
    logger.debug(`GetItem: ${JSON.stringify(params)}`);

    const item = result.Item;
    if (!item) {
      return null;
    }

    return this.itemToEntity(item);
  }

  async findByUsername(username: string): Promise<User | null> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      IndexName: "DataValue-index",
      KeyConditionExpression: "DataValue=:username AND DataType=:datatype",
      ExpressionAttributeValues: {
        ":username": username,
        ":datatype": "userProfile",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    const item = result.Items ? result.Items[0] : null;
    if (!item) {
      return null;
    }

    return this.itemToEntity(item);
  }

  private itemToEntity = (item: DocumentClient.AttributeMap): User => {
    return new User(
      item["ID"],
      item["DataValue"],
      item["AvatarURL"],
      item["Introduction"],
      unixTimeToDate(item["RegisterDate"])
    );
  };
}
