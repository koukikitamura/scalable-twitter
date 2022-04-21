import { ITweetRepository } from "@src/domain/repository";
import { dateToUnixTime, unixTimeToDate } from "@src/domain/time";
import { Tweet } from "@src/domain/tweet";
import { logger } from "@src/logger";
import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { config } from "@src/config";

const maxBatchWriteItemCount = 25;

export class TweetRepository implements ITweetRepository {
  async create(entity: Tweet): Promise<void> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const tweetPutParams: DocumentClient.PutItemInput = {
      TableName: config.DatabaseTableName,
      Item: {
        ID: entity.userId,
        DataType: `tweet#${entity.id}`,
        DataValue: entity.id.toString(),
        TweetContent: entity.content,
        TweetPostDate: dateToUnixTime(entity.postDate),
      },
    };

    await ddb.put(tweetPutParams).promise();
    logger.debug(`PutItem: ${JSON.stringify(tweetPutParams)}`);

    // Insert a tweet in your and your followers's timeline
    const followerUserIds = await this.getFollowerUserIds(entity.userId);
    const timelineUserIds = [entity.userId, ...followerUserIds];
    for (
      let i = 0;
      i <= timelineUserIds.length - 1;
      i += maxBatchWriteItemCount
    ) {
      const ids = timelineUserIds.slice(i, maxBatchWriteItemCount);

      if (ids.length > 0) {
        const params: DocumentClient.BatchWriteItemInput = {
          RequestItems: {
            twitter: ids.map((i) => ({
              PutRequest: {
                Item: {
                  ID: i,
                  DataType: `timeline#${entity.id}`,
                  DataValue: entity.id.toString(),
                  TweetContent: entity.content,
                  TweetPostDate: dateToUnixTime(entity.postDate),
                },
              },
            })),
          },
        };

        await ddb.batchWrite(params).promise();
        logger.debug(`BatchWrite: ${JSON.stringify(params)}`);
      }
    }
  }

  async findById(tweetId: number): Promise<Tweet | null> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      IndexName: "DataValue-index",
      KeyConditionExpression: "DataValue=:tweetId AND DataType=:datatype",
      ExpressionAttributeValues: {
        ":tweetId": tweetId.toString(),
        ":datatype": `tweet#${tweetId}`,
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    const item = result.Items ? result.Items[0] : null;
    if (!item) {
      return null;
    } else {
      return this.itemToTweet(item);
    }
  }

  async findAllByUserId(userId: number): Promise<Tweet[]> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      KeyConditionExpression:
        "ID=:id AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":id": userId,
        ":datatypePrefix": "tweet",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    if (result.Items) {
      return result.Items.map((i) => this.itemToTweet(i));
    } else {
      return [];
    }
  }

  async getTimeline(userId: number): Promise<Tweet[]> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      KeyConditionExpression:
        "ID=:id AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":id": userId,
        ":datatypePrefix": "timeline",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    if (result.Items) {
      return result.Items.map(
        (i) =>
          new Tweet(
            parseInt(i["DataValue"]),
            i["ID"],
            i["TweetContent"],
            unixTimeToDate(i["TweetPostDate"])
          )
      );
    } else {
      return [];
    }
  }

  private getFollowerUserIds = async (userId: number): Promise<number[]> => {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      KeyConditionExpression:
        "ID=:id AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":id": userId,
        ":datatypePrefix": "follower",
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}`);

    if (result.Items) {
      return result.Items.map((i) => parseInt(i["DataValue"]));
    } else {
      return [];
    }
  };

  private itemToTweet = (item: DocumentClient.AttributeMap): Tweet => {
    return new Tweet(
      parseInt(item["DataValue"]),
      item["ID"],
      item["TweetContent"],
      unixTimeToDate(item["TweetPostDate"])
    );
  };
}
