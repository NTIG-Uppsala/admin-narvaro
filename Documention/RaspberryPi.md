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




