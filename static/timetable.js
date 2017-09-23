var times = new Array();

// Build the list:
var i = 700;
while(i < 2130) {
	times.push(i);

	i += 15;
	if(i-Math.floor(i/100)*100 == 60) i += 40;
}

var days = new Array(
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday"
);

var colors = new Array(
	{bg:'c3f84b', txt:'000'},
	{bg:'ee3378', txt:'FFF'},
	{bg:'1fafd5', txt:'000'},
	{bg:'72408d', txt:'FFF'}
);

var subjectcolors = {};
var colorupto = 0;

// Store all the generated timetables:
var timetables = new Array();

// Contains cached subjects:
var subjects = new Array();

function GetPrintTime(t) {
	var minutes = t%100;
	var hours = (t-minutes)/100;
	var am = "am";

	// Change to pm:
	if(hours >= 12) {
		am = "pm";
	}

	// no 1300:
	if(hours > 12) {
		hours -= 12;
	}

	// Make it always two digits:
	if(minutes < 10) {
		minutes = '0'+minutes;
	}

	// Put it all together:
	return hours+':'+minutes+' '+am;
}

var printSort = {
	L:'Lecture',
	P:'Practical',
	S:'Seminar',
	T:'Tutorial',
	W:'Workshop',
	PB:'Problem-based',
	FW:'Field Work',
	BI:'Bump-in',
	BO:'Bump-out',
	CL:'Clinical Laboratory',
	CP:'Clinical Placement',
	CR:'Clinical Practice',
	CC:'Concert Class',
	FM:'Filmmaking',
	IC:'Instrument Class',
	IP:'Independent Practice',
	LE:'Large Ensemble',
	PF:'Performance',
	PC:'Performance Class',
	RH:'Rehearsal',
	SC:'Screening',
	ST:'Studio'
};

// Returns a user readable sort:
function GetPrintSort(s) {
	//var n = parseInt(sort);

	var sort = s.replace(/[0-9]/g, '');
	var n = parseInt(s.substr(sort.length));

	return printSort[sort]+' '+n;
}

// Returns a readable duration:
function GetPrintDuration(n) {
	if(n == 1) {
		return '1 Hour';
	} else {
		return n+' Hours';
	}
}

function GrabSubject(code, year) {
	// Make sure they entered a code:
	if(code == '') {
		$('#subjectError').html('<font color="red">You have to enter a code!</font>');
		return false;
	}

	// Uppercase code:
	code = code.toUpperCase();

	// Check if that subject has already been added:
	var quit = false;
	$('.subjectStore').each(function() {
		if($(this).attr('code') == code) {
			quit = true;
			return false;
		}
	});

	// If we already have this subject:
	if(quit) {
		$('#subjectError').html('<font color="red">This subject is already in the list!</font>');
		return false;
	}

	// Tell the user we are searching:
	$('#subjectError').html('<font color="green">Searching for subject...</font>');

	// Grab the subject:
	$.getJSON('timetable/'+year+'/'+code+'.json', function(data) {
		if(data[0] == 'error') {
			// Show the failure message:
			$('#subjectError').html('<font color="red">'+data[1]+'</font>');
		} else {
			// Build a list of semesters:
			var sems = '';
			for(var i=0; i<data.data.length; i++) {
				sems += '<option value="'+data.data[i].sem+'">'+data.data[i].sem+'</option>';
			}

			// Build the subject:
			var s = $('<tr code="'+data.code+'" class="subjectStore"></tr>');
			$('#subjectTable').append(s);

			// Build the sub category:
			var sub2 = $('<tr style="display:none;"></tr>');
			$('#subjectTable').append(sub2);

			var sub = $('<td colspan="9" class="subList">'+data.code+'</td>');
			sub2.append(sub);

			// Store the sub:
			s.data('sub', sub);

			// Add the expand button:
			var td = $('<td></td>');
			ExpandButton(td, sub2);
			s.append(td);

			// Add subject code:
			s.append('<td>'+data.code+'</td>');

			// Add subject name:
			s.append('<td>'+data.name+'</td>');

			// Add subject year:
			s.append('<td>'+year+'</td>');

			// Add selector:
			var td = $('<td></td>');
			s.append(td);
			var sel = $('<select>'+sems+'</select>');
			td.append(sel);

			// When the select box changes:
			sel.change(function() {
				BuildAttendList(s);
			});

			// Ensure we have a store for this subject:
			if(!subjectcolors[data.name]) {
				// Grab default colors:
				subjectcolors[data.name] = colors[colorupto];

				// Move onto next color:
				colorupto += 1;

				if(colorupto >= colors.length) {
					colorupto = 0;
				}
			}

			// Add color picker BG:
			var td = $('<td></td>');
			s.append(td);
			var cs = $('<p style="background-image:url(/images/select.png);width:16px;height:16px;background-color:'+subjectcolors[data.name].bg+';">&nbsp;</p>');
			td.append(cs);

			// Color picker:
			cs.ColorPicker({onChange:function(c, color) {
				subjectcolors[data.name].bg = '#'+color;
				cs.css('background-color', '#'+color);
			}, color:subjectcolors[data.name].bg});

			// Add color picker TXT:
			var td = $('<td></td>');
			s.append(td);
			var cs2 = $('<p style="background-image:url(/images/select.png);width:16px;height:16px;background-color:'+subjectcolors[data.name].txt+';">&nbsp;</p>');
			td.append(cs2);

			// Color picker:
			cs2.ColorPicker({onChange:function(c, color) {
				subjectcolors[data.name].txt = '#'+color;
				cs2.css('background-color', '#'+color);
			}, color:subjectcolors[data.name].txt});

			// Add a toggle button:
			var td = $('<td></td>');
			var btn = ToggleButton(td, s, 'build', function(state, args) {
				// If we are trying to turn the button on:
				if(state) {
					// Check if I have all my childen off:
					var allOff = true;
					$('.subjectSort', $(args)).each(function(index) {
						if($($(this).data('button')).data('state')) {
							allOff = false;
						}
					});

					// Stop the press:
					if(allOff) {
						return true;
					}
				}
			}, sub);
			s.append(td);

			// Store the button onto s:
			s.data('button', btn);

			// Add delete button:
			var td = $('<td></td>');
			DeleteButton(td, new Array(s, sub));
			s.append(td);

			// Add overflow buffer:
			s.append('<td class="fill"></td>');

			// Code needed:
			var code = data.code;

			// Create new array to write subjects to:
			subjects[data.code] = new Array()

			// Create index by subjects[code][semester]:
			for(var i=0;i<data.data.length;i++) {
				// Store the data:
				subjects[data.code][data.data[i].sem] = data.data[i].data;
			}

			// Store the name:
			subjects[data.code].name = data.name;

			// Build dependancy list:
			BuildAttendList(s);

			// Clear the entry field:
			$('#subjectCode').val('');

			// Reset the error thingo:
			$('#subjectError').html('');
		}
	});
}

