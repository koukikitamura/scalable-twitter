import { IFollowRepository } from "@src/domain/repository";
import { Follow } from "@src/domain/follow";
import { dateToUnixTime } from "@src/domain/time";
import { logger } from "@src/logger";
import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { config } from "@src/config";

export class FollowRepository implements IFollowRepository {
  async create(entity: Follow): Promise<void> {
    const ddb = new AWS.DynamoDB.DocumentClient();
    const followee = entity.followee;
    const follower = entity.follower;

    const followeePutItem = {
      ID: follower.id,
      DataType: `followee#${entity.id}`,
      DataValue: followee.id.toString(),
      Username: followee.username,
      AvatarURL: followee.avatarURL,
      Introduction: followee.introduction,
      RegisterDate: dateToUnixTime(followee.registerDate),
    };

    const followerPutItem = {
      ID: followee.id,
      DataType: `follower#${entity.id}`,
      DataValue: follower.id.toString(),
      Username: follower.username,
      AvatarURL: follower.avatarURL,
      Introduction: follower.introduction,
      RegisterDate: dateToUnixTime(follower.registerDate),
    };

    const params: DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [config.DatabaseTableName]: [
          {
            PutRequest: {
              Item: followeePutItem,
            },
          },
          {
            PutRequest: {
              Item: followerPutItem,
            },
          },
        ],
      },
    };

    await ddb.batchWrite(params).promise();
    logger.debug(`BatchWrite: ${JSON.stringify(params)}`);
  }

  async delete(entity: Follow): Promise<void> {
    const ddb = new AWS.DynamoDB.DocumentClient();
    const followee = entity.followee;
    const follower = entity.follower;

    const params: DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [config.DatabaseTableName]: [
          {
            DeleteRequest: {
              Key: {
                ID: follower.id,
                DataType: `followee#${entity.id}`,
              },
            },
          },
          {
            DeleteRequest: {
              Key: {
                ID: followee.id,
                DataType: `follower#${entity.id}`,
              },
            },
          },
        ],
      },
    };

    await ddb.batchWrite(params).promise();
    logger.debug(`BatchWrite: ${JSON.stringify(params)}`);
  }

  async countFollowee(userId: number): Promise<number> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      Select: "COUNT",
      KeyConditionExpression:
        "ID=:id AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":id": userId,
        ":datatypePrefix": "followee",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    return result.Count || 0;
  }

  async countFollower(userId: number): Promise<number> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      Select: "COUNT",
      KeyConditionExpression:
        "ID=:id AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":id": userId,
        ":datatypePrefix": "follower",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    return result.Count || 0;
  }
}
