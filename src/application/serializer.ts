import { Comment } from "@src/domain/comment";
import { Tweet } from "@src/domain/tweet";
import { User } from "@src/domain/user";

export const serializeUser = (entity: User) => {
  return {
    id: entity.id,
    username: entity.username,
    avatarURL: entity.avatarURL,
    introduction: entity.introduction,
    registerDate: entity.registerDate.toISOString(),
  };
};

export const serializeTweet = (entity: Tweet) => {
  return {
    id: entity.id,
    userId: entity.userId,
    content: entity.content,
    postDate: entity.postDate.toISOString(),
  };
};

export const serializeComment = (entity: Comment) => {
  return {
    id: entity.id,
    userId: entity.userId,
    tweetId: entity.tweetId,
    content: entity.content,
    postDate: entity.postDate,
  };
};
