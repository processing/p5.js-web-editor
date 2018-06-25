# Use an official mongo runtime as a parent image
FROM mongo:3.4

# Expose the mongo port
EXPOSE 27017

# Copy the mongod.conf file to env
# COPY mongod.conf /env/

# Copy the entrypoint file as well
COPY ./docker-entrypoint.sh .

CMD ["/bin/bash", "docker-entrypoint.sh"]