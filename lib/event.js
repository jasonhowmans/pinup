/*!
 * Chrome events file
 *  
 *
 * Created by Jason Howmans (@jasonhowmans) 2014
 */

var img_data_arr    = [];
var scroll_track    = {x:0, y:0};

function scrollTo( tab, x, y ) {
    if ( typeof tab !== 'object' ) return false;
    var x = x || 0
    ,   y = y || 0
    ,   coords = { x: x, y: y };

    chrome.tabs.sendMessage( tab.id, {action: 'scroll', data: coords});
    scroll_track.y = y;
}


function captureView( tab, callback ) {
    var tab         = tab || null
    ,   callback    = callback || function() { };

    window.setTimeout(function() {
        chrome.tabs.captureVisibleTab( tab.windowId, {format: 'png'}, callback);
    }, 100);
}


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


function joinImages( sizes, callback ) {
    if ( typeof sizes !== 'object' ) return false;

    var body    = document.body
    ,   canvas  = document.createElement('canvas')
    ,   ctx     = canvas.getContext('2d')
    ,   pos     = { x: 0, y: 0 }
    ,   counter = 0;

    canvas.width = sizes.screen.width;
    canvas.height = sizes.page.height;
    body.appendChild( canvas );

    var image = new Image();
    image.onload = function() {
        ctx.drawImage( image, pos.x, pos.y );
    }
    image.src = img_data_arr[0];
    var canvasDataURL = canvas.toDataURL();
    console.log( canvasDataURL );

    /*img_data_arr.forEach( function( data ) {
        var image = new Image();
        image.onload = function() {
            ctx.drawImage( image, pos.x, pos.y );
        }
        image.src = data;
        pos.y += sizes.screen.height;
        counter ++;

        console.log(pos, counter, img_data_arr.length);
        if ( counter == img_data_arr.length ) {
            var canvasDataURL = canvas.toDataURL();
            console.log( canvasDataURL );
        }
    });*/
}


function captureTab( tab, callback ) {
    chrome.tabs.sendMessage( tab.id, {action: 'pageSize'}, function( sizes ) {
        var page_height     = sizes.page.height || false
        ,   screen_height   = sizes.screen.height || false
        ,   scroll_counter  = 0;

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
                joinImages( sizes );
            }
        }
    });

}


// Set title of browserAction
chrome.browserAction.setTitle( { title: 'Pinup' } );

// On click event
chrome.browserAction.onClicked.addListener( function( tab ) {
    if ( typeof tab !== 'object' ) return;

    captureTab( tab, function() {

    });
});