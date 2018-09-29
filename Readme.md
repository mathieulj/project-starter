# Simple SPA web application template

## Development

### Requirements

- Linux workstation (preferably Debian or Ubuntu)
- ansible (Optional) to configure the initial environment
- Docker-ce
- Docker compose

### Getting started

The included ansible playbook will setup required dependencies. The database wont 
survive reboots be will refresh nice and fast for devellopement lifecycles.

To run the playbook:

    ansible-playbook -i 'dev,' -c local ansible-playbook.yml

### Starting the application in development

    sudo docker-compose build && sudo docker-compose up

## Production

The production configuration is not yet implemented but it should be painfully
obvious that the hardcoded passwords should be changed if you intend to
use any of this in a public setting.


