/*!
 * Chrome events file
 *  
 *
 * Created by Jason Howmans (@jasonhowmans) 2014
 */


// Return the html structure of a specific tab
function getContentsOfTab( tab, callback ) {

    // Send message to tab
    chrome.tabs.sendMessage( tab.id, {action: "getHTML"}, function( response ) {
        // Convert html string back to object
        var htmlStr = response.data
        ,   parser  = new DOMParser()
        ,   doc     = parser.parseFromString( htmlStr, "text/html" );

        if ( typeof callback === 'function' ) callback( doc );
    });

}


// Set title of browserAction
chrome.browserAction.setTitle( { title: 'Pinup' } );

// On click event
chrome.browserAction.onClicked.addListener( function( tab ) {
    if ( typeof tab !== 'object' ) return;

    getContentsOfTab( tab, function( content ) {
        console.log( content );
    });
});