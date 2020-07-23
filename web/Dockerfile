FROM node:alpine

# Env
ENV NODE_ENV=production

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json file to work directory
COPY package.json .
RUN npm install

# Copy all other source code to work directory
ADD . /app
# Next
RUN npm run build

CMD ["npm", "run", "start"]