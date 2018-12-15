#!/bin/bash
sleep 30s
./$1 mnsync next
sleep 5s
./$1 mnsync next
sleep 5s
./$1 mnsync next
sleep 5s
./$1 mnsync next
sleep 5s
./$1 mnsync next
sleep 5s
./$1 masternode start-alias $2