// An array of classes to attend:
var toAttend = new Array();

// Stores a tempry timetable:
var timetableTemp = new Array();

// Creates a new timetable:
function TtCreate() {
	// Create an empty timetable:
	timetableTemp = new Array();

	// Build a slot for each day:
	for(var i=0;i<days.length;i++) {
		timetableTemp[i] = {
			n:1
		};
	}

	// Set default start and finish:
	timetableTemp.start = times.length;
	timetableTemp.end = 0;

	// Colours:
	timetableTemp.colors = new Array();
	timetableTemp.tColors = 0;

	// List of times that have a class starting on:
	timetableTemp.times = new Array()
}

// Adds a data entry into a timetable:
function TtAdd(name, sort, d) {
	// The slot number to insert into:
	var slot = 0;

	// Ensure we have numbers
	d.day = parseInt(d.day);
	d.time = parseInt(d.time);

	// Update the start time:
	if(d.time < timetableTemp.start) {
		timetableTemp.start = d.time;
	}

	// Update end time:
	if(d.time+d.len*4 > timetableTemp.end) {
		timetableTemp.end = d.time+d.len*4;
	}

	for(var i=0;i<d.len*4;i++) {
		// Check if this time slot already exists:
		if(timetableTemp[d.day][d.time+i]) {
			// Change the slot number:
			if(slot < timetableTemp[d.day][d.time+i].length) {
				slot = timetableTemp[d.day][d.time+i].length;
			}
		} else {
			// Create it:
			timetableTemp[d.day][d.time+i] = new Array();
		}
	}

	// Store that there is a class starting here:
	timetableTemp.times[d.time] = true;
	timetableTemp.times[d.time+d.len*4] = true;

	// Update n:
	if(slot+1 > timetableTemp[d.day].n) {
		timetableTemp[d.day].n = slot+1;
	}

	// Workout color:
	if(!timetableTemp.colors[name]) {
		if(subjectcolors[name]) {
			timetableTemp.colors[name] = subjectcolors[name];
		} else {
			// Cycle colours:
			timetableTemp.colors[name] = colors[timetableTemp.tColors];
			timetableTemp.tColors += 1;

			// Stop overflow:
			if(timetableTemp.tColors >= colors.length) {
				timetableTemp.tColors = colors.length-1;
			}
		}
	}

	// Grab the color
	var color = timetableTemp.colors[name];

	// If there are no clashes:
	if(slot == 0) {
		// Insert into timetable array:
		timetableTemp[d.day][d.time][slot] = '<div class="bTop" style="background-color:'+color.bg+';color:'+color.txt+';">'+name+'</div>';
		timetableTemp[d.day][d.time+1][slot] = '<div class="bLR">'+sort+'</div>';
		timetableTemp[d.day][d.time+2][slot] = '<div class="bLR">'+d.loc[0].b+'</div>';

		if(d.len == 1) {
			timetableTemp[d.day][d.time+3][slot] = '<div class="bBot">'+d.loc[0].r+'</div>';
		} else {
			timetableTemp[d.day][d.time+3][slot] = '<div class="bLR">'+d.loc[0].r+'</div>';
		}

		for(var i=4;i<d.len*4-1;i++) {
			timetableTemp[d.day][d.time+i][slot] = '<div class="bLR">&nbsp;</div>';
		}

		if(d.len > 1) {
			timetableTemp[d.day][d.time+i][slot] = '<div class="bBot">&nbsp;</div>';
		}
	} else {
		// If there are clashes:

		// Insert into timetable array:
		timetableTemp[d.day][d.time][slot] = '<div class="bTopClash" style="background-color:'+color.bg+';color:'+color.txt+';">'+name+'</div>';
		timetableTemp[d.day][d.time+1][slot] = '<div class="bLRClash">'+sort+'</div>';
		timetableTemp[d.day][d.time+2][slot] = '<div class="bLRClash">'+d.loc[0].b+'</div>';

		if(d.len == 1) {
			timetableTemp[d.day][d.time+3][slot] = '<div class="bBotClash">'+d.loc[0].r+'</div>';
		} else {
			timetableTemp[d.day][d.time+3][slot] = '<div class="bLRClash">'+d.loc[0].r+'</div>';
		}

		for(var i=4;i<d.len*4-1;i++) {
			timetableTemp[d.day][d.time+i][slot] = '<div class="bLRClash">&nbsp;</div>';
		}

		if(d.len > 1) {
			timetableTemp[d.day][d.time+i][slot] = '<div class="bBotClash">&nbsp;</div>';
		}
	}
}

