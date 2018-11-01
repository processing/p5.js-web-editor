#!/bin/bash

set -e

docker-compose build --no-cache
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker tag $APP_IMAGE_NAME $DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_COMMIT
docker tag $APP_IMAGE_NAME $DOCKER_USERNAME/$DOCKER_REPOSITORY:latest
docker push $DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_COMMIT
docker push $DOCKER_USERNAME/$DOCKER_REPOSITORY:latest

echo $GCLOUD_SERVICE_KEY_PRD | base64 --decode -i > ${HOME}/gcloud-service-key.json
gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json

gcloud --quiet config set project $PROJECT_NAME_PRD
gcloud --quiet config set container/cluster $CLUSTER_NAME_PRD
gcloud --quiet config set compute/zone ${CLOUDSDK_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials $CLUSTER_NAME_PRD

kubectl config view
kubectl config current-context

kubectl set image deployment/${KUBE_DEPLOYMENT_NAME} ${KUBE_DEPLOYMENT_CONTAINER_NAME}=index.docker.io/$DOCKER_USERNAME/$DOCKER_REPOSITORY:$TRAVIS_COMMIT
