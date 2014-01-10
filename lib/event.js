/*!
 * Chrome events file
 *  
 *
 * Created by Jason Howmans (@jasonhowmans) 2014
 */

function capturePage( tab, callback ) {
    var image_details = {
        format: "png"
        };

    chrome.tabs.captureVisibleTab( tab.windowId, image_details, function( dataUrl ) {
        console.log( '<img src="'+dataUrl+'">' );
    });
}

// Set title of browserAction
chrome.browserAction.setTitle( { title: 'Pinup' } );

// On click event
chrome.browserAction.onClicked.addListener( function( tab ) {
    if ( typeof tab !== 'object' ) return;

    chrome.tabs.executeScript( tab.id, {
        code: "window.scroll( 0, 0 );"
    }, function() {
        capturePage( tab );
    });

});