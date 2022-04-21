import { IdGenerator } from "./id";
import { User } from "./user";

export class Follow {
  public id: number;
  public followee: User;
  public follower: User;

  constructor(id: number, followee: User, follower: User) {
    this.id = id;
    this.followee = followee;
    this.follower = follower;
  }
}

const followIdGenerator = new IdGenerator();

export const followUser = (followee: User, follower: User): Follow => {
  return new Follow(followIdGenerator.generate(), followee, follower);
};
