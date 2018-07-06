
Install and Run
===============
Before installing Vizier DB Web UI, you should install VizierDB - Web API. The Web API is the backend that provides the API that is used by the Vizier DB Web UI.

Install VizierDB - Web API
-----------------
Installation is still a bit labor intensive. The following steps seem to work for now (requires [Anaconda](https://conda.io/docs/user-guide/install/index.html)). If you want to use Mimir modules within your curation workflows a local installation of Mimir v0.2 is required. Refer to this [guide for Mimir installation details](https://github.com/VizierDB/Vistrails/tree/MimirPackage/vistrails/packages/mimir).

Python Environment
~~~~~~~~~~~~~~

To setup the Python environment clone the repository and run the following commands:

>>> git clone https://github.com/VizierDB/web-api.git
>>> cd web-api
>>> conda env create -f environment.yml
>>> source activate vizier
>>> pip install git+https://github.com/VizierDB/Vistrails.git
>>> pip install -e .

As an alternative the following sequence of steps might also work (e.g., for MacOS):

>>> git clone https://github.com/VizierDB/web-api.git
>>> cd web-api
>>> conda create --name vizier pip
>>> source activate vizier
>>> pip install -r requirements.txt
>>> pip install -e .
>>> conda install pyqt=4.11.4=py27_4

Configuration
~~~~~~~~~~~~~~
The web server is configured using a configuration file. There are two example configuration files in the (config directory)[https://github.com/VizierDB/web-api/tree/master/config] (depending on whether including Mimir ```config-mimir.yaml``` or not ```config-default.yaml```).
The configuration paramaters are:

**api**
- *server_url*: Url of the server (e.g., http://localhost)
- *server_port*: Server port (e.g., 5000)
- *app_path*: Application path for Web API (e.g., /vizier-db/api/v1)
- *app_base_url*: Concatenation of server_url, server_port and app_path
- *doc_url*: Url to API documentation

**fileserver**
- *directory*: Path to base directory for file server
- *max_file_size*: Maximum size for file uploads

**engines**
- *identifier*: Engine type (i.e., DEFAULT or MIMIR)
- *name*: Engine printable name
- *description*: Descriptive text for engine
- *datastore*:
  - directory: Base directory for data store

**viztrails**
 - *directory*: Base directory for storing viztrail information and meta data

*name*: Web Service name

*debug*: Flag indicating whether server is started in debug mode

*logs*: Path to log directory

When the Web server starts it first looks for the configuration file that is reference in the environment variable ```VIZIERSERVER_CONFIG```. If the variable is not set the server looks for a file ```config.yaml``` in the current working directory.

Note that there is a ```config.yaml``` file in the working directory of the server that can be used for development mode.

Run Server
~~~~~~~~~~~~~~
After adjusting the server configuration the server is run using the following command:

>>> cd vizier
>>> python server.py

Make sure that the conda environment has been activated using ```source activate vizier```.

If using Mimir the gateway server sould be started before running the web server.

API Documentation

For development it can be helpful to have a local copy of the API documentation. The [repository README](https://github.com/VizierDB/webapi-swagger-ui) contains information on how to install the UI locally.



Install VizierDB - Web UI
-----------------

Start by cloning the repository and switching to the app directory.

>>> git clone https://github.com/VizierDB/web-ui.git
>>> cd web-ui


Inside the app directory, you can run several commands:

**Install build dependencies**

>>> yarn install


**Start the development server**


>>> yarn start


**Bundles the app into static files for production**

>>> yarn build

**Additional Commands**

Starts the test runner.

>>> yarn test

Remove this tool and copies build dependencies, configuration files and scripts into the app directory. If you do this, you can’t go back!

>>> yarn eject


Configuration
~~~~~~~~~~~~~~
The UI app connects to the Web API server. The Url for the server is currently hard-coded in the file ```public/env.js```. Before running ```yarn start``` adjust the Url to point to a running Web API server. By default a local server running on port 5000 is used.
