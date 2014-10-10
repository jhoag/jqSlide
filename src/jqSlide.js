// ==========================================================================
// jqSlide
// 
// Originally authored 08/2009 by Jake Hoggans (http://www.jakehoggans.co.uk)
// Maintained from 08/2014 (https://github.com/jhoag/jqSlide)
// ==========================================================================
require( [ "jqSlide" ] );

define( [ "jquery", "PuzzleSquare" ], function( $, PuzzleSquare ) {
    $.fn.jqSlide = function( options ){        var imageWidth, imageHeight;
        var pieceWidth, pieceHeight;
                   
        var grid = [];
        
        var defaults = {
            animate : true,
            pieces  : 5
        };
        
        options = $.extend( defaults, options );
    
        // Parse the pieces option
        if ( ! $.isArray( options.pieces ) ) {
            // pieces isn't an array, so we want a square image, make it an array
            options.pieces = [ options.pieces, options.pieces ];
        }

        /**
         * Check if a given coordinate is within the bounds of the grid
         *
         * @param x The x coordinate to check
         * @param y The y coordinate to check
         * 
         * @return true / false
         */
        function withinBounds( x, y ) {
            return (    ( x >= 0 && x < options.pieces[ 0 ] )
                     && ( y >= 0 && y < options.pieces[ 1 ] ) )
        }
        
        /**
         * Get a list of squares adjacent to the given x,y.
         * This does not include diagonal squares.
         *
         * @param x The x coordinate to check
         * @param y The y coordinate to check
         *
         * @return An array of PuzzleSquares adjacent to the given coordinate
         */
        function getAdjacentSquares( x, y ) {
            var adjacentSquares = [];
            
            if ( withinBounds( x + 1, y ) ) {
                adjacentSquares.push( grid[ x + 1 ][ y ] );
            }
            
            if ( withinBounds( x - 1, y ) ) {
                adjacentSquares.push( grid[ x - 1 ][ y ] );
            }
            
            if ( withinBounds( x, y + 1 ) ) {
                adjacentSquares.push( grid[ x ][ y + 1 ] );
            }

            if ( withinBounds( x, y - 1 ) ) {
                adjacentSquares.push( grid[ x ][ y - 1 ] );
            }
            
            return adjacentSquares;
        }
        
        /**
         * Check for a blank square in the squares adjacent to the given x,y.
         * Diagonals are not allowed.
         * 
         * @param x The x coordinate to check
         * @param y The y coordinate to check
         * 
         * @return null if no blank square, {x,y} otherwise
         */
        function findAdjacentBlankSquare( x, y ) {
            var blankSquare = null; // Initialise to null. We'll never set this if we don't find a square.
            
            var squaresToCheck = getAdjacentSquares( x, y );
            
            //TODO is it better to do this without forcing this closure?
            $.each( squaresToCheck, function( i, square ) {
                if ( square.isBlank() ) {
                    blankSquare = square;
                    return false;
                }
            } );

            return blankSquare;
        }

        /**
         * Swap two the PuzzleSquares at two given x,y coordinate objects
         *
         * @param source The source coordinate for the swap
         * @param target The target coordinate for the swap
         */
        function swapSquares( source, target ) {
            // First, tell the squares to move            
            grid[ source.x ][ source.y ].move( target, options.animate );
            grid[ target.x ][ target.y ].move( source, options.animate );
            
            // Next, update the grid collection
            var tmp = grid[ target.x ][ target.y ];
            grid[ target.x ][ target.y ] = grid[ source.x ][ source.y ];
            grid[ source.x ][ source.y ] = tmp;
        }
        
        /**
         * Is the puzzle in a solved state?
         *
         * @return True / false - is the puzzle in a solved state
         */
        function isSolved() {
            var solved = true;
            $.each( grid, function() {
                $.each( this, function() {
                    if ( ! this.isInOriginalSpace() ) {
                        solved = false;
                        return false;
                    }
                } );
                
                // We already know it isn't solved, so give up
                if ( ! solved ) {
                    return false;
                }
            } );
            
            return solved;
        }
        
        /**
         * Fire the given hook.
         * This function handles checking if the hook has been registered.
         * Also handles an array of hooks
         * 
         * @param hook The name of the hook to be fired
         */
        function fireHook( hook ) {
            // Check some hooks have been registered
            if ( options.hooks ) {
                // Check if at least one function has been registered for this hook
                if ( options.hooks[ hook ] ) {
                    if ( $.isArray( options.hooks[ hook ] ) ) {
                        // With an array of hooks, call them all in order - stopping if one returns false
                        $.each( options.hooks[ hook ], function ( func ) {
                            return func();
                        } );
                    } else if ( typeof( options.hooks[ hook ] ) === "function" ) {
                        // Otherwise, call the hook
                        options.hooks[ hook ]();
                    }
                }
            }
        }
        
        /**
         * Event handler to be assigned to the grid dom object, detecting clicks on PuzzleSquares
         *
         * @param event The jQuery Event object
         */
        function moveSquare( event ){
            var blankSquare;
            var currentSquare = $( event.target ).data( "jqSlide-PuzzleSquare" );

            if ( typeof( currentSquare ) !== "undefined" ) {
                blankSquare = findAdjacentBlankSquare( currentSquare.coordinate.x, currentSquare.coordinate.y );
                if ( blankSquare !== null ) {
                    swapSquares( currentSquare.coordinate, blankSquare.coordinate );
                }
            }
            
            if ( isSolved() ) {
                fireHook( "solved" );
            }        };
        
        /**
         * Shuffle the grid
         *
         * @param blankSquare The initial blank square
         */
        function shuffle( blankSquare ) {
            var times = 0;
            var rand;
            var tar;
            var validSquares;

            var originalAnimate = options.animate;
            options.animate = false;
            
            // TODO: Find a better algorithm for shuffling
            while ( times < 1000 ) {
                //Check which neighbouring squares are valid
                validSquares = getAdjacentSquares( blankSquare.coordinate.x, blankSquare.coordinate.y );
                
                rand = Math.floor( Math.random() * validSquares.length );
                
                swapSquares( validSquares[ rand ].coordinate, blankSquare.coordinate );
                
                times++;
            }
            
            options.animate = originalAnimate;
        }
        
        return this.each( function() {
            // Initiasation function. Cut up the image.
            numPieces = options.pieces;

            imageWidth = $(this).width();
            imageHeight = $(this).height();
            
            pieceWidth = imageWidth / numPieces[ 0 ];
            pieceHeight = imageHeight / numPieces[ 1 ];
            
            // Define our grid
            grid = [];
            
            for ( var x = 0; x < numPieces[ 0 ]; x++ ) {
                grid.push( [] );
                for ( var y = 0; y < numPieces[ 1 ]; y++ ) {
                    var dimensions = { width : pieceWidth, height : pieceHeight };
                    var coordinate = { x : x, y : y };
                    
                    var obj = new PuzzleSquare( dimensions, coordinate, $(this).attr( "src" ) );
                    
                    grid[ x ].push( obj );
                }
            }
            //Turn the final piece into the blank square.
            grid[ numPieces[ 0 ] - 1 ][ numPieces[ 1 ] - 1 ].makeBlank();
            shuffle( grid[ numPieces[ 0 ] - 1 ][ numPieces[ 1 ] - 1 ] );
            var collection = $("<div></div>");
            
            collection.css({ "position": "relative",
                             "height" : imageHeight+"px",
                             "width"  : imageWidth+"px" });
            $.each(grid, function(row){
                $.each(this, function(col){
                    this.addToDom( collection );
                });
            });
            
            collection.bind( "click", moveSquare );
            
            $(this).replaceWith(collection);
        });
    };
} );