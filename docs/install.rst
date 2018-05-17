
Install and Run
===============


You can install the system from source.

Local development
-----------------

Start by cloning the repository and switching to the app directory.

>>> git clone https://github.com/VizierDB/web-ui.git
>>> cd web-ui


Inside the app directory, you can run several commands:

Install build dependencies
~~~~~~~~~~~~~~


>>> yarn install


Start the development server
~~~~~~~~~~~~~~


>>> yarn start


Bundles the app into static files for production
~~~~~~~~~~~~~~

>>> yarn build


Additional Commands
~~~~~~~~~~~~~~

Starts the test runner.

>>> yarn test

Remove this tool and copies build dependencies, configuration files and scripts into the app directory. If you do this, you can’t go back!

>>> yarn eject


Configuration
--------------
The UI app connects to the Web API server. The Url for the server is currently hard-coded in the file ```public/env.js```. Before running ```yarn start``` adjust the Url to point to a running Web API server. By default a local server running on port 5000 is used.
