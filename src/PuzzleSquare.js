define( [], /** @lends PuzzleSquare */ function() {
    /**
     * Represents a single square in a sliding puzzle.
     *
     * @class
     * @param {Object} dimension - { height : _, width : _ } The size of the puzzle pieces
     * @param {Object} coordinates - { x : _, y : _ } The coordinates, within the grid, of this piece
     * @param {String} imgSrc - URI to the full puzzle image
     */
    function PuzzleSquare( dimension, coordinates, imgSrc ) {
        /**
         * The height and width of this piece
         * @type {Object}
         */
        this.dimension = dimension;
        
        /**
         * The location of this piece at construction
         * @private
         * @type {Object}
         */
        this._originalCoordinates = coordinates;
        
        /**
         * The current location of this piece
         * @type {Object}
         */
        this.coordinates = coordinates;
        
        /**
         * Does this puzzle piece represent the blank square?
         * @type {Boolean}
         * @private
         */
        this._isBlank = false;
        
        // Create the DOM object to represent this puzzle square
        var top = this.coordinates.y * this.dimension.height;
        var left = this.coordinates.x * this.dimension.width;
        
        /**
         * This puzzle piece's dom element
         * @type {jQuery}
         * @private
         */
        this.dom = $( "<div></div>" );
        
        //define CSS
        this.dom.css( { "background-image"    : "url(" + imgSrc + ")",
                        "background-position" : "-"+left+"px -"+top+"px",
                        "position"            : "absolute",
                        "border"              : "1px solid black",
                        "top"                 : top+"px",
                        "left"                : left+"px",
                        "height"              : this.dimension.height,
                        "width"               : this.dimension.width } );

        //set up datastore
        this.dom.data( "jqSlide-PuzzleSquare", this );
    }

    /**
     * Turn this piece into a blank piece
     */
    PuzzleSquare.prototype.makeBlank = function () {
        this.dom.css( { "background-image" : "none",
                        "background"       : "white",
                        "border"           : "none",
                        "z-index"          : -100      } );

        this.dom.addClass( "blank" );
        this._isBlank = true;
    }

    /**
     * Does this piece represent a blank square
     *
     * @return {Boolean} If this square is blank or not
     */
    PuzzleSquare.prototype.isBlank = function() {
        return this._isBlank;
    }

    /**
     * Move this piece to a different location in the grid
     *
     * @param {Object} targetCoordinates { x : _, y : _ } The new location
     * @param {Boolean} animated Should this motion be animated
     */ 
    PuzzleSquare.prototype.move = function( targetCoordinates, animated ) {
        var newStyle = { top  : targetCoordinates.y * this.dimension.height + "px",
                         left : targetCoordinates.x * this.dimension.width + "px" };
        
        if ( animated === true ) {
            this.dom.animate( newStyle );
        } else {
            this.dom.css( newStyle );
        }
        
        this.coordinates = targetCoordinates;
    }
    
    /**
     * Add this piece to the dom
     * 
     * @param {jQuery} The target element to append this piece to
     */
    PuzzleSquare.prototype.addToDom = function ( $dom ) {
        $dom.append( this.dom );
    }
    
    /**
     * Is this piece in the original location
     *
     * @return {Boolean} Is this piece in the correct location
     */ 
    PuzzleSquare.prototype.isInOriginalSpace = function () {
        return (    ( this.coordinates.x == this._originalCoordinates.x )
                 && ( this.coordinates.y == this._originalCoordinates.y ) );
    }
    
    return PuzzleSquare;
} );