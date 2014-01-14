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
            app_key: 'm1yy69ojwerqez9',
            client: false,

            urls: {
                get_or_create_datastore: 'https://api.dropbox.com/1/datastores/get_or_create_datastore',
                get_snapshot: 'https://api.dropbox.com/1/datastores/get_snapshot'
            },

            // Initialise a new Dropbox client
            init: function() {
                if ( !this.client ) this.client = new Dropbox.Client( {key: this.app_key} );
                return this.client;
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
                    callback( {error: false, authenticated: true} );
                }else{
                    client.authDriver(new Dropbox.AuthDriver.ChromeExtension({ receiverPath: "client/chrome_oauth_receiver.html" }));
                    client.authenticate( function( error, client ) {
                        if ( error ) callback( {error: true, message: error, authenticated: false} );
                        if ( client.isAuthenticated() ) callback( {error: false, authenticated: true} );
                    });
                }
            },


            // Auth receiver to be called on the api's redirect page
            auth_receiver: function() {
                Dropbox.AuthDriver.ChromeExtension.oauthReceiver();
            },

            get_access_token: function() {
                var client = this.init();
                return client._credentials.token;
            },


            // Returns true if the client is authenticated, false if not
            is_authenticated: function() {
                var client = this.init();
                return client.isAuthenticated();
            },


            /*!
             *   Upload file to authenticated client's Dropbox account
             *
             *   file (object) Details about file to be upoaded {name: string, data: Blob object}
             *   client (Client object)
             *   callback (function (success bool, error object))
             */
            upload_file: function( file, callback ) {
                if ( typeof file !== 'object' ) return;
                var client = this.init()
                ,   callback = callback || function(){};

                // Write file to dropbox
                client.writeFile( file.name, file.data, function(error, file) {
                    if ( error )
                        callback( {error: true, message: error} );
                    else
                        callback( {error: false, file: file} );
                });
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

        self.schema = {
            name: 'pinup_library',
            structure: { 'pinup_library': new Array() }
        }

        /*!
         *   Authenticate
         *   callback (function)
         */
        self.authenticate = function( callback ) {
            if ( !self.is_authenticated() ) {
                service.authenticate( function( res ) {
                    if ( typeof callback === 'function' ) callback( res );
                });
            }else{
                if ( typeof callback === 'function' ) callback( {error: false, authenticated: true} )
            }
        }


        // Returns true if the user is authenticated
        self.is_authenticated = function() {
            return service.is_authenticated();
        }


        self.auth_receiver = function() {
            service.auth_receiver();
        }


        var setup_table = function( data ) {
            // First, lets see if the table exists
            chrome.storage.local.get( self.schema.name, function(res) {
                // Then, lets setup the table
                if ( !res.length ) {
                    var structure = self.schema.structure;
                    if ( typeof data === 'object' ) structure[self.schema.name].push( data );
                    chrome.storage.local.set( structure );
                    console.log( 'added table', structure );
                    return true;
                }
            });
        }

        var create_filename = function( input ) {
            if ( typeof input !== 'string' ) return false;
            return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        }


        self.add_new_entry = function( data, callback ) {
            if ( typeof data !== 'object' ) return;
            chrome.storage.local.get( self.schema.name, function(res) {
                if ( typeof res !== 'object' ) { setup_table( data ); }
                var new_data = res;
                new_data[self.schema.name].push( data );
                chrome.storage.local.set( new_data );
            });
        }


        self.get_data = function( callback ) {
            chrome.storage.local.get( self.schema.name, function(res) {
                if ( typeof res === 'object' )
                    if ( typeof callback === 'function' ) callback( res[self.schema.name] );
                else
                    if ( typeof callback === 'function' ) callback( false );
            });
        }


        /*!
         *   Upload a file and save meta data locally
         *   data (string) Base64 encoded png image
         */
        self.upload_png_and_save_data = function( image, data, callback ) {
            self.authenticate( function( res ) {
                var date        = new Date().toString()
                ,   filename    = create_filename( data.title ) || create_filename( date )
                ,   file = {
                    name: filename+'.png',
                    data: encode64( image.replace('data:image/png;base64,', '') )
                }

                var saveData = {
                    filename: file.name,
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    keywords: data.keywords,
                    capture_date: date,
                    image_path: '',
                    rating: 0
                }

                service.upload_file( file, function( result ) {
                    if ( !result.error ) {
                        console.log(result);
                        saveData.image_path = result.file.path;
                        self.add_new_entry( saveData );
                        if ( typeof callback === 'function' ) callback();
                    }
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
