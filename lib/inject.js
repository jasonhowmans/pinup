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
 *   Content Script to be injected into captured webpage
 *   Created by Jason Howmans (@jasonhowmans) 2014
 */

;(function(window, document, chrome) {
    var body = document.body
    ,   html = document.documentElement
    ,   stylesheet_url = false;



    /*!
     * If we made some mess, lets clean it up
     */
    function cleanUp() {
        // Remove client styles
        if ( stylesheet_url ) {
            var tag = document.getElementById( 'pinup-client-styles' );
            tag.parentNode.removeChild( tag );
            stylesheet_url = false;
            body.style.removeProperty('top');
        } 
    }



    /*!
     * Grab data from the page that might be useful later
     */
    function grabData() {
        var metas   = document.head.getElementsByTagName( 'meta' )
        ,   out     = {
            url: '',
            title: '',
            keywords: '',
            description: ''
        };
        out.url = window.location.href || '';
        out.title = document.title || '';

        // Look through meta tags
        if ( metas.length ) {
            for ( var i=0; i<metas.length; i++ ) {
                if ( metas[i].name == 'description' ) {
                    out.description = metas[i].content || '';
                }else if ( metas[i].name == 'keywords' ) {
                    out.keywords = metas[i].content || '';
                }
            }   
        }

        return out;
    }



    /*!
     * Scroll page in tab to position
     *
     * x (number) X position to scroll to
     * y (number) Y position to scroll to
     * callback (optional function)
     */
    function scrollPage( x, y, callback ) {
        if ( window.scrollTop != 0 ) window.scroll( 0, 0 );

        // Inject css into client (if not already there)
        if ( !stylesheet_url ) {
            var linkTag     = document.createElement( 'link' );
            stylesheet_url  = chrome.extension.getURL( 'inject.css' )
            linkTag.id      = 'pinup-client-styles';
            linkTag.rel     = 'stylesheet';
            linkTag.type    = 'text/css';
            linkTag.href    = stylesheet_url;
            document.head.appendChild( linkTag );
        }

        // "scroll" the page
        body.style.top = '-'+y+'px';

        if ( typeof callback === 'function' ) callback();
    }



    /*!
     * Return page dimensions
     */
    function getPageSize() {
        var page_height     = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight )
        ,   screen_height   = window.innerHeight
        ,   page_width      = 0
        ,   screen_width    = window.innerWidth

         
        ,   output = { 
                page: {
                    width: page_width,
                    height: page_height
                    },
                screen: {
                    width: screen_width,
                    height: screen_height
                    }
            };

        return output;
    }



    /*!
     * Await message from event file, and triger method
     */
    chrome.runtime.onMessage.addListener(
        function( message, sender, response ) {

            // Scroll the page
            if ( message.action == 'scroll' ) {
                scrollPage( message.data.x, message.data.y );

            // Return page size info
            }else if ( message.action == 'pageSize' ) {
                response( getPageSize() );

            }else if ( message.action == 'grabData' ) {
                response( grabData() );

            // Clean up client
            }else if ( message.action == 'cleanUp' ) {
                cleanUp();
            }
        }
    );
})(window, document, chrome);