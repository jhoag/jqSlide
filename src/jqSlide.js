// ==========================================================================
// jqSlide
// 
// Originally authored 08/2009 by Jake Hoggans (http://www.jakehoggans.co.uk)
// Maintained from 08/2014 (https://github.com/jhoag/jqSlide)
// ==========================================================================
define( [ "jquery", "PuzzleSquare" ], function( $, PuzzleSquare ) {
    $.fn.jqSlide = function( options ){        var imageWidth, imageHeight, numPieces;
        var pieceWidth, pieceHeight;
        var defaults = {
            animate : true,
            pieces  : 5
        };
        
        options = $.extend(defaults,options);
    
        var grid = [];        var animate;
        function withinBounds(i){ return (i >=0 && i<numPieces); }
        
        /**
         * Check for a blank square in the squares adjacent to the given x,y.
         * Diagonals are not allowed.
         * 
         * @param x
         * @param y
         * 
         * @return null if no blank square, {x,y} otherwise
         */
        function findAdjacentBlankSquare( x, y ) {
            var blankSquare = null; // Initialise to null. We'll never set this if we don't find a square.
            
            var squaresToCheck = []; // An array of adjacent squares we want to check

            if ( withinBounds( x + 1 ) ) {
                squaresToCheck.push( grid[ y ][ x + 1 ] );
            }
            
            if ( withinBounds( x - 1 ) ) {
                squaresToCheck.push( grid[ y ][ x - 1 ] );            }
            
            if ( withinBounds( y + 1 ) ) {
                squaresToCheck.push( grid[ y + 1 ][ x ] );
            }
            if ( withinBounds( y - 1 ) ) {
                squaresToCheck.push( grid[ y - 1 ][ x ] );
            }
            
            //TODO is it better to do this without forcing this closure?
            $.each( squaresToCheck, function( i, square ) {
                if ( square.isBlank() ) {
                    blankSquare = square;
                    return false;
                }
            } );

            return blankSquare;
        }

        function swapSquares(source, target){
            // First, tell the squares to move            
            grid[ source.y ][ source.x ].move( target, animate );
            grid[ target.y ][ target.x ].move( source, animate );
            
            // Next, update the grid collection
            var tmp = grid[target.y][target.x];
            grid[target.y][target.x] = grid[source.y][source.x];
            grid[source.y][source.x] = tmp;
        }
        var moveSquare = function(){
            var blankSquare;
            var x = $(this).data("x");
            var y = $(this).data("y");
            
            blankSquare = findAdjacentBlankSquare( x, y );
            if ( blankSquare !== null ) {
                swapSquares({x : x, y : y}, blankSquare.coordinate );
            }        };
        
        function shuffle(blankSquare){
            var bsx = blankSquare.x;
            var bsy = blankSquare.y;
            var times = 0;
            var rand;
            var tar;
            var validSquares;
            
            while ( times < 100 ) {
                //Check which neighbouring squares are valid
                validSquares = [];
                if ( withinBounds( bsx + 1 ) ) validSquares.push({x:1,y:0});
                if(withinBounds(bsx-1)) validSquares.push({x:-1,y:0});
                if(withinBounds(bsy+1)) validSquares.push({x:0,y:1});
                if(withinBounds(bsy-1)) validSquares.push({x:0,y:-1});
                
                rand = Math.floor(Math.random()*validSquares.length);
                
                //Temporarily override animation option
                animate = false;
                swapSquares({x:bsx+validSquares[rand].x,y:bsy+validSquares[rand].y}, {x:bsx,y:bsy});
                animate = options.animate;
                
                bsy+=validSquares[rand].y;
                bsx+=validSquares[rand].x;
                
                times++;
            }
        }
        return this.each(function(){
            //Initiasation function. Cut up the image.
            numPieces = options.pieces;
            
            imageWidth = $(this).width();
            imageHeight = $(this).height();
            
            pieceWidth = imageWidth / numPieces;
            pieceHeight = imageHeight / numPieces;
            
            grid = new Array(numPieces);
            for(var y=0;y<numPieces;y++){
                grid[y] = new Array(numPieces);
                for(var x=0;x<numPieces;x++){
                    var dimensions = { width : pieceWidth, height : pieceHeight };
                    var coordinate = { x : x, y : y };
                    
                    var obj = new PuzzleSquare( dimensions, coordinate, $(this).attr( "src" ) );
                    
                    // TODO: want to make dom private
                    obj.dom.click( moveSquare );
                    
                    grid[y][x] = obj;
                }
            }
            //Turn the final piece into the blank square.
            grid[numPieces-1][numPieces-1].makeBlank();
            shuffle({x:numPieces-1,y:numPieces-1});
            var collection = $("<div></div>");
            
            collection.css({ "position": "relative",
                             "height" : imageHeight+"px",
                             "width"  : imageWidth+"px" });
            $.each(grid, function(row){
                $.each(this, function(col){
                    // TODO don't abuse dom access
                    collection.append(this.dom);
                });
            });
            $(this).replaceWith(collection);
        });
    };
} );