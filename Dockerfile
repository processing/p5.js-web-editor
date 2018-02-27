FROM node:8.9.0

ENV APP_HOME=/opt/node/app \
    TERM=xterm

# Copy in the project files and set as working directory
ADD . $APP_HOME
WORKDIR $APP_HOME

# Install node modules
RUN npm install

# Rebuild node-sass just to be safe
RUN npm rebuild node-sass

# For development, mark the directory as a mount override point
VOLUME $APP_HOME

# Expose default server port
EXPOSE 8000
