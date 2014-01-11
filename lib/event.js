/*          ______    ___    ___      ___    ___   ___    ______
 *        /      /  /   /  /    \   /   /  /   / /   /  /      /
 *       /  /_  /  /   /  /      \ /   /  /   / /   /  /  /_  /
 *      /   _ _/  /   /  /   /\   /   /  /   / /   /  /   _ _/
 *     /  /      /   /  /   /  \     /  /    _    /  /  /
 *    /__/      /___/  /___/    \___/   \________/  /__/
 *   ------------------------------------------------------------
 *                   Take snaps with your browser
 *   ------------------------------------------------------------
 *
 *   Main events file
 *   Created by Jason Howmans (@jasonhowmans) 2014
 */

var img_data_arr    = []
,   scroll_track    = {x:0, y:0};



/*!
 *  Cleanup process; restores browser to state before operation
 *  
 *  tab (Tab object)
 */
function cleanUp( tab ) {
    // Kill the img_data_arr array to save memory
    img_data_arr = [];

    // Reset scroll_track
    scroll_track = {x:0, y:0};

    // Send message to client script
    chrome.tabs.sendMessage( tab.id, {action: 'cleanUp'});
}


/*!
 *  Send scroll message to tab
 *
 *  tab (Tab object)
 *  x (number) X position to scroll to
 *  y (number) Y position to scroll to
 */
function scrollTo( tab, x, y ) {
    if ( typeof tab !== 'object' ) return false;
    var x = x || 0
    ,   y = y || 0
    ,   coords = { x: x, y: y };

    chrome.tabs.sendMessage( tab.id, {action: 'scroll', data: coords});
    scroll_track.y = y;
}



/*!
 *  Capture visible area of tab and return img data
 *
 *  tab (Tab object)
 *  callback (optional function( string imageDataURL ))
 */
function captureView( tab, callback ) {
    var tab         = tab || null
    ,   callback    = callback || function() { };

    window.setTimeout(function() {
        chrome.tabs.captureVisibleTab( tab.windowId, {format: 'png'}, callback);
    }, 100);
}



/*!
 *  Scroll tab to position and captureView()
 *
 *  tab (Tab object)
 *  x (number) X position to scroll to
 *  y (number) Y position to scroll to
 *  callback (optional function)
 */
function scrollAndShoot( tab, x, y, callback ) {
    if ( typeof tab !== 'object' ) return false;
    var x           = x || 0
    ,   y           = y || 0;

    // Make sure we go in the right direction
    if ( scroll_track.y < y || y == 0 ) {
    
        // Scroll to requested position on the page
        scrollTo( tab, x, y );

        // ... and take the shot
        captureView( tab, function( imagedata ) {

            // Add image data to img_data_arr array
            img_data_arr.push( imagedata );
            if ( typeof callback === 'function' ) callback(); 
        });
    }
}



/*!
 *  Join all images in img_data_arr into one image using
 *  a canvas element in the background page, and return image data
 *
 *  sizes (Sizes object) Sizes object returned from 'pageSize' message
 *  callback (optional function( string imageDataURL ))
 */
function joinImages( sizes, callback ) {
    if ( typeof sizes !== 'object' ) return false;

    var body            = document.body
    ,   canvas          = document.createElement('canvas')
    ,   ctx             = canvas.getContext('2d')
    ,   pos             = { x: 0, y: 0 }
    ,   counter         = 0
    ,   array_length    = img_data_arr.length;

    canvas.width = sizes.screen.width;
    canvas.height = sizes.page.height;
    body.appendChild( canvas );

    for( ; counter < array_length; counter++ ) {
        var data    = img_data_arr[counter]
        ,   image   = new Image();
        image.src   = data;

        // For last shot, make sure its lined up correctly
        if ( (counter+1) == array_length ) {
            ctx.drawImage( image, pos.x, (sizes.page.height - sizes.screen.height) );

            // Return image as data URL
            var canvasDataURL = canvas.toDataURL("image/png");
            if ( typeof callback === 'function' ) callback( canvasDataURL );
        }else{
            ctx.drawImage( image, pos.x, pos.y );

            // Track position down the page
            pos.y += sizes.screen.height;
        }

    }
}



/*!
 *  Send scroll message to tab
 *
 *  tab (Tab object)
 *  callback (optional function( string imageDataURL ))
 */
function captureTab( tab, callback ) {
    chrome.tabs.sendMessage( tab.id, {action: 'pageSize'}, function( sizes ) {
        var page_height     = ( typeof sizes === 'object')? sizes.page.height : false
        ,   screen_height   = ( typeof sizes === 'object')? sizes.screen.height : false
        ,   scroll_counter  = 0
        ,   main_callback   = callback || function() {};

        // Scroll to top of page
        scrollTo( tab, 0, 0 );

        // Figure out how many times the page will need to be scrolled, and
        // capture a frame on each jump.
        if ( page_height && screen_height ) {
            var segments    = page_height / screen_height
            ,   seg_floor   = Math.floor( segments )
            ,   scroll_x, scroll_y;

            var repeater = function() {
                if ( seg_floor > scroll_counter ) {
                    scroll_y = scroll_counter * screen_height;
                    scroll_counter++;
                    scrollAndShoot( tab, 0, scroll_y, repeater );

                }else if ( (seg_floor <= scroll_counter) && (segments > seg_floor) ) {
                    scroll_counter = segments;
                    scroll_y = (segments * screen_height) - screen_height;
                    scrollAndShoot( tab, 0, scroll_y, last_run );
                }
            }
            repeater();

            var last_run = function() {
                joinImages( sizes, function( imgData ) {
                    if ( typeof callback === 'function' ) main_callback( imgData );
                });
            }
        }else{
            console.error( 'Hmmm, for some reason the size of your page cant be determined. Try restrting the plugin and trying again' );
        }
    });
}



// Set title of browserAction
chrome.browserAction.setTitle( { title: 'Pinup' } );

// On browser button click
chrome.browserAction.onClicked.addListener( function( tab ) {
    if ( typeof tab !== 'object' ) return;

    captureTab( tab, function( data ) {
        console.log(data);
        cleanUp( tab );
    });
});