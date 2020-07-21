#!/bin/bash

docker run -d \
-it \
  --name covidScrapper \
  --mount source=covidScrappedData,destination=/usr/src/app/covidScrapper \
  covidscrapper:1.0