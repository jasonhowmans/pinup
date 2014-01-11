/*!
 * Content Script to be injected into captured webpage
 *  
 *
 * Created by Jason Howmans (@jasonhowmans) 2014
 */
;(function(document, chrome) {
    var body = document.body,
        html = document.documentElement;


    function scrollPage( x, y, callback ) {
        window.scroll( x, y );
        if ( typeof callback === 'function' ) callback();
    }


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



    // Listen for messages from extension
    chrome.runtime.onMessage.addListener(
        function( message, sender, response ) {

            // Scroll the page
            if ( message.action == 'scroll' ) {
                scrollPage( message.data.x, message.data.y );

            }else if ( message.action == 'pageSize' ) {
                response( getPageSize() );

            }
        }
    );
})(document, chrome);