Timetable Generator
=========

### About
 - This is a timetable generator I wrote to learn javascript, so it has a lot of bad code in it!
 - You need to use node.js to run this, see Run.bat, this may work on Linux / Mac -- you will probably need to download the linux / mac modules though.
 - By default, this will run on port 3000, so visit: localhost:3000 to access the timetable generator.
 - This allows you to browse possible timetable options for each class, if your class isn't in the suggested list of classes, simply enter the subject code and press 'Find' and it will attempt to download the latest timetable data for that subject
 - Timetable data is cached, once downloaded, it won't ever update, if you want it to update, you need to delete the cache in `static/timetable`
 - The timetable generator will allow you to remove classes you can't / don't want to attend, it offers a printable version (Make sure to turn background colors on, otherwise it looks plain)
 - You can also filter timetables by finishing time, number of clashes, and many other things, you can change ascending and descending using the arrows on the filters.
 
### Tips
 -  To avoid crashes, disclude classes and select streams
 -  Check the year and subject semester
 -  Visit the handbook timetable for more information to avoid stream errors
 -  Expand classes and remove times that are too early, late, or clash with other commitments
 -  Sort the preferences and make them ascending/descending to personalise

### Setup
 - You need to INSTALL [node.js] (https://nodejs.org/en/) and the appropriate modules
 1.  Open a command window, such as the Node.js command prompt
 2.  Navigate to the root folder (TimetableGenerator-master) with the cd command, for example:
 `cd C:\Users\Name\Desktop\TimetableGenerator-master`
 3.  Type "npm install" into the console / command window, this will install all the modules required to run this program. npm is a package manager that comes with node.js
 4.  Execute Run.bat and navigate to localhost:3000 with an internet browser

### Icons
 - Most of the icons are silk icons, which can be found [here] (http://www.famfamfam.com/lab/icons/silk/)
