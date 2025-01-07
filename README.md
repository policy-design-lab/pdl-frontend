## Repo

This repo is the front-end of the Policy Design Lab (https://policydesignlab.ncsa.illinois.edu). README is under development.

### Run Docker container locally for development

- In a terminal, `export APP_ENV=development` to point to development environment
- Build the image and pass in the build environment `docker build --no-cache --build-arg APP_ENV="${APP_ENV}" --progress=plain --tag pdl/pdl-frontend .`
- Run the container `docker run -p 3000:80 pdl/pdl-frontend:latest`
- Go to http://localhost:3000

### Upgrade node version

To upgrade the node version, following the steps below:
1. Run `rm -rf node_modules package-lock.json` to remove the old node modules.
2. If you use `nvm` as package manager, update the `.nvmrc` file with the new node version.
3. Make sure you do `nvm use` to use the new node version.
4. Run `npm install -g npm@latest` to update npm.
5. Run `npm install` to update the node modules.
6. Update the `Dockerfile` with the new node version by changing the `FROM` line.
7. Modify the `test.yaml` in the `.github/workflows` folder to use the new node version for lint checking. You don't need to update another file.
8. Test the application locally to make sure everything works fine.
9. Test the application using Docker to make sure everything works fine.

