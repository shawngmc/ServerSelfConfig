import RPi.GPIO as GPIO
import time
import urllib2

lockout_period_ms = 10000
contact_url = "http://192.168.1.222:8080/input/WwL2MDpy2vhX8jdY6NgLfrrMY1B?private_key=0ONjdgZEjAuLMQ2wxaWjTjjWRGE&wasfed=Y"


#####################################################

def sendNotification():
	urllib2.urlopen(contact_url)
	print("Message sent!")
	
	
def getCurrentTimeMillis():
	return int(round(time.time() * 1000))

# Set up the pins
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)

last_press_time = 0

while True:
	input_state = GPIO.input(18)
	if input_state == False:
		print("Button detected...")
		current_time = getCurrentTimeMillis()
		if (last_press_time + lockout_period_ms < current_time):
			last_press_time = current_time
			sendNotification()
		else:
			print("In lockout!")
		time.sleep(0.2)

		