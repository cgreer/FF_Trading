#!/bin/bash

gawk '$5>4 && $6>4' $1 | sort -k 7,7nr
