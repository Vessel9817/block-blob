ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

FROM ${NODE_VERSION} AS webpack

# Installing dependencies
WORKDIR /home/node/src
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm i

# Copying source files
# 1000:1000 corresponds to user "node"
COPY --link --chown="1000:1000" [ "./", "./" ]

# Running CI
CMD [ "npm", "run", "webpack" ]
