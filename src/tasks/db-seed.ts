import { UserAppService } from "@src/application/user-app-service";
import { UserRepository } from "@src/infrastructure/user-repository";
import { FollowAppService } from "@src/application/follow-app-service";
import { FollowRepository } from "@src/infrastructure/follow-repository";
import { initAWS } from "@src/infrastructure/aws";
import { TweetAppService } from "@src/application/tweet-app-service";
import { TweetRepository } from "@src/infrastructure/tweet-repository";

initAWS();

const run = async () => {
  const userAppService = new UserAppService(
    new UserRepository(),
    new FollowRepository()
  );

  const user1 = (await userAppService.register(
    "user1",
    "https://www.w3schools.com/howto/img_avatar.png",
    "I'm engineer"
  ))!;

  const user2 = (await userAppService.register(
    "user2",
    "https://www.w3schools.com/howto/img_avatar.png",
    "I'm sales"
  ))!;

  const user3 = (await userAppService.register(
    "user3",
    "https://www.w3schools.com/howto/img_avatar.png",
    "I'm marketer"
  ))!;

  const user4 = (await userAppService.register(
    "user4",
    "https://www.w3schools.com/howto/img_avatar.png",
    "I'm director"
  ))!;
  const user5 = (await userAppService.register(
    "user5",
    "https://www.w3schools.com/howto/img_avatar.png",
    "I'm product manager"
  ))!;

  const followAppService = new FollowAppService(
    new UserRepository(),
    new FollowRepository()
  );

  await followAppService.follow(user1.id, user2.id);
  await followAppService.follow(user1.id, user3.id);
  await followAppService.follow(user1.id, user4.id);
  await followAppService.follow(user5.id, user1.id);

  const tweetAppService = new TweetAppService(
    new UserRepository(),
    new TweetRepository()
  );

  [user1, user2, user3, user4].map(async (u) => {
    await tweetAppService.post(u.id, `Hi, I'm ${u.username}`);
  });
  [user1, user2, user3, user4].map(async (u) => {
    await tweetAppService.post(u.id, "What are you doing?");
  });
};

run();
