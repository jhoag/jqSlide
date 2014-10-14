define( [ "jquery", "PuzzleSquare" ], function( $, PuzzleSquare ) {
    
    function Puzzle( animated, numPieces, domObject ) {
        this._numPiecesX = numPieces[ 0 ];
        this._numPiecesY = numPieces[ 1 ];
        
        this._$originalDom = $( domObject ).clone();
        this._$dom = $( domObject );
        
        this._animated = animated;
        
        // Set up the grid
        this._grid = [];
        
        this.initialise();
        this.shuffle();
    }
    
    /**
     * Initialise the puzzle - set up the grid and create the initial blank square
     */
    Puzzle.prototype.initialise = function () {
        var pieceDimensions = { width  : this._$dom.width()  / this._numPiecesX,
                                height : this._$dom.height() / this._numPiecesY };

        var imageSrc = this._$dom.attr( "src" );
        
        for ( var x = 0; x < this._numPiecesX; x++ ) {
            this._grid.push( [] );
            for ( var y = 0; y < this._numPiecesY; y++ ) {
                var coordinates = { x : x, y : y };
                
                var obj = new PuzzleSquare( pieceDimensions, coordinates, imageSrc );
                
                this._grid[ x ].push( obj );
            }
        }
    
        // Make the last square blank
        this._grid[ this._numPiecesX - 1 ][ this._numPiecesY - 1 ].makeBlank();
    }

    /**
     * Shuffle the grid
     */
    Puzzle.prototype.shuffle = function () {    
        var times = 0;
        var rand;
        var validSquares;
        
        var originalAnimate = this._animated;
        this._animated = false;

        // The last square should be the blank... or stop.
        var blankSquare = this._grid[ this._numPiecesX - 1 ][ this._numPiecesY - 1 ];
        
        if ( ! blankSquare.isBlank() ) {
            return;
        }
        
        // TODO: Find a better algorithm for shuffling
        while ( times < 1000 ) {
            //Check which neighbouring squares are valid
            validSquares = this.getAdjacentSquares( blankSquare.coordinate.x, blankSquare.coordinate.y );
            
            rand = Math.floor( Math.random() * validSquares.length );
            
            this.swapSquares( validSquares[ rand ].coordinate, blankSquare.coordinate );
                
            times++;
        }
            
        this._animated = originalAnimate;
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
    Puzzle.prototype.getAdjacentSquares = function ( x, y ) {
        var adjacentSquares = [];
        
        if ( this.withinBounds( x + 1, y ) ) {
            adjacentSquares.push( this._grid[ x + 1 ][ y ] );
        }
        
        if ( this.withinBounds( x - 1, y ) ) {
            adjacentSquares.push( this._grid[ x - 1 ][ y ] );
        }
        
        if ( this.withinBounds( x, y + 1 ) ) {
            adjacentSquares.push( this._grid[ x ][ y + 1 ] );
        }

        if ( this.withinBounds( x, y - 1 ) ) {
            adjacentSquares.push( this._grid[ x ][ y - 1 ] );
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
    Puzzle.prototype.findAdjacentBlankSquare = function( x, y ) {
        var blankSquare = null; // Initialise to null. We'll never set this if we don't find a square.
        
        var squaresToCheck = this.getAdjacentSquares( x, y );
        
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
     * Check if a given coordinate is within the bounds of the grid
     *
     * @param x The x coordinate to check
     * @param y The y coordinate to check
     * 
     * @return true / false
     */
    Puzzle.prototype.withinBounds = function ( x, y ) {
        return (    ( x >= 0 && x < this._numPiecesX )
                 && ( y >= 0 && y < this._numPiecesY ) )
    }
    
    /**
     * Swap two the PuzzleSquares at two given x,y coordinate objects
     *
     * @param source The source coordinate for the swap
     * @param target The target coordinate for the swap
     */
    Puzzle.prototype.swapSquares = function ( source, target ) {
        // First, tell the squares to move            
        this._grid[ source.x ][ source.y ].move( target, this._animated );
        this._grid[ target.x ][ target.y ].move( source, this._animated  );

        // Next, update the grid collection
        var tmp = this._grid[ target.x ][ target.y ];
        this._grid[ target.x ][ target.y ] = this._grid[ source.x ][ source.y ];
        this._grid[ source.x ][ source.y ] = tmp;
    }

    /**
     * Set up and render the DOM element for this puzzle
     */
    Puzzle.prototype.addToDom = function () {
        var $collection = $("<div></div>");

        $collection.css( { "position" : "relative",
                           "height"   : this._$dom.height() + "px",
                           "width"    : this._$dom.width()  + "px"   } );

        $.each( this._grid, function ( row ) {
            $.each( this, function ( col ) {
                this.addToDom( $collection );
            } );
        } );
        
        this._$dom.replaceWith( $collection );
        
        return $collection;
    }
    
    /**
     * Fire the given hook.
     * This function handles checking if the hook has been registered.
     * Also handles an array of hooks
     * 
     * @param hook The name of the hook to be fired
     */
    Puzzle.prototype.fireHook = function ( hook ) {
        // Check some hooks have been registered
        if ( this._hooks ) {
            // Check if at least one function has been registered for this hook
            if ( this._hooks[ hook ] ) {
                if ( $.isArray( this._hooks[ hook ] ) ) {
                    // With an array of hooks, call them all in order - stopping if one returns false
                    $.each( this._hooks[ hook ], function ( func ) {
                        return func();
                    } );
                } else if ( typeof( this._hooks[ hook ] ) === "function" ) {
                    // Otherwise, call the hook
                    this._hooks[ hook ]();
                }
            }
        }
    }
        
    /**
     * Is the puzzle in a solved state?
     *
     * @return True / false - is the puzzle in a solved state
     */
    Puzzle.prototype.isSolved = function () {
        var solved = true;
        $.each( this._grid, function() {
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
    return Puzzle;
} );