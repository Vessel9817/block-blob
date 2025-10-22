FROM node:lts-alpine3.22

# Installing dependencies
WORKDIR /usr/app/src
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm i

# Copying source files
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./", "./" ]

# Running CI
USER node
CMD [ "npm", "run", "webpack" ]
