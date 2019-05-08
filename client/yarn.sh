#!/bin/bash

# Simple proxy script to execute yarn commands in the development docker image.
sudo docker-compose exec client yarn $@
