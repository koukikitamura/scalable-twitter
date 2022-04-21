import { followUser } from "@src/domain/follow";
import { logger } from "@src/logger";
import { IFollowRepository, IUserRepository } from "@src/domain/repository";

export class FollowAppService {
  constructor(
    private userRepository: IUserRepository,
    private followRepository: IFollowRepository
  ) {}

  async follow(followeeId: number, followerId: number): Promise<boolean> {
    const followee = await this.userRepository.findById(followeeId);
    const follower = await this.userRepository.findById(followerId);

    if (!followee) {
      logger.debug(`folowee is not found. foloweeId is ${followeeId}`);
      return false;
    }
    if (!follower) {
      logger.debug(`folower is not found. folowerId is ${followerId}`);
      return false;
    }

    const follow = followUser(followee, follower);
    await this.followRepository.create(follow);

    return true;
  }

  async unfollow(followeeId: number, followerId: number): Promise<boolean> {
    const followee = await this.userRepository.findById(followeeId);
    const follower = await this.userRepository.findById(followerId);

    if (!followee) {
      logger.debug(`folowee is not found. foloweeId is ${followeeId}`);
      return false;
    }
    if (!follower) {
      logger.debug(`folower is not found. folowerId is ${followerId}`);
      return false;
    }

    const follow = followUser(followee, follower);
    await this.followRepository.delete(follow);

    return true;
  }
}
