FROM keymetrics/pm2:latest
COPY app /home/node
WORKDIR /home/node
RUN npm install
CMD [ "pm2-runtime", "start", "index.js" ]