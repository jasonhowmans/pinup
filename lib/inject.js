/*!
 * Content Script to be injected into captured webpage
 *  
 *
 * Created by Jason Howmans (@jasonhowmans) 2014
 */

// Get html of current doc


function getPageHTML() {
    var doc, body;

    (function() {
        doc = document;
        body = doc.body;
    })();

    return body;
}


// Capture page with html2canvas
function capturePage( html, callback ) {

    // Check for html2canvas and render the page
    if ( typeof html2canvas === 'function' ) {
        html2canvas( html, {
            timeout: 10000,
            onrendered: function( canvas ) {
                console.log( canvas.toDataURL() );
                callback( canvas.toDataURL() );
            }
        });
    }else{ 
        return false; 
    }
}


// Wait for message from events script and return page HTML
chrome.runtime.onMessage.addListener( 
    function( request, sender, response ) {
        if ( request.action == 'getHTML' ) {
            var page = getPageHTML();
            capturePage( page, function( data ) {
                response( {'data': data} );
            });
        }
    }
);
