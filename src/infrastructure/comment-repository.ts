import { ICommentRepository } from "@src/domain/repository";
import { Comment } from "@src/domain/comment";
import { dateToUnixTime, unixTimeToDate } from "@src/domain/time";
import { logger } from "@src/logger";
import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { config } from "@src/config";
export class CommentRepository implements ICommentRepository {
  async create(entity: Comment): Promise<void> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.PutItemInput = {
      TableName: config.DatabaseTableName,
      Item: {
        ID: entity.userId,
        DataType: `comment#${entity.id}`,
        DataValue: entity.tweetId.toString(),
        commentId: entity.id,
        commentContent: entity.content,
        commentPostDate: dateToUnixTime(entity.postDate),
      },
    };

    await ddb.put(params).promise();
    logger.debug(`PutItem: ${JSON.stringify(params)}}`);
  }

  async findAllByTweetId(tweetId: number): Promise<Comment[]> {
    const ddb = new AWS.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: config.DatabaseTableName,
      IndexName: "DataValue-index",
      KeyConditionExpression:
        "DataValue=:tweetId AND begins_with(DataType, :datatypePrefix)",
      ExpressionAttributeValues: {
        ":tweetId": tweetId.toString(),
        ":datatypePrefix": `comment`,
      },
    };

    const result = await ddb.query(params).promise();
    logger.debug(`Query: ${JSON.stringify(params)}}`);

    if (result.Items) {
      return result.Items.map(
        (i) =>
          new Comment(
            i["CommentId"],
            i["ID"],
            parseInt(i["DataValue"]),
            i["commentContent"],
            unixTimeToDate(i["commentPostDate"])
          )
      );
    } else {
      return [];
    }
  }
}
