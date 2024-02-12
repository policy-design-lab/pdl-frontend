# ----------------------------------------------------------------------
# Build application using node
# ----------------------------------------------------------------------
# NOTE: node 18 original version would take one hour to build, but it can make the build successful.
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
ARG REACT_APP_ENV=""
ENV REACT_APP_ENV=${REACT_APP_ENV}

# test APP_ENV instead of REACT_APP_ENV
ARG APP_ENV=""
ENV APP_ENV=${APP_ENV}


# Set the NODE_OPTIONS for node>=17
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Copy only the necessary files and folders
COPY package.json package-lock.json ./
COPY .eslintrc *.js tsconfig.json typedoc.json babel.config.json jest.config.js ./
COPY assets ./assets/
COPY scripts ./scripts/
COPY src ./src/

RUN npm install
RUN npm run build

# ----------------------------------------------------------------------
# Include nginx web server and host the build
# ----------------------------------------------------------------------
FROM nginx:1.19.1

# Install Node.js in the final image
RUN apt-get update && apt-get install -y nodejs npm

# Set the working directory
WORKDIR /usr/share/nginx/html

# Copy the built files from the "builder" stage to the nginx container
COPY --from=builder /usr/src/app/build/ .

# Copy your nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Run the Node.js script
# CMD ["node", "./scripts/geofilter.mjs"]
