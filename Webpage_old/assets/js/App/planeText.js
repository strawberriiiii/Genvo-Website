/// Colour input is a chromajs object
var fontHeightCache = {};


function createPlaneText( message, parameters )
{
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    var autotextcolour = parameters.hasOwnProperty("autotextcolour") ?
        parameters["autotextcolour"] : true ;

    //var spriteAlignment = THREE.SpriteAlignment.topLeft;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');



    // get size data (height depends only on font size)
    message = " " + message + " ";
    var textWidth = Math.ceil(context.measureText( message ).width) * fontsize/10 * 5;
    var textHeight = getFontHeight("Bold " + fontsize + "px " + fontface) * 5;
    borderThickness *= 5;

    // Set canvas width and height
    canvas.width = textWidth + 2 * borderThickness;
    canvas.height = textHeight + 2 * borderThickness;


    // Describe fontstyle
    context.font = "Bold " + fontsize*5 + "px " + fontface;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor._rgb[0] + "," + backgroundColor._rgb[1] + ","
                                  + backgroundColor._rgb[2] + "," + backgroundColor._rgb[3] + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor._rgb[0] + "," + borderColor._rgb[1] + ","
                                  + borderColor._rgb[2] + "," + borderColor._rgb[3] + ")";

    context.lineWidth = borderThickness;
    roundRect(context,
        borderThickness/2,
        borderThickness/2,
        textWidth + borderThickness,
        textHeight + borderThickness,
        6);


    // Create text with following settings
    if (autotextcolour && backgroundColor.luminance() < 0.4){
        context.fillStyle = "rgba(245, 245, 245, 1.0)";
    }else{
        context.fillStyle = "rgba(0, 0, 0, 1.0)";
    }
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillText( message, borderThickness, borderThickness);




    // canvas contents will be used as a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true
    });

    var geometry = new THREE.PlaneGeometry( (textWidth + borderThickness)/5, (textHeight + borderThickness)/5 );
    var plane = new THREE.Mesh( geometry, material );

    plane.position.x = canvas.width / 2 / 5;

    return plane;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function getFontHeight(fontStyle) {
  var result = fontHeightCache[fontStyle];

  if (!result) {
    var body = document.getElementsByTagName('body')[0];
    var dummy = document.createElement('div');

    var dummyText = document.createTextNode('MÉq');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', 'font:' + fontStyle + ';position:absolute;top:0;left:0');
    body.appendChild(dummy);
    result = dummy.offsetHeight;

    fontHeightCache[fontStyle] = result;
    body.removeChild(dummy);
  }

  return result;
}
