provider "google" {
  project = var.project
  region  = var.region
}

resource "google_container_cluster" "primary" {
  name               = "p5-gke-cluster"
  location           = var.region
  network            = google_compute_network.p5.name
  subnetwork         = google_compute_subnetwork.p5.name
  min_master_version = var.gke_version

  release_channel {
    channel = "UNSPECIFIED"
  }

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary" {
  name       = "primary-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  version    = var.gke_version
  node_count = 3

  node_config {
    disk_size_gb = 100
    machine_type = "n1-standard-1"
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 10
  }

  management {
    auto_repair  = true
    auto_upgrade = false
  }
}
