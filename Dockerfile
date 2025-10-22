ARG NODE_VERSION=node:lts-alpine3.22

FROM ${NODE_VERSION} AS webpack

# Installing dependencies
WORKDIR /home/node/src
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci

# Copying source files
# 1000:1000 corresponds to user "node"
COPY --link --chown="1000:1000" [ "./", "./" ]

# Running CI
CMD [ "npm", "run", "webpack" ]
