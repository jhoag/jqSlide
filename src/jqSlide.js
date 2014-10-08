// ==========================================================================
// jqSlide
// 
// Originally authored 08/2009 by Jake Hoggans (http://www.jakehoggans.co.uk)
// Maintained from 08/2014 (https://github.com/jhoag/jqSlide)
// ==========================================================================
(function($){    $.fn.shufflePuzzle = function( options ){        var imageWidth, imageHeight, numPieces;
        var pieceWidth, pieceHeight;
        var defaults = {
            animate : true,
            pieces  : 5
        };
        
        options = $.extend(defaults,options);
    
        var grid = [];        var animate;
        function withinBounds(i){ return (i >=0 && i<numPieces); }
        function checkAdjacentSquares(x,y){
            if(withinBounds(x+1)){
                // TODO: Hate the below. Refactor.
                if(grid[y][x+1].hasClass("blank")) return {x : x+1, y : y};
            }
            if(withinBounds(x-1)){
                // TODO: Hate the below. Refactor.
                if(grid[y][x-1].hasClass("blank")) return {x : x-1, y : y};
            }
            if(withinBounds(y+1)){
                // TODO: Hate the below. Refactor.
                if(grid[y+1][x].hasClass("blank")) return {x : x, y : y + 1};
            }
            if(withinBounds(y-1)){                // TODO: Hate the below. Refactor.
                if(grid[y-1][x].hasClass("blank")) return {x : x, y : y - 1};
            }
            return false;
        }

        function swapSquares(source, target){
            var tmp = grid[target.y][target.x];        
            grid[target.y][target.x] = grid[source.y][source.x];
            grid[source.y][source.x] = tmp;
            //change css position values
            grid[target.y][target.x].css("z-index",100);
            if(animate){
                //Move puzzle piece
                grid[target.y][target.x].animate({"top" : target.y * pieceHeight+"px", "left" : target.x * pieceWidth+"px"});
                //Move blank
                grid[source.y][source.x].animate({"top" : source.y * pieceHeight+"px", "left" : source.x * pieceWidth+"px"});
            } else {
                //Change puzzle piece
                grid[target.y][target.x].css({ "top" : target.y * pieceHeight+"px",
                                               "left": target.x * pieceWidth+"px" });
                grid[source.y][source.x].css({ "top" : source.y * pieceHeight+"px",
                                               "left": source.x * pieceWidth+"px" });
            }
      
            //Change puzzle piece datastore
            grid[target.y][target.x].data("x", target.x);
            grid[target.y][target.x].data("y", target.y);
            //Change blank datastore
            grid[source.y][source.x].data("x", source.x);
            grid[source.y][source.x].data("y", source.y);
        }
        var moveSquare = function(){
            var blankSquare;
            var x = $(this).data("x");
            var y = $(this).data("y");
            
            blankSquare = checkAdjacentSquares( x, y );
            if ( blankSquare !== false ) {
                swapSquares({x : x, y : y}, {x : blankSquare.x, y : blankSquare.y});
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
                if(withinBounds(bsx+1)) validSquares.push({x:1,y:0});
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
                    var top = y * pieceHeight;
                    var left = x * pieceWidth;
                    var obj = $("<div></div>");
                    //define CSS
                    obj.css({ "background-image"    : "url(" + $(this).attr("src") + ")",
                              "background-position" : "-"+left+"px -"+top+"px",
                              "position"            : "absolute",
                              "border"              : "1px solid black",
                              "top"                 : top+"px",
                              "left"                : left+"px",
                              "height"              : pieceHeight,
                              "width"               : pieceWidth });
                    //set up datastore
                    obj.data("x", x);
                    obj.data("y", y);
                    
                    obj.click(moveSquare);
                    grid[y][x] = obj;
                }
            }
            //Turn the final piece into the blank square.
            grid[numPieces-1][numPieces-1].css({ "background-image" : "none",
                                                 "background"       : "white",
                                                 "border"           : "none" });
            grid[numPieces-1][numPieces-1].addClass("blank");
            shuffle({x:numPieces-1,y:numPieces-1});
            var collection = $("<div></div>");
            
            collection.css({ "position": "relative",
                             "height" : imageHeight+"px",
                             "width"  : imageWidth+"px" });
            $.each(grid, function(row){
                $.each(this, function(col){
                    collection.append(this);
                });
            });
            $(this).replaceWith(collection);
        });
    };
})(jQuery);