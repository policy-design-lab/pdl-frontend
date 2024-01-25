# ----------------------------------------------------------------------
# Build application using node
# ----------------------------------------------------------------------
FROM node:18.16.0 AS builder
WORKDIR /usr/src/app
ARG REACT_APP_ENV=""
ENV REACT_APP_ENV=${REACT_APP_ENV}

# Set the NODE_OPTIONS for node>=17
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Install libvips dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Download and install libvips
RUN wget https://github.com/libvips/libvips/releases/download/v8.11.1/vips-8.11.1.tar.gz \
    && tar xf vips-8.11.1.tar.gz \
    && cd vips-8.11.1 \
    && ./configure \
    && make \
    && make install \
    && ldconfig \
    && cd .. \
    && rm -rf vips-8.11.1 vips-8.11.1.tar.gz

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
CMD ["node", "./scripts/geofilter.mjs"]
