# Simple SPA web application template

## Project structure
The server side API is rooted in the api directory and is organised by object hierarchy. In each object's directory,
a router will handle Koa routing and request sanitization (ensuring that the API is respected) before handing off to
the controller where the business logic should reside.

## Development

### Requirements

- Linux workstation (preferably Debian or Ubuntu)
- ansible (Optional) to configure the initial environment
- Docker-ce
- Docker compose

### Getting started

The included ansible playbook will setup required dependencies. The database wont 
survive reboots be will refresh nice and fast for development life cycles.

To run the playbook:

    ansible-playbook -i 'dev,' -c local ansible-playbook.yml

### Starting the application in development

    sudo docker-compose build && sudo docker-compose up

## Production

The production configuration is not yet implemented but it should be painfully
obvious that the hardcoded passwords should be changed if you intend to
use any of this in a public setting.


