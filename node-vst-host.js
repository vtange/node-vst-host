//////////////////////////////////////////////////////////////////////////
// node-vst-host - main module
//////////////////////////////////////////////////////////////////////////
//
// Main javascript API
/* ----------------------------------------------------------------------
													Object Structures
-------------------------------------------------------------------------
	
*/

//////////////////////////////////////////////////////////////////////////
// Namespace (lol)
var SHOW_DEBUG_PRINTS = true;																		
var log = function(a) { if(SHOW_DEBUG_PRINTS) console.log(a); };	// A log function we can turn off


//////////////////////////////////////////////////////////////////////////
// Constructor
var NodeVSTHost = function() {

	return this;
} // end NodeVSTHost();


//////////////////////////////////////////////////////////////////////////
// Process some audio with some plugins
NodeVSTHost.prototype.processAudio = function( inputFile, outputFile, pluginNames, goodCB, errCB ) {
	// MrsWatson wants our plugin names in a more compact string
	var strPluginNames = "";
	for( var i = 0; i < pluginNames.length; i++ ) {
		strPluginNames += pluginNames[i].name;

		//if obj has value for preset, add , then preset
		if(pluginNames[i].preset)
			strPluginNames += (","+pluginNames[i].preset);

		//if not the last vst, add a ; before next vst
		if( i != pluginNames.length - 1 )
			strPluginNames += ";";
	}

	commandArgs = [ 
		"--input", inputFile,
		"--output", outputFile,
		"--plugin", strPluginNames
	];

	console.log( commandArgs );

	runWatsonCommand( commandArgs, function(results) {
		console.log( results );
		goodCB();
	});
} // end NodeVSTHost.processAudio()


//////////////////////////////////////////////////////////////////////////
// List available plugins
NodeVSTHost.prototype.listPlugins = function( callback ) {
	
	arguments = [ 
		"--list-plugins"
	];

	runWatsonCommand( arguments, function(results) {
		var lines = results.match(/[^\r\n]+/g),
			pluginNames = [],
			locations = [];

		// Remove the characters that aren't part of the name
		for( var j = 0; j < lines.length; j++ ) {
			var thisLine = lines[j];

			// If this is just a line telling us that we don't have any
			// plugins here, skip it
			if( thisLine.indexOf("(Empty or non") != -1 || thisLine.indexOf("(No plugins found") != -1 ) {
				continue;
			}

			if( thisLine.indexOf("Location '") != -1 ) {
				locations.push( thisLine.substr(thisLine.indexOf("Location")) );
				continue;
			}

			// If we've gotten this far, this is a plugin name
			// Remove the junk that's there to make the prompt look good
			pluginNames.push( thisLine.substr(20) );
		}

		callback( pluginNames );
	});
} // end NodeVSTHost.processAudio()


function runCommand( command, args, end ) {
	var commandContext = this,
		data = "";

    var spawn = require('child_process').spawn,
        child = spawn( command, args );

    child.stderr.on( 'data', function( buffer ) { 
    	data += buffer.toString();
    });

    child.stderr.on( 'end', function() {
    	end( data );
    });
}


function runWatsonCommand( arguments, onFinished ) {
	var cmdPath = __dirname + "/MrsWatson/bin/" + process.platform + "/mrswatson";

	var foo = new runCommand(
	    cmdPath, 
	    arguments,
	    onFinished || function( data ) {}
	);
}

exports.host = NodeVSTHost;