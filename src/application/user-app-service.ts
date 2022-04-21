import { IFollowRepository, IUserRepository } from "@src/domain/repository";
import { checkDuplication, createUserAccount } from "@src/domain/user";
import { logger } from "@src/logger";
import { serializeUser } from "./serializer";

export class UserAppService {
  constructor(
    private userRepository: IUserRepository,
    private followRepository: IFollowRepository
  ) {}

  async register(username: string, avatarURL: string, introduction: string) {
    const user = createUserAccount(username, avatarURL, introduction);

    if (user.isInValid()) {
      return null;
    }

    if (await checkDuplication(this.userRepository, user)) {
      logger.debug("User is duplicated");
      return null;
    }

    this.userRepository.create(user);

    return serializeUser(user);
  }

  async getUserProfile(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    const foloweeCount = await this.followRepository.countFollowee(user.id);
    const folowerCount = await this.followRepository.countFollower(user.id);

    return {
      ...serializeUser(user),
      foloweeCount,
      folowerCount,
    };
  }
}
