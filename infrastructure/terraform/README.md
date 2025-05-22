#### Running Terraform

**Note**: Make sure that you're within this directory before getting started with the commands below.

1. Auth with GCP by running:
```
$ gcloud auth application-default login
```

2. If it's your first time running the terraform you will need to init to download the module code:
```
$ terraform init
```

3. Run plan to see the changes terraform will make:
```
$ terraform plan
```

4. Run apply if the changes look correct and terraform will prompt you to confirm the changes:
```
$ terraform apply
```

#### Using Kubectl (or other clients) to interact with the cluster

##### New cluster
1. Auth with GCP by running:
```
$ gcloud auth login
```

2. Set the project as the default:
```
$ gcloud config set project p5js-web-editor-project
```

3. Download the kubeconfig from gcloud by running the following command:
```
gcloud container clusters get-credentials p5-gke-cluster --zone us-east4
```

4. Run kubectl commands as normal:
```
$ kubectl get pods
```

##### Legacy cluster
1. Auth with GCP by running:
```
$ gcloud auth login
```

2. Set the project as the default:
```
$ gcloud config set project p5js-web-editor-project
```

3. Download the kubeconfig from gcloud by running the following command:
```
$ gcloud container clusters get-credentials p5js-web-editor-cluster --zone us-east1-c
```

4. Run kubectl commands as normal:
```
$ kubectl get pods
```
