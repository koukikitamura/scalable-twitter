import * as http from "http";
import { UserAppService } from "@src/application/user-app-service";
import { UserRepository } from "@src/infrastructure/user-repository";
import * as express from "express";
import * as morgan from "morgan";
import { logger } from "@src/logger";
import { FollowAppService } from "@src/application/follow-app-service";
import { FollowRepository } from "@src/infrastructure/follow-repository";
import { TweetAppService } from "@src/application/tweet-app-service";
import { TweetRepository } from "@src/infrastructure/tweet-repository";
import { CommentAppService } from "@src/application/comment-app-service";
import { CommentRepository } from "@src/infrastructure/comment-repository";

const pingRouter = express.Router();
pingRouter.get("/", (req, res) => {
  res.json({ status: "ok" });
});

const userRouter = express.Router();
userRouter.post("/register", async (req, res) => {
  const username: string = req.body.username;
  const avatarURL = req.body.avatarURL;
  const introduction = req.body.introduction;
  const userAppService = new UserAppService(
    new UserRepository(),
    new FollowRepository()
  );

  const user = await userAppService.register(username, avatarURL, introduction);
  if (!user) {
    res.status(400).json();
  } else {
    res.json(user);
  }
});

userRouter.get("/:username", async (req, res) => {
  const username = req.params.username;

  const userAppService = new UserAppService(
    new UserRepository(),
    new FollowRepository()
  );
  const profile = await userAppService.getUserProfile(username);

  if (profile) {
    res.json(profile);
  } else {
    res.status(404).json();
  }
});

const followRouter = express.Router();
followRouter.post("/", async (req, res) => {
  const followeeId = parseInt(req.body.followeeId);
  const followerId = parseInt(req.body.followerId);

  if (isNaN(followeeId)) {
    logger.debug("followeeId is NaN");
    res.status(400).json();
    return;
  }

  if (isNaN(followerId)) {
    logger.debug("followerId is NaN");
    res.status(400).json();
    return;
  }

  const followService = new FollowAppService(
    new UserRepository(),
    new FollowRepository()
  );

  const ok = await followService.follow(followeeId, followerId);

  if (ok) {
    res.status(200).json();
  } else {
    res.status(400).json();
  }
});
followRouter.delete("/", async (req, res) => {
  const followeeId = parseInt(req.body.followeeId);
  const followerId = parseInt(req.body.followerId);

  if (isNaN(followeeId)) {
    logger.debug("followeeId is NaN");
    res.status(400).json();
    return;
  }

  if (isNaN(followerId)) {
    logger.debug("followerId is NaN");
    res.status(400).json();
    return;
  }

  const followService = new FollowAppService(
    new UserRepository(),
    new FollowRepository()
  );

  const ok = await followService.unfollow(followeeId, followerId);
  if (ok) {
    res.status(200).json();
  } else {
    res.status(400).json();
  }
});

const tweetRouter = express.Router();
tweetRouter.post("/", async (req, res) => {
  const userId = parseInt(req.body.userId);
  const content = req.body.content;

  if (isNaN(userId)) {
    logger.debug("userId is NaN");
    res.status(400).json();
    return;
  }

  const tweetService = new TweetAppService(
    new UserRepository(),
    new TweetRepository()
  );

  const tweet = await tweetService.post(userId, content);

  if (tweet) {
    res.status(200).json(tweet);
  } else {
    res.status(400).json();
  }
});
tweetRouter.get("/timeline", async (req, res) => {
  const userId = parseInt(req.body.userId);

  if (isNaN(userId)) {
    logger.debug("userId is NaN");
    res.status(400).json();
    return;
  }

  const tweetService = new TweetAppService(
    new UserRepository(),
    new TweetRepository()
  );
  const tweets = await tweetService.getTimeline(userId);

  res.status(200).json(tweets);
});
tweetRouter.get("/:id", async (req, res) => {
  const tweetId = parseInt(req.params.id);

  if (isNaN(tweetId)) {
    logger.debug("Id is NaN");
    res.status(400).json();
    return;
  }
  const tweetService = new TweetAppService(
    new UserRepository(),
    new TweetRepository()
  );

  const tweet = await tweetService.getOne(tweetId);

  if (tweet) {
    res.status(200).json(tweet);
  } else {
    res.status(404).json();
  }
});
tweetRouter.get("/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    logger.debug("userId is NaN");
    res.status(400).json();
    return;
  }
  const tweetService = new TweetAppService(
    new UserRepository(),
    new TweetRepository()
  );

  const tweets = await tweetService.getAll(userId);

  res.status(200).json(tweets);
});

const commentRouter = express.Router();
commentRouter.post("/", async (req, res) => {
  const userId = parseInt(req.body.userId);
  const tweetId = parseInt(req.body.tweetId);
  const content = req.body.content;

  if (isNaN(userId)) {
    logger.debug("userId is NaN");
    res.status(400).json();
    return;
  }

  if (isNaN(tweetId)) {
    logger.debug("tweetId is NaN");
    res.status(400).json();
    return;
  }

  const commentService = new CommentAppService(
    new UserRepository(),
    new TweetRepository(),
    new CommentRepository()
  );

  const comment = await commentService.post(userId, tweetId, content);

  if (!comment) {
    res.status(400).json();
  } else {
    res.status(200).json(comment);
  }
});
commentRouter.get("/tweet/:tweetId", async (req, res) => {
  const tweetId = parseInt(req.params.tweetId);

  if (isNaN(tweetId)) {
    logger.debug("tweetId is NaN");
    res.status(400).json();
    return;
  }

  const commentService = new CommentAppService(
    new UserRepository(),
    new TweetRepository(),
    new CommentRepository()
  );

  const comments = await commentService.getAll(tweetId);

  res.status(200).json(comments);
});

export class ApiServer {
  private port: number;
  private server: http.Server;

  constructor(port?: number) {
    this.port = port || 7000;

    const app = express();
    app.use(express.json());
    app.use(morgan("combined"));

    app.use("/ping", pingRouter);
    app.use("/users", userRouter);
    app.use("/follow", followRouter);
    app.use("/tweets", tweetRouter);
    app.use("/comments", commentRouter);

    this.server = http.createServer(app);
    this.server.on("close", () => {});
  }

  start() {
    logger.info("Starting server...");
    this.server.listen(this.port);
    logger.info(`Listen port: ${this.port}`);
  }

  stop() {
    this.server.close();
  }
}
