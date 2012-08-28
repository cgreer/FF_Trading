#!/bin/bash

for i in {1..10}; do phantomjs downloadplayerprojections.js ${i}; done > raw.scraped.txt
grep "SCRAPED" raw.scraped.txt | sed "s/SCRAPED://g" | sort | uniq > final.scraped.txt
