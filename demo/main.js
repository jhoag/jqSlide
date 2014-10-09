define( ["jquery", "jqSlide" ], function( $ ) {
    alert( "Doing it" );
    $( ".shuf" ).click( function(){
        $( ".myPuzzle" ).jqSlide();
    } );
} );
