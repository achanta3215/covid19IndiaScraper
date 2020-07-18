FROM node:latest

RUN apt-get update && apt-get install -y cron logrotate gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget


ENV TASK_SCHEDULE='0 10 * * *'

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install

COPY ./templates/log-rotation /etc/logrotate.d/my-cron-job

COPY ./templates/crontab /tmp/crontab

RUN touch /etc/cron.d/my-cron-job
RUN chmod 0644 /etc/cron.d/my-cron-job
RUN touch /var/log/cron.log


COPY ./templates/setupCron.sh /tmp/setupCron.sh
RUN chmod +x /tmp/setupCron.sh

CMD ["/tmp/setupCron.sh"]
