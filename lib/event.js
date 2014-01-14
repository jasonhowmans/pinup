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

var capture = new PinupCapture();
var storage = new PinupStorage().adapter( 'dropbox' );

// Set title of browserAction
chrome.browserAction.setTitle( { title: 'Pinup' } );

// On browser button click
chrome.browserAction.onClicked.addListener( function( tab ) {
    if ( typeof tab !== 'object' ) return;

    // Comb page for certain data that we need
    capture.combMetaInfo( tab, function(data) {

        // Capture an image of the page using PinupCapture
        capture.captureTab( tab, function( image ) {
            capture.cleanUp( tab );

            // Upload image and save data locally
            storage.upload_png_and_save_data( image, data, function( ) {
                console.log('all done :)');
            });
        });
    });
});