// Renders a timetable into div:
function TtRender(num) {
	// Ensure this data point exists:
	if(!permData[num-1]) {
		return;
	}

	// Grab the actual num:
	num = permData[num-1].num;

	// Create a new timetable:
	TtCreate();

	var upto = new Array();

	// Grab the current permutation:
	var s = 1;
	for(var i=toAttend.length-1;i>=0;i--) {
		upto[i] = Math.floor(((num)/s)%toAttend[i].ns);
		s *= toAttend[i].ns;
	}

	// Add all the classes:
	for(var i=toAttend.length-1;i>=0;i--) {
		for(var j=0;j<toAttend[i].length;j++) {
			var z = toAttend[i][j][upto[i]];
			z.len = toAttend[i][j].duration;

			// Add the class:
			TtAdd(subjects[toAttend[i].code].name, GetPrintSort(toAttend[i][j].sort), z);
		}
	}

	// A store for html:
	html = '';

	html += '<table cellspacing="0" cellpadding="0">'

	// Put the days in:
	html += '<tr>';

	// First time:
	html += '<td class="leftBar" rowspan="'+(timetableTemp.end-timetableTemp.start+2)+'"><div style="height:1px;">';

	for(var i=timetableTemp.start;i<timetableTemp.end+1;i++) {
		if(timetableTemp.times[i]) {
			html += '<div class="lTime">'+GetPrintTime(times[i])+'</div>';
		} else {
			html += '<div class="llTime">'+GetPrintTime(times[i])+'</div>';
		}
	}

	html += '</div></td>';

	for(var i=0;i<days.length;i++) {
		if(permData[num][i] && permData[num][i].activities > 0) {
			html += '<td class="tDay" align="center" colspan="'+timetableTemp[i].n+'">'+days[i]+'</td>';
		} else {
			html += '<td class="tDayFadded" align="center">'+days[i]+'</td>';
		}
		/*for(var j=1;j<timetableTemp[i].n;j++) {
			html += '<td></td>';
		}*/
	}

	html += '</tr>';

	// Cycle times:
	for(var i=timetableTemp.start;i<timetableTemp.end+1;i++) {
		html += '<tr>';

		// Cycle days:
		for(var j=0;j<days.length;j++) {
			if(timetableTemp[j]) {
				var d = timetableTemp[j][i];

				if(d) {
					for(var k=0;k<timetableTemp[j].n;k++) {
						if(d[k]) {
							html += '<td>'+d[k]+'</td>';
						} else {
							html += '<td class="line">&nbsp;</td>';
						}
					}
				} else {
					for(var k=0;k<timetableTemp[j].n;k++) {
						html += '<td class="line">&nbsp;</td>';
					}
				}
			}
		}

		html += '</tr>';
	}

	html += '</table>';
	$('#timetable').html(html);
}

