import * as AWS from "aws-sdk";

export const initAWS = () => {
  AWS.config.update({
    region: "ap-northeast-1",
    dynamodb: {
      apiVersion: "2012-08-10",
      endpoint: `http://dynamodb-local:8000`,
    },
  });
};
