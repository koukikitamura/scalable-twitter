import { Comment } from "@src/domain/comment";
import { Follow } from "@src/domain/follow";
import { Tweet } from "@src/domain/tweet";
import { User } from "@src/domain/user";

export interface IUserRepository {
  create(entity: User): Promise<void>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
}

export interface IFollowRepository {
  create(entity: Follow): Promise<void>;
  delete(entity: Follow): Promise<void>;
  countFollowee(userId: number): Promise<number>;
  countFollower(userId: number): Promise<number>;
}

export interface ITweetRepository {
  create(entity: Tweet): Promise<void>;
  getTimeline(userId: number): Promise<Tweet[]>;
  findById(tweetId: number): Promise<Tweet | null>;
  findAllByUserId(userId: number): Promise<Tweet[]>;
}

export interface ICommentRepository {
  create(entity: Comment): Promise<void>;
  findAllByTweetId(tweetId: number): Promise<Comment[]>;
}
