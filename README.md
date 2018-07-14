# targetprocess-authorization

[![Build Status](https://travis-ci.org/go-on-blog/targetprocess-authorization.svg?branch=master)](https://travis-ci.org/go-on-blog/targetprocess-authorization)
[![Coverage](https://codecov.io/gh/go-on-blog/targetprocess-authorization/branch/master/graph/badge.svg)](https://codecov.io/gh/go-on-blog/targetprocess-authorization)
[![Known Vulnerabilities](https://snyk.io/test/github/go-on-blog/targetprocess-authorization/badge.svg?targetFile=package.json)](https://snyk.io/test/github/go-on-blog/targetprocess-authorization?targetFile=package.json)

## Installation and Usage

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.0.0), npm version 3+.

There are two ways to install: globally and locally.

### Local Installation and Usage

```
$ npm install targetprocess-authorization
```

You should then run any of the tools provided like this:

```
$ ./node_modules/.bin/authorization-show ...
```

### Global Installation and Usage

If you want targetprocess-authorization to be available globally, do so using npm:

```
$ npm install -g targetprocess-authorization
```

You should then run any of the tools provided like this:

```
$ authorization-show ...
```

### Command Line Tools

* `authorization-show` shows under which role a user is assigned to a project.
* `authorization-assign` assigns a user to a project with the specified role.
* `authorization-unassign` unassigns a user from a project.

If you want more details about one of these tools, use the `help` option. For instance:

```bash
$ authorization-show --help
```

### How To

* Show under which role a user is assigned to a project, knowing their ids.
  ```bash
  $ authorization-show -d mycompany.tpondemand.com -t <token> -p 123 -u 456
  ```

* Show under which role a user is assigned to a project.  
  You may use the name instead of the id (last name for users).
  ```bash
  $ authorization-show -d mycompany.tpondemand.com -t <token> -p "Indiana Jones" -u Spielberg
  ```

* Show the list of all users assigned to one particular project
  ```bash
  $ authorization-show -d mycompany.tpondemand.com -t <token> -p "Indiana Jones"
  ```

* Assign all active users to one particular project with the specified role.  
  (If you don't specify the user, the project is assigned to all active users.)
  ```bash
  $ authorization-assign -d mycompany.tpondemand.com -t <token> -p "Indiana Jones" -r actor
  ```

* Assign all active users to one particular project with their default role.  
  (If you don't specify the role, the default role of the user is used.)
  ```bash
  $ authorization-assign -d mycompany.tpondemand.com -t <token> -p "Indiana Jones"
  ```

* Assign a user to all active projects with the specified role.  
  (If you don't specify the project, the user is assigned to all active projects.)
  ```bash
  $ authorization-assign -d mycompany.tpondemand.com -t <token> -u Spielberg -r director
  ```
