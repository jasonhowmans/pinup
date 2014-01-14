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

    capture.captureTab( tab, function( data ) {
        console.log(data);
        capture.cleanUp( tab );
        storage.upload_png( data );
    });
});