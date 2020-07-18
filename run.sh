#!/bin/bash

docker run -d \
-it \
  --name covidScrapper \
  -v "$(pwd)"/target:/usr/src/app/covidScrapper \
  covidscrapper:1.0