function PrintableWindow() {
	var html = '';

	// Header:
	html += '<html><head>';
	html += '<link rel="stylesheet" href="css/style.css" type="text/css"/>';
	html += '<link rel="stylesheet" href="css/font.css" type="text/css"/>';
	html += '</head><body>'

	// The timetable itself:
	html += $("#timetable").html();

	// Footer:
	html += '</body></html>';

	// Make the window:
	var w = window.open('','timetable', 'resizable=1');
	w.moveTo(0, 0);
	w.resizeTo(screen.width,screen.height);
	w.document.writeln(html);
	w.document.close();

	// Print that shit:
	w.print();
}

var filters = new Array()

filters.push({
	txt:'Total Clashes',
	fnc:function(a, b, up) {
		if(up) {
			return a.totalClashes - b.totalClashes;
		} else {
			return b.totalClashes - a.totalClashes;
		}
	}
})

filters.push({
	txt:'Total Days',
	fnc:function(a, b, up) {
		if(up) {
			return a.totalDays - b.totalDays;
		} else {
			return b.totalDays - a.totalDays;
		}
	}
})

filters.push({
	txt:'Total Hours',
	fnc:function(a, b, up) {
		if(up) {
			return a.totalHours - b.totalHours;
		} else {
			return b.totalHours - a.totalHours
		}
	}
})

filters.push({
	txt:'Earliest Start',
	fnc:function(a, b, up) {
		if(up) {
			return b.earliest - a.earliest;
		} else {
			return a.earliest - b.earliest;
		}
	}
})

filters.push({
	txt:'Latest Finish',
	fnc:function(a, b, up) {
		if(up) {
			return a.latest - b.latest;
		} else {
			return b.latest - a.latest;
		}
	}
})

filters.push({
	txt:'Longest Day',
	fnc:function(a, b, up) {
		if(up) {
			return (a.latest-a.earliest) - (b.latest-b.earliest);
		} else {
			return (b.latest-b.earliest) - (a.latest-a.earliest);
		}
	}
})

var permData = new Array()

