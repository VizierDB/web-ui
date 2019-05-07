
Install and Run
===============

Use Docker Images
------------------

Install docker if it is not already: (install docker)[https://docs.docker.com/install/linux/docker-ce/debian/]

To run an instance of VizierDB using docker save the following script as run-containers.sh and make it executable:

.. code-block:: bash

	#create network
	sudo docker network create spark-net

	#run the containers
	#spark-master
	MASTER_HOSTNAME="namenode"
	MASTER_CONTAINER=`sudo docker run -d -v spark-data:/tmp --name $MASTER_HOSTNAME -h $MASTER_HOSTNAME --network spark-net -p 222:22 -p 4040:4040 -p 6066:6066 -p 7077:7077 \
	-p 8020:8020 -p 8080:8080 -p 50070:50070 --expose 7001 --expose 7002 --expose 7003 --expose 7004 --expose 7005 --expose 7006 --expose 7077 --expose 6066 --expose 4040 \
	--expose 8020 --expose 50070 -e "MASTER=spark://namenode:7077" -e "SPARK_CONF_DIR=/conf" -e "SPARK_PUBLIC_DNS=127.0.0.1" -e "LD_LIBRARY_PATH=/usr/local/hadoop/lib/native/" \
	-e "SPARK_EXECUTOR_MEMORY=8g" -e "SPARK_DAEMON_MEMORY=8g" -e "SPARK_DRIVER_MEMORY=8g" -e "SPARK_WORKER_MEMORY=8g" -e "HDFS_CONF_dfs_client_use_datanode_hostname=true" \
	-e "AWS_ECS=false" docker.mimirdb.info/spark-hadoop /usr/local/spark-2.4.0-bin-without-hadoop/master.sh`
	echo "master container id: $MASTER_CONTAINER"
	#wait for master to be ready
	sleep 5

	#spark-workers
	START_PORT=7001
	END_PORT=7006 
	WORKER_PORT=8882 
	DATANODE_PORT=50010
	#for additional spark workers increment the count below
	SPARK_WORKERS_COUNT=2
	i="0"
	while [ $i -lt $SPARK_WORKERS_COUNT ]
	do
		WORKER_WEBUI_PORT=$[$WORKER_WEBUI_PORT+$i]
		DATANODE_HOSTNAME="datanode$i"
		sudo docker run -d -v spark-data:/tmp -h $DATANODE_HOSTNAME --name $DATANODE_HOSTNAME --network spark-net --link $MASTER_CONTAINER -p $WORKER_WEBUI_PORT:8082 \
		--expose $WORKER_PORT --expose $DATANODE_PORT -e "SPARK_CONF_DIR=/conf" -e "SPARK_PUBLIC_DNS=127.0.0.1" -e "SPARK_WORKER_CORES=4" -e "SPARK_WORKER_PORT=$WORKER_PORT" \
		-e "SPARK_WORKER_WEBUI_PORT=$WORKER_WEBUI_PORT" -e "LD_LIBRARY_PATH=/usr/local/hadoop/lib/native/" -e "HDFS_DATA_HOST=$DATANODE_HOSTNAME" -e "HDFS_HOST=$MASTER_HOSTNAME" \
		-e "HDFS_CONF_dfs_datanode_address=0.0.0.0:$DATANODE_PORT" -e "SPARK_EXECUTOR_MEMORY=8g" -e "SPARK_DAEMON_MEMORY=8g" -e "SPARK_DRIVER_MEMORY=8g" -e "SPARK_WORKER_MEMORY=8g" \
		-e "HDFS_CONF_dfs_client_use_datanode_hostname=true" -e "AWS_ECS=false" docker.mimirdb.info/spark-hadoop /usr/local/spark-2.4.0-bin-without-hadoop/worker.sh
		i=$[$i+1]
	done

	VIZIER_DOMAIN="vizier.dev"

	S3_AWS_ACCESS_KEY_ID="your_aws_access_key_id"
	S3_AWS_SECRET_ACCESS_KEY="your_aws_secret"
	S3_BUCKET_NAME="your_bucket_name"
	VIZIER_DATA_VOLUME="vizier-data"

	#mimir
	#to use an s3 bucket as the data directory for mimir instead of a volume use this:
	#sudo docker run -d -v mimir-data:/tmp/data/mimir -p 9002:9001 --expose 4041 --expose 33388 --network spark-net -h vizier-mimir --name vizier-mimir -e MIMIR_HOST="vizier-mimir" \
	#-e SPARK_HOST=$MASTER_HOSTNAME -e RESTORE_BACKUP=false -e PULL_MIMIR=false -e AWS_ACCESS_KEY_ID=$S3_AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$S3_AWS_SECRET_ACCESS_KEY \
	#-e S3_BUCKET_NAME="$S3_BUCKET_NAME" -e MIMIR_DATA_DIR="/tmp/data/mimir" --privileged --device /dev/fuse docker.mimirdb.info/vizier-mimir-spark
	#to use a local bind mount for the data directory instead of an s3 bucket use the following for mimir instead of the above:
	sudo docker run -d -v $VIZIER_DATA_VOLUME:/usr/local/source/web-api/.vizierdb -p 9002:9001 --expose 4041 --expose 33388 --network spark-net -h vizier-mimir --name vizier-mimir \
	-e USE_S3_VOLUME=false -e MIMIR_HOST="vizier-mimir" -e SPARK_HOST=$MASTER_HOSTNAME -e RESTORE_BACKUP=false -e PULL_MIMIR=false -e AWS_ACCESS_KEY_ID=$S3_AWS_ACCESS_KEY_ID \
	-e AWS_SECRET_ACCESS_KEY=$S3_AWS_SECRET_ACCESS_KEY -e S3_BUCKET_NAME="$S3_BUCKET_NAME" docker.mimirdb.info/vizier-mimir-spark

	#api
	#to use an s3 bucket as the data directory for the api instead of a volume use this:
	#sudo docker run -d -p 9003:9001 --expose 80 --network spark-net -h vizier-api --name vizier-api -e MIMIR_HOST="vizier-mimir" -e APP_PATH="" -e API_SERVER=api.$VIZIER_DOMAIN \
	#-e API_LOCAL_PORT=80 -e API_PORT=443 -e API_SCHEME=https -e AWS_ACCESS_KEY_ID=$S3_AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$S3_AWS_SECRET_ACCESS_KEY \
	#-e S3_BUCKET_NAME="$S3_BUCKET_NAME" --privileged --device /dev/fuse docker.mimirdb.info/vizier-api-spark
	#to use a local volume for the data directory instead of an s3 bucket use the following for api instead of the above:
	sudo docker run -d -v $VIZIER_DATA_VOLUME:/usr/local/source/web-api/.vizierdb -p 9003:9001 --expose 80 --network spark-net -h vizier-api --name vizier-api \
	-e USE_S3_VOLUME=false -e MIMIR_HOST="vizier-mimir" -e MIMIR_URL="http://vizier-mimir:8089/api/v2/" -e APP_PATH="/api" -e API_SERVER=demo.$VIZIER_DOMAIN \
	-e API_LOCAL_PORT=80 -e API_PORT=443 -e API_SCHEME=https -e AWS_ACCESS_KEY_ID=$S3_AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$S3_AWS_SECRET_ACCESS_KEY \
	-e S3_BUCKET_NAME="$S3_BUCKET_NAME" docker.mimirdb.info/vizier-api-spark

	#ui
	sudo docker run -d -e API_SERVER=demo.$VIZIER_DOMAIN -e APP_PATH="/api" -e API_PORT=443 -e API_SCHEME=https \
	--expose 80 --expose 443 -p 9004:9001 -h vizier-ui --name vizier-ui --network spark-net docker.mimirdb.info/vizier-ui

	#proxy
	sudo docker run -d -p 80:80 -p 443:443 -p 9001:9001 -h vizier-proxy --name vizier-proxy --network spark-net -e VIZIER_CONFIG="vizier_k8s.conf" \
	-e VIZIER_API_APP_PATH="/api/" -e VIZIER_DOMAIN="$VIZIER_DOMAIN" docker.mimirdb.info/vizier-proxy

 
- update the VIZIER_DOMAIN variable for the vizier-proxy deployment to the domain you will use to access Vizier.  You can use a real domain and DNS entries or the hosts file of a client.  (Line 35)
- update the name or host paths for the volumes if you would like them somewhere other than the default (Line 40)
- update the s3-credentials and bucket name with your S3 access key id, secret, and bucket name: (Line 37, 38 39)
  
Run the script

>>> ./run-containers.sh

The IP address of the vizier-proxy service for a local docker deployment will likely be 127.0.0.1 
After you have the IP of the vizier-proxy service you need to add the following entries to either DNS for a real domain or the hosts file of the client: so where vizier-proxy=127.0.0.1 and VIZIER_DOMAIN=vizier.dev

.. code-block:: console

	127.0.0.1 demo.vizier.dev
	127.0.0.1 api.vizier.dev


Now you should be able to access the Vizier UI from a web browser.

.. code-block:: console

	https://demo.<VIZIER_DOMAIN>/vizier-db



Install Manually
-----------------

Before installing Vizier DB Web UI, you should install VizierDB - Web API. The Web API is the backend that provides the API that is used by the Vizier DB Web UI.

Install VizierDB - Web API
-------------------
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
