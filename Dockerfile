ARG BASE_IMAGE=ubuntu:noble@sha256:d1e2e92c075e5ca139d51a140fff46f84315c0fdce203eab2807c7e495eff4f9

FROM ${BASE_IMAGE} AS base

COPY [ "./docker/apt.conf", "/etc/apt/" ]

FROM base AS nvm

RUN \
    apt-get update -qq \
    && apt-get install -yqq \
        binutils \
        ca-certificates \
        coreutils \
        curl \
        findutils \
        g++ \
        gcc \
        grep \
        libncurses5-dev \
        libncursesw5-dev \
        linux-headers-6.8.0-79-generic \
        make \
        openssl \
        python3 \
        util-linux \
    && apt-get clean -qq

# Installing NVM
# https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-in-docker
ENV NVM_DIR="/root/.nvm"
ARG NVM_VERSION="v0.40.4"
ARG NVM_HASH=sha256:4b7412c49960c7d31e8df72da90c1fb5b8cccb419ac99537b737028d497aba4f
ADD --checksum="${NVM_HASH}" --chmod="+x" [ \
    "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh", \
    "/tmp/" \
]
WORKDIR "${NVM_DIR}"
RUN \
    '/tmp/install.sh' \
    && rm '/tmp/install.sh'

# Installing Node.js and NPM
# Projected EOL of v24: Oct 2028
# https://nodejs.org/en/download/releases
SHELL [ "bash", "-c" ]
ENV NODE_VERSION="24"
ARG USER="1000:1000"
RUN \
    source "${NVM_DIR}/nvm.sh" \
    && nvm install "${NODE_VERSION}" \
    && nvm use "${NODE_VERSION}" \
    && apt-get remove -yqq \
        curl \
        python3 \
    && apt-get clean -qq \
    && chown -R "${USER}" "${NVM_DIR}/.."

WORKDIR /home/node/
ENTRYPOINT [ "bash", "-c", "source \"${NVM_DIR}/nvm.sh\" && exec \"$@\"", "--" ]
CMD [ "tail", "-f", "/dev/null" ]

FROM nvm AS webpack

# Installing dependencies
WORKDIR /home/node/src
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN \
    source "${NVM_DIR}/nvm.sh" \
    && npm i

# Copying source files
COPY --link --chown="${USER}" [ "./", "./" ]

# Running CI
USER "${USER}"
CMD [ "npm", "run", "webpack" ]
