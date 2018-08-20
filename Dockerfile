FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN apt-get update && apt-get install -y python-dev libldap2-dev libsasl2-dev libssl-dev

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

# COPY start-up script into known file location in container
COPY start.sh /start.sh

# EXPOSE port 8000 to allow communication to/from server
ARG published_port

EXPOSE $published_port

# CMD specifies the command to execute to start the server running
CMD ["/start.sh"]

