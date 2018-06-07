FROM node:8.11.1 as base
ENV APP_HOME=/usr/src/app \
  TERM=xterm
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
EXPOSE 8000

FROM base as development
ENV NODE_ENV development
COPY package.json package-lock.json ./
RUN npm install
RUN npm rebuild node-sass
COPY .babelrc index.js nodemon.json webpack.config.babel.js webpack.config.dev.js webpack.config.prod.js webpack.config.server.js ./
COPY client ./client
COPY server ./server
CMD ["npm", "start"]

FROM development as build
ENV NODE_ENV production
RUN npm run build

FROM base as production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --production
RUN npm rebuild node-sass
RUN npm install pm2 -g
COPY index.js ./
COPY ecosystem.json ./
COPY --from=build /usr/src/app/dist ./dist
CMD ["pm2-runtime", "ecosystem.json"]
