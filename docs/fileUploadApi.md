## **Running the file upload API on OSX, without Docker Desktop**

Instructions adapted from [this page](https://dhwaneetbhatt.com/blog/run-docker-without-docker-desktop-on-macos).

**1. Setup minikube**

```bash
# Install hyperkit and minikube
brew install hyperkit
brew install minikube

# Install Docker CLI
brew install docker
brew install docker-compose

# Start minikube
minikube start

# Save IP to a hostname
# This appends "<minikube cluster IP> docker.local" at the end of the /etc/hosts file
echo "`minikube ip` docker.local" | sudo tee -a /etc/hosts > /dev/null
```

**2. Tell the docker CLI to use minikube. This will need to be done in every terminal window where you want to use docker.**

```bash
eval $(minikube docker-env)
```

**3. Run a compose file as you normally would**

```bash
docker-compose up
```

## Notes:

**a. localhost**

- This solution doesn't expose the running containers on localhost, but on an endpoint called `docker.local` (or whatever was set in the /etc/hosts file).
- To access an endpoint, you'll need to use `http://docker.local:<port>/`

**b. mounting the local file system**

- Parts of the local file system might need to me mounted on the minikube cluster, for example if a `docker-compose` file mounts it as a volume.
- For example, to mount your user's home directory, do `minikube mount ${HOME}:${HOME}`
- **Warning** avoid mounting `/`, this would give the minikube VM access to the entire file system.
