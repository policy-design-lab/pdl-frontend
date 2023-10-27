# ----------------------------------------------------------------------
# Build application using node
# ----------------------------------------------------------------------
FROM node:14.5.0-alpine AS builder
WORKDIR /usr/src/app
ARG REACT_APP_ENV=""
ENV REACT_APP_ENV=${REACT_APP_ENV}

COPY package.json package-lock.json /usr/src/app/

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY .eslintrc *.js tsconfig.json typedoc.json babel.config.json jest.config.js ./
COPY src ./src/

RUN DISABLE_ESLINT_PLUGIN=true npm run build

# ----------------------------------------------------------------------
# Include nginx web server and host the build
# ----------------------------------------------------------------------
FROM nginx:1.19.1-alpine
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