// Create every permutation:
function TtGenerate() {
	var tp = 1;

	var upto = new Array();

	// Calculate permutations:
	for(var i=toAttend.length-1;i>=0;i--) {
		// Set state:
		upto[i] = 0;

		// Permutations:
		tp *= toAttend[i].ns;
	}

	var totalGenerated = 0;

	// Disallow clashes:
	var allowClashes = true;

	// Allow clashes:
	if(tp < 5000) {
		allowClashes = true;
	}

	var first = false;

	while(true){
		if(!first) {
			// Allow clashes:
			allowClashes = true;
		}

		// Reset the permutation data:
		permData = new Array();

		// Generate every timetable:
		while(totalGenerated < tp) {
			var p = {};

			var pclash = new Array();

			for(var i=0;i<days.length;i++) {
				p[i] = {
					activities:0,
					latest:-1,
					earliest:-1
				};

				pclash[i] = new Array();
			}

			// No clashes yet:
			p.totalClashes = 0;

			var clashed = false;
			var clashi = 0;

		innerloop:
			//for(var i=toAttend.length-1;i>=0;i--) {
			for(var i=0;i<toAttend.length;i++) {
				for(var j=0;j<toAttend[i].length;j++) {
					var z = toAttend[i][j][upto[i]];
					var dur = toAttend[i][j].duration;

					// Calculate clashes:
					for(var k=0;k<dur*4;k++) {
						if(pclash[z.day][z.time+k]) {
							// There was a clash:
							p.totalClashes += 1;

							if(!allowClashes) {
								// There was a clash:
								clashed = true;
								clashi = i;

								break innerloop;
							}
						}

						// Store that there is a class here:
						pclash[z.day][z.time+k] = true;
					}

					// Update earliest class:
					if(p[z.day].earliest > z.time || p[z.day].earliest == -1) {
						p[z.day].earliest = z.time;
					}

					// Update latest class:
					if(p[z.day].latest < z.time+dur*4 || p[z.day].latest == -1) {
						p[z.day].latest = z.time+dur*4;
					}

					// Add to the total activities on that day:
					p[z.day].activities += 1;

					// Store the number:
					p.num = totalGenerated;
				}
			}

			// If we didn't clash:
			if(!clashed) {
				p.totalDays = 0;
				p.earliest = -1;
				p.latest = -1;
				p.totalHours = 0;

				// Workout useful info:
				for(var i=0;i<days.length;i++) {
					if(p[i].activities > 0) {
						// Total days:
						p.totalDays += 1;

						// Earliest class:
						if(p.earliest > p[i].earliest || p.earliest == -1) {
							p.earliest = p[i].earliest;
						}

						// Latest class:
						if(p.latest < p[i].latest || p.latest == -1) {
							p.latest = p[i].latest;
						}

						// Total hours:
						p.totalHours += (p[i].latest-p[i].earliest)
					}
				}

				// Store this timetable:
				permData.push(p);

				// Roll onto the next permutation:
				var i = toAttend.length-1;
				while(i >= 0) {
					upto[i] += 1;

					// Check for overflow:
					if(upto[i] >= toAttend[i].ns) {
						// Reset, move onto next element:
						upto[i] = 0;
						i -= 1;
					} else {
						// Done, escape:
						break;
					}
				}

				// Done generating one timetable:
				totalGenerated += 1;
			} else {
				// We found a clash, skip impossible times:

				upto[clashi] += 1;
				if(upto[clashi] >= toAttend[clashi].ns) {
					// If we are at the start:
					if(clashi == 0) {
						totalGenerated = tp;
						break;
					}

					// Decrease up the chain:
					var cn = clashi-1;

					upto[cn] += 1;

					while(cn >= 0 && upto[cn] >= toAttend[cn].ns) {
						upto[cn] = 0;
						cn -= 1;
						upto[cn] += 1;
					}

					if(cn < 0) {
						totalGenerated = tp;
						break;
					}

					// Reset clashi:
					upto[clashi] = 0;
				}

				for(var i=clashi+1;i<toAttend.length;i++) {
					upto[i] = 0;
				}

				totalGenerated = 0;
				var n = 1;

				for(var i=toAttend.length-1;i>=0;i--) {
					totalGenerated += upto[i] * n;
					n *= toAttend[i].ns;
				}
			}
		}

		// Results?
		if(permData.length > 0 || !first) {
			// Yep:
			break;
		} else {
			// Nope:
			first = false;
		}
	}

	// Build the sort controls:
	var sorter = $("#sorter");
	sorter.html('');

	var sa = $('<ul></ul>');
	sorter.append(sa);

	for(var i=0;i<filters.length;i++) {
		var f = $('<li>'+filters[i].txt+'</li>');
		f.data('num', i);
		sa.append(f);

		// Add a accend/decend button:
		AccendButton(f);
	}

	// Enable the sorting:
	sa.sortable();
	sa.disableSelection();

	// Build the browse controls:
	var bc = $('#browseControls');
	bc.html('');	// Reset the html container
	bc.upto = 1;
	bc.total = permData.length;

	if(bc.total == 0) {
		bc.upto = 0;
	}

	var slider = $('<div id="slideContainer"></div>')
	bc.append(slider);
	slider.slider({min:bc.upto, max:bc.total, step:1, slide: function( event, ui ) {
		// Change what we are upto:
		bc.upto = ui.value;

		// Update the text:
		cn.html("Viewing timetable "+bc.upto+"/"+bc.total);

		// Render the new timetable:
		TtRender(bc.upto);
	}});

	var cn = $('<div id="browseUpto"></div>')
	bc.append(cn);

	cn.html("Viewing timetable "+1+"/"+bc.total);

	// Build prev button:
	var prev = $('<input type="button" value="Previous">')
	bc.append(prev);
	prev.click(function() {
		bc.upto -= 1;

		if(bc.upto <= 0) {
			bc.upto = bc.total;
		}

		slider.slider('value', bc.upto);

		// Update the text:
		cn.html("Viewing timetable "+bc.upto+"/"+bc.total);

		// Render the new timetable:
		TtRender(bc.upto);
	});

	// Build next button:
	var next = $('<input type="button" value="Next">')
	bc.append(next);
	next.click(function() {
		bc.upto += 1;

		if(bc.upto > bc.total) {
			bc.upto = 1;
		}

		slider.slider('value', bc.upto);

		// Update the text:
		cn.html("Viewing timetable "+bc.upto+"/"+bc.total);

		// Render the new timetable:
		TtRender(bc.upto);
	});

	// Add a sort button:
	var sortButton = $('<input type="button" value="Sort">')
	sorter.append(sortButton);
	sortButton.click(function() {
		// Stores the order in which to apply filters:
		var forder = new Array();

		$('li', sa).each(function() {
			forder.push({
				num:$(this).data('num'),
				up:$(this).data('up')
			});
		});

		// Sort the data:
		permData.sort(function(a, b) {
			for(var i=0; i<forder.length;i++) {
				// Try this filter:
				var r = filters[forder[i].num].fnc(a, b, forder[i].up);

				// If it isn't the same:
				if(r != 0) {
					// Return the number:
					return r;
				}
			}

			// Must be the same:
			return 0;
		});

		// Regenerate timetable:
		TtRender(bc.upto);
	});

	// Sort:
	sortButton.click();

	// Printable version link:
	var link = $('<a href="#">Printable Version</a>');
	link.click(function() {
		PrintableWindow();
	});

	// New line:
	sorter.append('<br><br>');

	// Add printable version shit:
	sorter.append(link);

	// Render the first timetable:
	TtRender(bc.upto);
}

