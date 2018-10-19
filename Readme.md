# Simple SPA web application template

## **Project state**
This is a work in progress and does not yet have all necessary parts implemented. Furthermore, this is a personal
endeavor pursued on my free time without sponsorship from my employer and as such is limited in velocity by what free
time I have available on nights and week-ends.

## Project structure
The server side API is rooted in the api directory and is organised by object hierarchy. In each object's directory,
a router will handle Koa routing and request sanitization (ensuring that the API is respected) before handing off to
the controller where the business logic should reside.

## User permissions model
Each user will have a set of permissions as to what they are allowed to access. The default dev user will have unlimited
access but subsequent users will have limited access by default.

The permissions document defines what the user can access. For each of the 2 operations with a payload (create, update),
the permissions document will contain a hash map of URL regex and their associated limits. For each of the 2 operations
without a payload (read, delete), the permissions document will contain an array of URL regex. If no regex matches the
requested URL, the request is denied. If a limit matches in the request body, the url match is ignored and the search
continues. As special case, the id of the user making the request can be substituted with `{{self}}` in these Regex.

### Example permission (complete access)

    {
        create : {
            // Allow creating any document
            '.*' : []
        },
        read : [
            // Allow reading any document
            '.*'
        ],
        update : {
            // Allow updating any document
            '.*' : []
        },
        delete : [
            // Allow deleting any document
            '.*'
        ]
    }

### Example permission (limited access)
    {
        create : {
            // Allow creation of users only with default permissions
            '^users$' : ['permissions']
        },
        read : [
            // Allow reading any document
            '.*'
        ],
        update : {
            // Allow self update except email or permissions changes
            '^users/{{self}}$' : ['email', 'permissions']
            // All other updates denied
        },
        delete : [
            // Allow self removal
            '^users/{{self}}$'
            // All other deletes denied
        ]
    }

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


