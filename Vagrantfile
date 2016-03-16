# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get -y update
    sudo apt-get -y install gcc make build-essential

    # install node
    curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
    sudo apt-get install -y nodejs

    # install gulp
    sudo npm install -g gulp

  SHELL

end
