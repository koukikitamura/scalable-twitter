import { postComment } from "@src/domain/comment";
import { logger } from "@src/logger";
import {
  ICommentRepository,
  ITweetRepository,
  IUserRepository,
} from "@src/domain/repository";
import { serializeComment } from "./serializer";

export class CommentAppService {
  constructor(
    private userRepository: IUserRepository,
    private tweetRepository: ITweetRepository,
    private commentRepository: ICommentRepository
  ) {}

  async post(userId: number, tweetId: number, content: string) {
    const user = await this.userRepository.findById(userId);
    const tweet = await this.tweetRepository.findById(tweetId);
    if (!user) {
      logger.debug("User is not found");
      return null;
    }

    if (!tweet) {
      logger.debug("Tweet is not found");
      return null;
    }

    const comment = await postComment(user, tweet, content);
    if (comment.isInvalid()) {
      return null;
    }

    await this.commentRepository.create(comment);

    return serializeComment(comment);
  }

  async getAll(tweetId: number) {
    const comments = await this.commentRepository.findAllByTweetId(tweetId);

    return comments.map((c) => serializeComment(c));
  }
}
