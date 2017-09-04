FROM node:6.11.2

ENV APP_HOME=/opt/node/app \
    TERM=xterm

# Copy in the project files and set as working directory
ADD . $APP_HOME
WORKDIR $APP_HOME

# Install node modules
RUN git submodule init && \
    yarn install

# For development, mark the directory as a mount override point
VOLUME $APP_HOME

# Expose default server port
EXPOSE 8000
