terraform {
  required_version = ">= 1.6.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.49"
    }
  }
}

variable "do_token" {
  type      = string
  sensitive = true
}

variable "ssh_public_key_path" {
  type    = string
  default = "~/.ssh/id_ed25519.pub"
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_ssh_key" "final_project" {
  name       = "aknie-final-project"
  public_key = file(pathexpand(var.ssh_public_key_path))
}

resource "digitalocean_droplet" "k3s" {
  count    = 3
  name     = "aknie-final-k3s-${count.index + 1}"
  region   = "ams3"
  size     = "s-2vcpu-4gb"
  image    = "ubuntu-24-04-x64"
  ssh_keys = [digitalocean_ssh_key.final_project.fingerprint]
  tags     = ["devops-ii-final", "selfhosted-k3s"]
}

output "node_ips" {
  value = digitalocean_droplet.k3s[*].ipv4_address
}
