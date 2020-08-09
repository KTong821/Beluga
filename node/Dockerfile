FROM nikolaik/python-nodejs:python3.7-nodejs12

WORKDIR /app

COPY . .
RUN npm install --loglevel error
RUN mkdir logs
RUN chmod 111 ./start.sh

CMD ["bash", "start.sh"]