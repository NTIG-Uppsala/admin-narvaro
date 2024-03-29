# Setting Up the Raspberry Pi

## Downloads

You can choose an operating system for your Raspberry Pi using the [Raspberry Pi Imager](https://www.raspberrypi.com/software/).

## Setup

If you have an HP computer, you may need to download the latest drivers from the [HP Software Center](https://support.hp.com/se-sv/drivers). Here's a guide on [how to download the newest drivers](https://www.youtube.com/watch?v=j5rt3xSIWik).

1. If you don't have an OS installed on the Raspberry Pi, follow these instructions:

   - Take your Raspberry Pi SD card and insert it into a micro SD adapter, then connect the adapter to your computer.
   - Download the [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
   - Open Raspberry Pi Imager and complete the setup.

2. Connect the power and display cable to the Raspberry Pi.
3. To control your Raspberry Pi, connect a mouse and keyboard.

## Setting up Autostart on Raspberry Pi

1. Open the command prompt, which you can find at the top left corner of your screen.
2. Create an autostart file in your preferred folder. Navigate to the folder and then type:

```
nano autostart
```


3. The command you just typed should open the file you created. Now, add the following to the file:

```
@chromium-browser --kiosk --new-window "URL for your website" --incognito
@xset -dpms
@xset s noblank
@xset s off
@unclutter -idle 0

```

4. If needed, go back to the root folder with `cd /`.
5. Navigate to the standard autostart folder in Raspberry Pi:

```
cd /etc/xdg/lxsession/lxde-pi/autostart
```

6. Unlink the old autostart file:

```
sudo unlink autostart
```

7. Link the new autostart:

```
sudo ln -s "direction to the autostart you created" autostart
```
8. Open the command promt and install unclutter:
```
sudo apt-get install unclutter
```

9. Open the menu in the top left corner, go Preferences > Screen Configuration and then right click on the screen to select a rotation.

### Static IP adress

You may have to make your IP adress static because the raspberry pi can chance the IP adress every time you restart it

To check if DHCPCD is active type
```
sudo service dhcpcd status
```

If active, follow the "setup" part bellow

If not active type this to make it active and then follow the setup part bellow
```
sudo service dhcpcd start
sudo systemctl enable dhcpcd
```

#### Setup

1. ssh into your raspberry pi:

```
ssh username@raspberrypi-IP-adress
```

2. Write the following to enter the config file:
```
sudo nano /etc/dhcpcd.conf
```

3.  
To get router IP and IP type the following in the ssh
   ```
   ip r | grep default
   ```
   It will look like this
      
![](/Documention/MicrosoftTeams-image%20(1).png)
   Left one is router IP adress

   Right one is IP adress

4. Write this in the file at the bottom:
```
interface [wlan/eth0]
static ip_address=[ip]
static routers=[router-ip]
static domain_name_servers=[router-ip]
```
* Interface 
      
   If you are connected to a wifi use "wlan"
   
   If you are connected via cable use "eth0"


5. Reboot your raspberry pi
   ```
   sudo reboot
   ```

### Server(PM2)
Unfortunately we didn´t have time to make documentation about this. But we followed this tutorial which we will link [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04#step-3-%E2%80%94-installing-pm2)

### Open error html page if server is down
Unfortunately we didn´t have time to make documentation about this. But in summary youll need to create a js file that checks if the response_code from the server is correct, for example 200 och 401. If its not correct it opens a error html page that tells you the server is down

After this you have to enter the crontab on your Raspberry Pi with this command
```
crontab -e
```

then you scroll all the way down and type this(ITS AN EXAMPLE)
```
* * * * * node /path/to/your/script
```

### Optional: Viewing Raspberry Pi Output

To view the Raspberry Pi output, download [VNC Viewer](https://www.realvnc.com/en/connect/download/viewer/).

1. To make VNC Viewer work, execute these commands in the command prompt on the Raspberry Pi:

```
sudo apt-get update
```
```
sudo apt-get install realvnc-vnc-server
```
```
sudp apt-get install realvnc-vnc-viewer
```

Run these commands separately.

2. Open a settings menu:

```
sudo raspi-config
```

3. Navigate to "Interfacing options," open "VNC," and select "yes."

4. Go back to the command prompt and type:

```
hostname -I
```

This will display the IP address of your Raspberry Pi.

5. Open VNC Viewer and enter the Raspberry Pi's IP address. Then, log in with your Raspberry Pi credentials to view the output of the Raspberry Pi.