function ToggleButton(buttonStore, dataStore, varName, callback, args) {
	// Add a toggle button:
	var btn = $('<img src="icons/tick.png"/>');
	buttonStore.append(btn);

	// Initially enabled:
	dataStore.data(varName, true);
	btn.data('state', true);

	// Allow button to toggle:
	btn.click(function() {
		// Toggle build state:
		dataStore.data(varName, !dataStore.data(varName));

		// Update local var:
		btn.data('state', dataStore.data(varName));

		// Run the callback:
		if(callback) {
			// If the callback returns true, toggle back:
			if(callback(dataStore.data(varName), args)) {
				// Toggle build state:
				dataStore.data(varName, !dataStore.data(varName));
			}
		}

		// Update local var:
		btn.data('state', dataStore.data(varName));

		// Toggle icon:
		if(dataStore.data(varName)) {
			btn.attr('src', 'icons/tick.png');
		} else {
			btn.attr('src', 'icons/cross.png');
		}
	});

	// Return the button:
	return btn;
}

function AccendButton(buttonStore) {
	// Add a toggle button:
	var btn = $('<img src="icons/arrow_up.png"/ style="margin-right:8px;">');
	buttonStore.prepend(btn);

	// Initially enabled:
	buttonStore.data("up", true);

	// Allow button to toggle:
	btn.click(function() {
		// Toggle build state:
		buttonStore.data("up", !buttonStore.data("up"));

		// Toggle icon:
		if(buttonStore.data("up")) {
			btn.attr('src', 'icons/arrow_up.png');
		} else {
			btn.attr('src', 'icons/arrow_down.png');
		}
	});

	// Return the button:
	return btn;
}

function ExpandButton(buttonStore, toExpand) {
	// Add an expand button:
	var btn = $('<img src="icons/add.png"/>');
	buttonStore.append(btn);

	btn.enabled = true;

	// Allow button to toggle:
	btn.click(function() {
		// Toggle build state:
		btn.enabled = !btn.enabled;

		// Toggle icon:
		if(btn.enabled) {
			btn.attr('src', 'icons/add.png');
			toExpand.hide();
		} else {
			btn.attr('src', 'icons/minus.png');
			toExpand.show();
		}
	});
}

function StreamButton(buttonStore, dataStore, varName, varName2) {
	// Add an expand button:
	var btn = $('<img src="icons/lock_open.png"/>');
	buttonStore.append(btn);

	// Create the steam selector:
	var toShow = $('<select class="streamSelect"></select>');
	buttonStore.append(toShow);
	toShow.hide();

	// Initially disabled:
	dataStore.data(varName, false);

	// Allow button to toggle:
	btn.click(function() {
		// Toggle build state:
		dataStore.data(varName, !dataStore.data(varName));

		// Toggle icon:
		if(dataStore.data(varName)) {
			btn.attr('src', 'icons/lock.png');
			toShow.show();
		} else {
			btn.attr('src', 'icons/lock_open.png');
			toShow.hide();
		}
	});

	toShow.pick = function(value) {
		// Change the selection:
		$(this).val(value);

		// Enable the stream if it's not already:
		if(!dataStore.data(varName)) {
			btn.click();
		}
	}

	// When the stream is changed, store the new value:
	toShow.change(function() {
		dataStore.data(varName2, $(this).val());
	});

	// Return the selector:
	return toShow;
}

function DeleteButton(buttonStore, toDelete) {
	// Add an expand button:
	var btn = $('<img src="icons/bin_closed.png"/>');
	buttonStore.append(btn);

	// Allow button to toggle:
	btn.click(function() {
		// Remove items:
		for(var i=0;i<toDelete.length;i++) {
			toDelete[i].remove()
		}
	});
}

function CheckButtons(td) {
	var btn2 = $(td.parent().parent().parent().data('button'));

	// Lets check all other ones:
	var allOff = true;

	// Look at each other subject header:
	$('.subjectSort', td.parent().parent()).each(function(index) {
		if($($(this).data('button')).data('state')) {
			allOff = false;
		}
	});

	// If they're all off:
	if(allOff) {
		// If the button is enabled:
		if(btn2.data('state')) {
			// Disable it:
			btn2.click();
		}
	} else {
		// If the button is disabled:
		if(!btn2.data('state')) {
			// Enable it:
			btn2.click();
		}
	}
}

// Renders the total number of selected items:
function RenderTotals(td) {
	// (active/total)
	td.html('('+td.data('active')+'/'+td.data('total')+')');

	// Store the data somewhere useful:
	$(td).parent().data('active', td.data('active'));
	$(td).parent().data('total', td.data('total'));

	// Grab the button:
	var btn = $($(td).data('button'));

	// Disable the button if no active classes:
	if(td.data('active') <= 0) {
		// If the button is enabled:
		if(btn.data('state')) {
			// Disable it:
			btn.click();
		}
	} else {
		// If the button is disabled:
		if(!btn.data('state')) {
			// Disable it:
			btn.click();
		}
	}

	// Check the top level buttons:
	CheckButtons(td);
};

