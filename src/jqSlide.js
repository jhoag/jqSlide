// ==========================================================================
// jqSlide
// 
// Originally authored 08/2009 by Jake Hoggans (http://www.jakehoggans.co.uk)
// Maintained from 08/2014 (https://github.com/jhoag/jqSlide)
// ==========================================================================

/**
 * The jQuery plugin namespace.
 *
 * @external "jQuery.fn"
 * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
 */
 
require( [ "jqSlide" ] );

define( [ "jquery", "PuzzleSquare", "Puzzle" ], function( $, PuzzleSquare, Puzzle ) {
    /**
    * Turn an img tag into a sliding puzzle. <br />
    * <br />
    * Supported operations: <br />
    * <ul>
    *  <li><strong>create</strong> Create a new puzzle out of an img tag</li>
    * </ul>
    *
    * @function external:"jQuery.fn".jqSlide
    * @param {string} [operation] - The operation to perform
    * @param {object} [options] - Configuration options
    */
    $.fn.jqSlide = function(){
        var operation;
        var options;
                var defaults = {
            animate : true,
            pieces  : 5
        };
        
        if ( arguments.length < 2 ) {
            operation = "CREATE";
            if ( arguments.length == 0 ) {
                options = {};
            } else {
                options = arguments[ 0 ];
            }
        } else {
            operation = arguments[ 0 ].toUpperCase();
            options = arguments[ 1 ];
        }

        options = $.extend( defaults, options );
    
        // Parse the pieces option
        if ( ! $.isArray( options.pieces ) ) {
            // pieces isn't an array, so we want a square image, make it an array
            options.pieces = [ options.pieces, options.pieces ];
        }
        
        /**
         * Event handler to be assigned to the grid dom object, detecting clicks on PuzzleSquares
         *
         * TODO: Not sure we want this here
         *
         * @param event The jQuery Event object
         */
        function moveSquare( event ){
            var blankSquare;
            var currentSquare = $( event.target ).data( "jqSlide-PuzzleSquare" );
            var puzzle = $( event.target ).parent().data( "jqSlide-Puzzle" );
            
            if (    typeof( puzzle )        !== "undefined" 
                 && typeof( currentSquare ) !== "undefined" ) {
                blankSquare = puzzle.findAdjacentBlankSquare( currentSquare.coordinate.x, currentSquare.coordinate.y );
                if ( blankSquare !== null ) {
                    puzzle.swapSquares( currentSquare.coordinate, blankSquare.coordinate );
                    
                    if ( puzzle.isSolved() ) {
                        puzzle.fireHook( "solved" );
                    }
                }
            }
        };

        return this.each( function() {
            if ( operation == "CREATE" ) {
                var myPuzzle = new Puzzle( options.animate, options.pieces, $( this ), options.hooks );

                var $newDom = myPuzzle.addToDom();
                $newDom.data( "jqSlide-Puzzle", myPuzzle );

                // TODO Should this belong in the puzzle? Probably.
                $newDom.bind( "click", moveSquare );
            }
        });
    };
} );