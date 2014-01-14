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
 *   Storage adapters
 *   Created by Jason Howmans (@jasonhowmans) 2014
 */


function PinupStorage() {
    var self = this;

    /*!
     *   Services library
     *   Services must adhere to the structure set by the adapter_frame
     */
    var services = {

        /*!
         *   Dropbox service
         */
        dropbox: {
            app_key: '6pz0wsv1ds8eo5d',

            client: {
                // Initialise a new Dropbox client
                init: function() {
                    return new Dropbox.Client( {key: services.dropbox.app_key} );
                },

                /*!
                 *   Authenticate client, and return callback containing new 'client' object
                 *   callback (function (Client object, error object))
                 */
                authenticate: function( callback ) {
                    var client = this.init()
                    ,   callback = callback || function(){};

                    // If the client isnt authenicated, authenticate and call callback
                    if ( client.isAuthenticated() ) {
                        callback( client );
                    }else{
                        client.authDriver(new Dropbox.AuthDriver.ChromeExtension({ receiverPath: "client/chrome_oauth_receiver.html" }));
                        client.authenticate( function( error, client ) { 
                            console.log( client );
                            if ( error ) {
                                callback( false, {error: true, message: error, client: false} );
                            }else{
                                callback( client, false );
                            }
                        });
                    }
                },

                // Auth receiver to be called on the api's redirect page
                auth_receiver: function() {
                    Dropbox.AuthDriver.ChromeExtension.oauthReceiver();
                },

                // Returns true if the client is authenticated, false if not
                is_authenticated: function( client ) {
                    if ( typeof client === 'undefined' ) return;
                    return client.isAuthenticated();
                },

                /*!
                 *   Upload file to authenticated client's Dropbox account
                 *
                 *   file (object) Details about file to be upoaded {name: string, data: Blob object}
                 *   client (Client object)
                 *   callback (function (success bool, error object))
                 */
                upload_file: function( file, client, callback ) {
                    if ( typeof client === 'undefined' || typeof file !== 'object' ) return;
                    var callback = callback || function(){};

                    if ( typeof client.writeFile === 'function' ) {
                        client.writeFile( file.name, file.data, function(error) {
                            if ( error )
                                callback( false, {error: true, message: error} );
                            else
                                callback( true, false );
                        });
                    }else{
                        callback( false, {error: true, message: 'Client doesnt have method writeFile()'} );
                    }
                },

                find_files: function( client ) {
                    if ( typeof client === 'undefined' ) return;

                }
            }
        }

    }


    /*!
     *  Public face of the adapter_frame object
     *  Sets up service based on settings and runs it as an adapter
     */
    this.adapter = function( name ) {
        var service = services.dropbox;
        return adapter_frame( service );
    }


    /*!
     *   Adapters Object
     *   Adapters are executable functions that make interfacing with
     *   starage api's simpler
     */
    var adapter_frame = function( service ) {
        var parent = self
        ,   self = this;

        // Placeholder for Client object
        self.client = service.client.init();


        /*!
         *   Authenticate client
         *   callback (function) Callback containing Client object
         */
        self.authenticate = function( callback ) {
            if ( !self.is_authenticated() ) {
                service.client.authenticate( function(client, error) {
                    if ( !error ) {
                        self.client = client;
                        if ( typeof callback === 'function' ) callback( client );
                    }
                });
            }else{
                if ( typeof callback === 'function' ) callback( self.client )
            }
        }


        // Returns true if the user is authenticated
        self.is_authenticated = function() {
            return service.client.is_authenticated( self.client );
        }


        self.auth_receiver = function() {
            service.client.auth_receiver();
        },


        /*!
         *   Upload a file
         *   data (string) Base64 encoded png image
         */
        self.upload_png = function( data ) {
            self.authenticate( function( client ) {
                var file = {
                    name: 'website.png',
                    data: encode64( data.replace('data:image/png;base64,', '') )
                };

                console.log('uploading file...');
                service.client.upload_file( file, client, function( result, error ) {
                    if ( result )
                        console.log(file.name+' uploaded :)');
                });              
            });
        }

        return self;
    }

}


;(function( document, PinupStorage ) {
    if ( document.body.id === 'oauth-receiver' ) {
        var adapter = new PinupStorage().adapter();
        adapter.auth_receiver();
    }
})( document, PinupStorage );
