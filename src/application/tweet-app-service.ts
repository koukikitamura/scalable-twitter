import { postTweet } from "@src/domain/tweet";
import { logger } from "@src/logger";
import { ITweetRepository, IUserRepository } from "@src/domain/repository";
import { serializeTweet } from "./serializer";

export class TweetAppService {
  constructor(
    private userRepository: IUserRepository,
    private tweetRepository: ITweetRepository
  ) {}

  async post(userId: number, content: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      logger.debug("User is not found");
      return null;
    }

    const tweet = postTweet(user, content);
    if (tweet.isInValid()) {
      return null;
    }

    await this.tweetRepository.create(tweet);
    return serializeTweet(tweet);
  }

  async getAll(userId: number) {
    const tweets = await this.tweetRepository.findAllByUserId(userId);

    return tweets.map((t) => serializeTweet(t));
  }

  async getOne(tweetId: number) {
    const tweet = await this.tweetRepository.findById(tweetId);

    if (!tweet) {
      return tweet;
    }

    return serializeTweet(tweet);
  }

  async getTimeline(userId: number) {
    const tweets = await this.tweetRepository.getTimeline(userId);

    return tweets.map((t) => serializeTweet(t));
  }
}
