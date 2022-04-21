import { logger } from "@src/logger";
import { IdGenerator } from "./id";
import { Tweet } from "./tweet";
import { User } from "./user";

export class Comment {
  public id: number;
  public userId: number;
  public tweetId: number;
  public content: string;
  public postDate: Date;

  constructor(
    id: number,
    userId: number,
    tweetId: number,
    content: string,
    postDate: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.tweetId = tweetId;
    this.content = content;
    this.postDate = postDate;
  }

  public isInvalid() {
    let invalid = false;

    if (this.content.length > 140) {
      logger.debug("content should be less than or equal to 15 characters");
      invalid = true;
    }

    return invalid;
  }
}

const commentIdGenerator = new IdGenerator();

export const postComment = (user: User, tweet: Tweet, content: string) => {
  return new Comment(
    commentIdGenerator.generate(),
    user.id,
    tweet.id,
    content,
    new Date()
  );
};
