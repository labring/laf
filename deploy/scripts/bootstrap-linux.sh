# setup k8s cluster
sudo sh install-k8s.sh

# setup laf core
sudo sh install-laf-core.sh

# apply laf cluster resources
sudo kubectl apply -f init-laf/