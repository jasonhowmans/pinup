/*!
 * Simple selector function, basically a shorthand for getElementsByClassName, 
 * getElementById, getElementsByTagName.
 *
 * selector {string} Element selector. ex: $('.my-class'), $('#my-id'), $('div')
 * @returns element object
 */ 
function $( selector ) {
    if ( typeof selector !== 'string' ) {
        console.error('[Invalid selector]: Must be a string');
        return;
    }

    // Define test patterns
    var tests = {
          Id: /(^#)/
        , Class: /(^[.])/
        }

    // Match class name selectors
    if ( tests.Class.test( selector ) ) {
        var sel = selector.replace('.', '' )
        ,   el  = document.getElementsByClassName( sel );

    // Match ID selectors
    }else if ( tests.Id.test( selector ) ) {
        var sel = selector.replace('#', '' )
        ,   el  = document.getElementById( sel );

    // Match element selectors
    }else{
        var el = document.getElementsByTagName( selector );
    }

    // Return
    if ( typeof el === 'undefined' ) {
        console.error( 'Could not find element with selector '+selector );
        return;
    }else{
        // Clean up the result
        if ( el.length == 1 ) {
            return el[0];
        }else{
            return el;
        }
    }
}