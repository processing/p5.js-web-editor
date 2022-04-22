terraform {
  backend "gcs" {
    bucket = "p5js-terraform-state"
    prefix = "terraform/state"
  }
}
