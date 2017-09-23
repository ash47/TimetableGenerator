Timetable Generator
=========

###About###
 - This is a timetable generator I wrote to learn javascript, so it has a lot of bad code in it!
 - You need to use node.js to run this, see Run.bat, this may work on Linux / Mac -- you will probably need to download the linux / mac modules though.
 - By default, this will run on port 3000, so visit: localhost:3000 to access the timetable generator.

 - This allows you to browse possible timetable options for each class, if your class isn't in the suggested list of classes, simply enter the subject code and press 'Find' and it will attempt to download the latest timetable data for that subject
 - Timetable data is cached, once downloaded, it won't ever update, if you want it to update, you need to delete the cache in `static/timetable`
 - The timetable generator will allow you to remove classes you can't / don't want to attend, it offers a printable version (Make sure to turn background colors on, otherwise it looks plain)
 - You can also filter timetables by finishing time, number of clashes, and many other things, you can change ascending and descending using the arrows on the filters.

###Setup###
 - You need to INSTALL node.js
 - You will need to install the modules to make this run
 - To do this simply open a command window to the root folder
 - Type "npm install" into the console / command window, this will install all the modules required to run this program
 - npm is a package manager that comes with node.js

###Icons###
 - Most of the icons are silk icons, which can be found [here] (http://www.famfamfam.com/lab/icons/silk/)