function BuildAttendList(trMain) {
	// Grab semester:
	var code = trMain.attr('code');
	var sem = trMain.find('select').val();

	// All classes for said subject we have to attend:
	var l = new Array();

	// Build list:
	for(var i=0;i<subjects[code][sem].length;i++) {
		// Grab the data:
		var d = subjects[code][sem][i];

		// Find the index for the day:
		var daynum = -1;
		for(var j=0;j<days.length;j++) {
			if(days[j] == d[1]) {
				daynum = j;
			}
		}

		if(daynum == -1) {
			console.log('Failed to find day '+d[2]);
			continue;
		}

		var sort = d[0].substr(0, d[0].indexOf('/'));

		// Ensure this sort exists:
		if(!l[sort]) {
			l[sort] = new Array();
		}

		// Workout unfriendly and friendly times:
		var timeUF = d[2].substr(0,d[2].indexOf(' - ')).split(':');
		var timeF = timeUF[0]*100 + parseInt(timeUF[1]);

		// Counter for am/pm:
		if(timeUF[1].indexOf('pm') != -1) {
			timeF += 1200;
		}
		// Fix wrap around:
		if(timeF >= 2400) {
			timeF -= 1200;
		}

		// Grab index of time:
		var timeIndex = -1;
		for(var j=0;j<times.length;j++) {
			if(times[j] == timeF) {
				timeIndex = j;
			}
		}
		if(timeIndex == -1) {
			console.log('Failed to find time '+timeF+' ('+timeUF+')');
			continue;
		}

		// Workout the location:
		var loc = d[3].split('-');

		// Decide if it's in a lecture theator:
		var b = loc[0].split('Th:');	// NOTE: If b.length is 2, it is in a theator
		// We don't actually use this information at this stage

		// Push the data on:
		l[sort].push({
			time:timeIndex,
			day:daynum,
			building:b[b.length-1],
			loc:loc[1],
			len:d[4]
		});
	}

	// Create the table:
	var sub = $(trMain.data('sub'));
	sub.html('<table></table>');

	// Grab the table:
	var t = $('table', sub);

	// Store the button onto the table:
	t.data('button', trMain.data('button'));

	// Build the list of activities:
	for(var sort in l) {
		// Create a row for this activity:
		var tr = $('<tr class="subjectSort"></tr>');
		t.append(tr);

		// Store useful info:
		tr.data('sort', sort);
		tr.data('duration', l[sort][0].len);

		// Create a row for the sub stuff:
		var tr2 = $('<tr style="display:none;"></tr>');
		t.append(tr2);
		var td2 = $('<td colspan="8" class="subList"></td>');
		tr2.append(td2);

		// Create a table:
		td2.append('<table></table>');

		// Grab the table:
		var t2 = $('table', td2);

		// Store t2 into tr:
		tr.data('subTimes', t2);

		// Add Expand Button:
		var td = $('<td></td>');
		ExpandButton(td, tr2);
		tr.append(td);

		// Add activity sort:
		tr.append('<td>'+GetPrintSort(sort)+'</td>');

		// Store the total:
		var total = l[sort].length;

		// Add number of choices:
		var tdTotals = $('<td></td>');
		tr.append(tdTotals);
		tdTotals.data('total', total);
		tdTotals.data('active', total);

		// Add how long it is:
		tr.append('<td>'+GetPrintDuration(l[sort][0].len)+'</td>'); // Assumes uniform activity duration!

		// Create a toggle button:
		var td = $('<td></td>');
		tr.append(td);
		var btn = ToggleButton(td, tr, 'build', function(state, args) {
			// If the button is trying to be turned on:
			if(state) {
				// If no children are selected:
				if(args[0].data('active') <= 0) {
					// Don't allow the button to be pressed:
					return true;
				}
			}

			// Check the top level button:
			CheckButtons(args[1]);
		}, new Array(tr, tdTotals));

		// Store the button:
		tdTotals.data('button', btn);
		tr.data('button', btn);

		// Render the totals:
		RenderTotals(tdTotals);

		// Create a stream selector:
		var td = $('<td></td>');
		tr.append(td);

		var stream = StreamButton(td, tr, 'state', 'stream');

		// Add stream options:
		for(var streamSort in l) {
			if(sort != streamSort) {
				stream.append('<option value="'+streamSort+'">'+GetPrintSort(streamSort)+'</option>');
			}
		}

		var finished = false;

		// Check if there is a good stream match for it:
		$('.subjectSort', t).each(function(index) {
			if(!finished && total == $(this).data('total') && sort != $(this).data('sort')) {
				// Pick the stream:
				stream.pick($(this).data('sort'));		// We need to check the first data entry isn't a clash here!!!!
				finished = true;
			}
		});

		// Store the first stream:
		stream.change();

		// Add overflow spacing:
		tr.append('<td class="fill"></td>');

		// Build the list of times:
		for(var i=0;i<l[sort].length;i++) {
			// Craete a row:
			var tr = $('<tr class="subTime"></tr>');
			t2.append(tr);

			// Store info into tr:
			tr.data('day', l[sort][i].day);
			tr.data('time', l[sort][i].time);
			tr.data('building', l[sort][i].building);
			tr.data('loc', l[sort][i].loc);

			// Add the day:
			tr.append('<td>'+days[l[sort][i].day]+'</td>')

			// Add the time:
			tr.append('<td>'+GetPrintTime(times[l[sort][i].time])+' - '+GetPrintTime(times[l[sort][i].time]+l[sort][i].len*100)+'</td>')

			// Add Building:
			tr.append('<td>'+l[sort][i].building+'</td>')

			// Add Location:
			tr.append('<td>'+l[sort][i].loc+'</td>')

			// Insert build button:
			var td = $('<td></td>');
			tr.append(td);
			ToggleButton(td, tr, 'build', function(state, par) {
				// Change the active number:
				if(state) {
					par.data('active', par.data('active')+1);
				} else {
					par.data('active', par.data('active')-1);
				}

				// Re render:
				RenderTotals(par);
			}, tdTotals);
		}
	}
}

