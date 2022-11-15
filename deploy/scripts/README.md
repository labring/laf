

## Create development environment on MacOS

1. Install multipass for create vm on MacOS

```bash
brew install --cask multipass
```


2. Create vm & install sealos in it

```bash
cd deploy/scripts
sh vm_run.sh
```
> Waiting for the cluster ready

3. Install laf core
  
```bash
multipass mount $(pwd)/.. laf-dev:/deploy/
multipass exec laf-dev -- sudo -u root sh /deploy/scripts/install-laf.sh 
```

4. Init laf resource

```base
multipass exec laf-dev -- sudo -u root kubectl apply -f /deploy/scripts/init-laf/
```
