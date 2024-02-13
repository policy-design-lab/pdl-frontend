# ----------------------------------------------------------------------
# Build application using node
# ----------------------------------------------------------------------
# NOTE: node 18 original version would take one hour to build, but it can make the build successful.
# FROM node:16.19.1 AS builder
FROM node:16-alpine3.18 AS builder
# Resolve node-sass python not found error by intall it separately, instead of using full version of node
RUN apk --no-cache add --virtual .builds-deps build-base python3 
WORKDIR /usr/src/app

ARG REACT_APP_ENV=""
# ENV REACT_APP_ENV=${REACT_APP_ENV} # comment out for debug
ENV REACT_APP_ENV="local"

# test APP_ENV instead of REACT_APP_ENV
ARG APP_ENV=""
# ENV APP_ENV=${APP_ENV} # comment out for debug
ENV APP_ENV="local"


# Copy only the necessary files and folders
COPY package.json package-lock.json /usr/src/app/

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY .eslintrc *.js tsconfig.json typedoc.json babel.config.json jest.config.js ./
COPY assets ./assets/
COPY scripts ./scripts/
COPY src ./src/


RUN npm run build

# ----------------------------------------------------------------------
# Include nginx web server and host the build
# ----------------------------------------------------------------------
FROM nginx:1.19.1-alpine
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Run the Node.js script
# CMD ["node", "./scripts/geofilter.mjs"]