var subjects = {};

$(document).ready(function(){
	// Update year to be latest year
	var now = new Date();
	$('#subjectYear').val(now.getFullYear());

	// Start getting subjects:
	$.getJSON('subjects.json', function(data) {
		subjects = data;

		// Add autocomplete:
		$('#subjectCode').autocomplete({source:subjects, minLength:4, delay:0, select: function( event, ui ) {
			GrabSubject(ui.item.label.split(' ')[0], $('#subjectYear').val());
		}});
	});

	// Grab buttons:
	$('#addSubject').click(function() {
		GrabSubject($('#subjectCode').val().split(' ')[0], $('#subjectYear').val());
	});

	$('#test').click(function() {
		var r = $('#subjectTable tr');

		// Reset the list of classes to attend:
		toAttend = new Array();

		r.each(function(index) {	// Comp10001, mast10007 etc
			// Grab the code:
			var code = $(this).attr('code');

			// Check code:
			if(code && $($(this).data('button')).data('state')) {
				// Grab semester:
				var sem = $(this).find('select').val();

				// All classes for said subject we have to attend:
				var l = new Array();
				var ls = new Array();	//  Store streamed ones
				var lookup = new Array();	// A lookup for steams

				var sub = $($(this).data('sub'));

				$('.subjectSort', sub).each(function() {	// Lecture 1, Lectre 2 etc
					// If it is set to build:
					if($(this).data('build')) {
						// New array to store these lecture times:
						var d = new Array();

						// Read in the data:
						$('.subTime', $($(this).data('subTimes'))).each(function() {	// Monday 9:00am, Wednesday 12:00pm etc
							// Check if this time is set to build:
							if($(this).data('build')) {
								var found = -1;

								// Search the l array for dup times:
								for(var i=0;i<d.length;i++) {
									// Same day + time:
									if(d[i].day == $(this).data('day') && d[i].time == $(this).data('time')) {
										found = i;
										break;
									}
								}

								if(found == -1) {
									d.push({
										day:$(this).data('day'),
										time:$(this).data('time'),
										loc: new Array({
											b:$(this).data('building'),
											r:$(this).data('loc')
										})
									});
								} else {
									d[i].loc.push({
										b:$(this).data('building'),
										r:$(this).data('loc')
									});
								}
							}
						});

						// Store the sort:
						d.sort = $(this).data('sort');
						d.duration = $(this).data('duration');

						// Check if it is streamed:
						if($(this).data('state')) {
							// Streamed, store what it is streamed to:
							d.stream = $(this).data('stream');

							// Store the data:
							ls.push(d);
						} else {
							// Store the data:
							lookup[d.sort] = l.length;

							var tmp = new Array(d);
							tmp.ns = d.length;	// number of times
							tmp.code = code;	// subject code

							l.push(tmp);
						}
					}
				});

				// Stick the streamed classes in:
				for(i=0;i<ls.length;i++) {
					// Ensure the stream exists:
					var key = lookup[ls[i].stream];

					if(!key && key != 0) {
						$('#subjectError').html('<font color="red">Stream loop error '+ls[i].stream+'</font>');
						return false;
					}

					// Take the lowest length:
					if(ls[i].length < l[key].ns) {
						l[key].ns = ls[i].length;
					}

					// Push the data on:
					l[key].push(ls[i]);
				}

				// Insert the data:
				for(i=0;i<l.length;i++) {
					toAttend.push(l[i]);
				}
			}
		});

		// Sort by lowest number of choices to make:
		toAttend.sort(function(a, b) {
			return (a.ns - b.ns);
		});

		// We now have a list of subject we need to attend

		// Generate data on all permutations:
		TtGenerate();
	});

	// Build a table for the subject list:
	$('#subjectList').html('<table id="subjectTable"></table>')

	//BuildTimetable($('#timetable'), 0);
});
