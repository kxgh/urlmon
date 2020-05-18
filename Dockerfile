ARG port=3000
FROM node:10

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE ${port}

CMD npm run start
