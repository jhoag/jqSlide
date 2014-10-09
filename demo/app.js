requirejs.config( {
    baseUrl : "../src",
    paths : {
        "app"    : "../demo",
        "jquery" : "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min"
    }
} );

requirejs( ["app/main", "jqSlide"] );
