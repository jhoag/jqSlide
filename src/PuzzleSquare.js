define( [], function() {
    function PuzzleSquare( dimension, coordinate, imgsrc ) {
        this.dimension = dimension;
        this.coordinate = coordinate;
        this.imgsrc = imgsrc;
        this._isBlank = false;
        
        // Create the DOM object to represent this puzzle square
        var top = coordinate.y * this.dimension.height;
        var left = coordinate.x * this.dimension.width;
        
        this.dom = $( "<div></div>" );
        
        //define CSS
        this.dom.css({ "background-image"    : "url(" + imgsrc + ")",
                  "background-position" : "-"+left+"px -"+top+"px",
                  "position"            : "absolute",
                  "border"              : "1px solid black",
                  "top"                 : top+"px",
                  "left"                : left+"px",
                  "height"              : this.dimension.height,
                  "width"               : this.dimension.width } );

        //set up datastore
        this.dom.data( "x", this.coordinate.x );
        this.dom.data( "y", this.coordinate.y );
                        
        // TODO dom.click(moveSquare);
        // TODOgrid[y][x] = obj;
    }

    PuzzleSquare.prototype.makeBlank = function () {
        this.dom.css( { "background-image" : "none",
                        "background"       : "white",
                        "border"           : "none",
                        "z-index"          : -100      } );

        this.dom.addClass( "blank" );
        this._isBlank = true;
    }

    PuzzleSquare.prototype.isBlank = function() {
        return this._isBlank;
    }

    PuzzleSquare.prototype.move = function( targetCoordinates, animated ) {
        var newStyle = { top  : targetCoordinates.y * this.dimension.height + "px",
                         left : targetCoordinates.x * this.dimension.width + "px" };
        
        if ( animated === true ) {
            this.dom.animate( newStyle );
        } else {
            this.dom.css( newStyle );
        }
        
        this.coordinate = targetCoordinates;
        this.dom.data( "x", this.coordinate.x );
        this.dom.data( "y", this.coordinate.y );
    }
    
    return PuzzleSquare;
} );