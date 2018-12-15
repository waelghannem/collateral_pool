#!/bin/bash
  sudo apt-get update
  sudo apt-get install -y nano htop git curl
  sudo apt-get install -y software-properties-common
  sudo apt-get install -y build-essential libtool autotools-dev pkg-config libssl-dev
  sudo apt-get install -y libboost-all-dev libzmq3-dev
  sudo apt-get install -y libevent-dev
  sudo apt-get install -y libminiupnpc-dev
  sudo apt-get install -y autoconf
  sudo apt-get install -y automake unzip
  sudo add-apt-repository  -y  ppa:bitcoin/bitcoin
  sudo apt-get update
  sudo apt-get -y update && sudo apt-get -y install build-essential libssl-dev libdb++-dev libboost-all-dev libcrypto++-dev libqrencode-dev libminiupnpc-dev libgmp-dev libgmp3-dev autoconf autogen automake libtool
  apt-get install libdb4.8-dev -y
  apt-get install libdb4.8++-dev -y
  apt-get install libminiupnpc-dev -y
  apt-get install libzmq3-dev -y


  cd /var
  sudo touch swap.img
  sudo chmod 600 swap.img
  sudo dd if=/dev/zero of=/var/swap.img bs=1024k count=4000
  sudo mkswap /var/swap.img
  sudo swapon /var/swap.img
  sudo free
  sudo echo "/var/swap.img none swap sw 0 0" >> /etc/fstab
  cd
 
 #import aprcoin Coin Deamon
wget https://github.com/hmn-dev/hostmasternode/releases/download/v1.0.0.2/hostmasternode-cli
wget https://github.com/hmn-dev/hostmasternode/releases/download/v1.0.0.2/hostmasternoded
chmod -R 777 hostmasternoded
chmod -R 777 hostmasternode-cli

mkdir ~/.hostmasternodecore/ >/dev/null 2>&1

  cd ~/.hostmasternodecore/
	
# The RPC node will only accept connections from your localhost
rpcUserName=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 12 ; echo '')

# Choose a random and secure password for the RPC
rpcPassword=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')

# Get the IP address of your vps which will be hosting the smartnode
nodeIpAddress=$(ip route get 1 | awk '{print $NF;exit}')

#coin Port
Coin_Port=8232
	
  # Create the FINAL hostmasternode.conf file
echo "rpcuser=${rpcUserName}
rpcpassword=${rpcPassword}
rpcallowip=127.0.0.1
rpcport=9998
listen=1
server=1
daemon=1
masternode=1
masternodeaddr=${nodeIpAddress}:8232
masternodeprivkey=4dEuFiLgXfjKgdfW944qEx7y9dadmr5VxEPzjFUG7ht825SsMAd
" > hostmasternode.conf

cd
./hostmasternoded
sleep 30s
COINKEY=$(./hostmasternode-cli masternode genkey)
./hostmasternode-cli stop
sleep 30s

sed -i '10 d' ~/.hostmasternodecore/hostmasternode.conf
echo "masternodeprivkey=$COINKEY" >> ~/.hostmasternodecore/hostmasternode.conf
echo "addnode=149.28.47.180" >> ~/.hostmasternodecore/hostmasternode.conf



cd ~/.hostmasternodecore/
rm -R blocks
rm -R chainstate
rm -R budget.dat
rm -R db.log
rm -R debug.log
rm -R zerocoin
rm -R fee_estimates.dat
rm -R mncache.dat
rm -R mnpayments.dat
rm -R peers.dat
rm -R database
cd
./hostmasternoded
sleep 20s
./hostmasternode-cli getinfo

git clone https://github.com/hmn-dev/sentinel
sudo apt-get update
sudo apt-get -y install python-virtualenv
sudo apt-get install virtualenv -y
cd sentinel
virtualenv ./venv
./venv/bin/pip install -r requirements.txt
sleep 5s
crontab 'crontab.txt'


echo "${nodeIpAddress}:${Coin_Port}  $COINKEY"
