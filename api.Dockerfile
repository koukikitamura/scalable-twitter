FROM node:16.14

WORKDIR /app

ENTRYPOINT [ "./api.entrypoint.sh" ]
