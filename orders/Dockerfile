FROM node:alpine

# Env
ENV NODE_ENV=production

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json file to work directory
COPY package.json .
RUN npm install --only=prod

# Copy all other source code to work directory
ADD . /app
# TypeScript
RUN npm run build

CMD [ "npm", "start" ]