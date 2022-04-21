import { logger } from "@src/logger";
import { IdGenerator } from "./id";
import { User } from "./user";

export class Tweet {
  public id: number;
  public userId: number;
  public content: string;
  public postDate: Date;

  constructor(id: number, userId: number, content: string, postDate: Date) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.postDate = postDate;
  }

  public isInValid() {
    let invalid = false;

    if (this.content.length > 140) {
      logger.debug("content should be less than or equal to 15 characters");
      invalid = true;
    }

    return invalid;
  }
}

const tweetIdGenerator = new IdGenerator();

export const postTweet = (user: User, content: string) => {
  return new Tweet(tweetIdGenerator.generate(), user.id, content, new Date());
};
