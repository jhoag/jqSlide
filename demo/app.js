requirejs.config( {
    baseUrl : "../dist",
    paths : {
        "app"    : "../demo",
        "jquery" : "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
        "main" : "jqSlide" 
    }
} );

requirejs( [ "jquery", "main" ] );

define( [ "jquery" ], function( $ ) {
    $( ".shuf" ).click( function(){
        $( ".myPuzzle" ).jqSlide();
    } );
} );