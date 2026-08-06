ARG NODE_VERSION=node:lts-alpine3.22

# Builds the extension
FROM ${NODE_VERSION}

# Installing dependencies
WORKDIR /project/
COPY [ "./package.json", "./package-lock.json", "./" ]
RUN npm ci

# Copying source files
# 1000:1000 corresponds to user "node"
COPY --link --chown="1000:1000" [ "./", "./" ]

# Building extension
RUN \
    npm run build \
    && mv '/project/dist/' '/dist/' \
    && cd .. \
    && rm -rf '/project/' \
    && mv '/dist/' '/project/'

USER node
CMD [ "/project/content.bundle.js" ]
