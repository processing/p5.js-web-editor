resource "google_compute_network" "p5" {
  name                    = "${var.project}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "p5" {
  name          = "${var.project}-subnet"
  network       = google_compute_network.p5.name
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
}

resource "google_compute_global_address" "production_p5_web_editor_ip" {
  name = "production-p5-web-editor-ip"
}

resource "google_compute_global_address" "production_p5_preview_editor_ip" {
  name = "production-p5-preview-editor-ip"
}

resource "google_compute_global_address" "staging_p5_web_editor_ip" {
  name = "staging-p5-web-editor-ip"
}

resource "google_compute_global_address" "staging_p5_preview_editor_ip" {
  name = "staging-p5-preview-editor-ip"
}
