import { logger } from "@src/logger";
import { IdGenerator } from "./id";
import { IUserRepository } from "./repository";

export class User {
  public id: number;
  public username: string;
  public avatarURL: string;
  public introduction: string;
  public registerDate: Date;

  constructor(
    id: number,
    username: string,
    avatarURL: string,
    introduction: string,
    registerDate: Date
  ) {
    this.id = id;
    this.username = username;
    this.avatarURL = avatarURL;
    this.introduction = introduction;
    this.registerDate = registerDate;
  }

  public isInValid(): boolean {
    let invalid = false;

    if (this.username.length > 15) {
      logger.debug("username should be less than or equal to 15 characters");
      invalid = true;
    }

    if (this.introduction.length > 160) {
      logger.debug(
        "introduction should be less than or equal to 160 characters"
      );
      invalid = true;
    }

    return invalid;
  }
}

const userIdGenerator = new IdGenerator();

export const createUserAccount = (
  username: string,
  avatarURL: string,
  introduction: string
): User => {
  return new User(
    userIdGenerator.generate(),
    username,
    avatarURL,
    introduction,
    new Date()
  );
};

export const checkDuplication = async (
  userRepository: IUserRepository,
  user: User
) => {
  const duplicated = !!(await userRepository.findByUsername(user.username));

  return duplicated;
};
