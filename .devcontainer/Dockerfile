# [Choice] Ubuntu version (use ubuntu-22.04 or ubuntu-18.04 on local arm64/Apple Silicon): ubuntu-22.04, ubuntu-20.04, ubuntu-18.04
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04


RUN curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
ENV DOCKER_HOST=unix:///var/run/docker-host.sock

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true
