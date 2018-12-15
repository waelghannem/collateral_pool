#!/bin/bash
#./$1 stop
pkill -SIGTERM $2
sleep 30s
process=`ps -A | grep hostmasternode`
echo $process
./$2 &
