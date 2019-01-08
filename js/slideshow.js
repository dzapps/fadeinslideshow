/* 
 * An image slideshow with fade-in effect created with jQuery
 * Nara Yaralyan
 * narayaralian@yahoo.com
 */


$(document).ready(function(){
    /*
     * This function doesn't relate to the slideshow
     * it is used to style scrollbars  
     */
    $(function()
    {
	$('.topics').jScrollPane();
    });
    
    //preload all images to be used by slider
    
    (function($) {
    $.fn.preLoadImages = function(cb) {
        var urls = [], promises = [], $imgs = $(this).find('img');
        $imgs.each(function(){
            var promise = $.Deferred();
            var img = new Image();
            img.onload = function(){
                promise.resolve(img.src);
            };
            img.src = $(this).attr('src');
            promises.push(promise);
            console.log('loading img',img.src);
        });

        $.when.apply(null, promises).done(cb);
    };
})(jQuery);   
    
    // use console.log for debugging
console.log('starting');
$("#slideshow").preLoadImages(function(){
    var results = arguments;   
    console.log('all done', results);

    // resize images for particular screen resolution
    var slideheight;
            if ($(window).width<1025) {
            slideheight = 400;
            }
            else {
            slideheight = 600;
        }
    $(this).find('img.slideimg').each(function(){
        var width = $(this).width();        
        var height = $(this).height();
        var marginleft = (width/height*slideheight-width)/2;
            if (height<slideheight) {                
                $(this).css({"width":width/height*slideheight+"px","height":slideheight+"px","margin-left":-marginleft+"px"});
            }
    });
});

    
    // global variables    
    var iteration = 1; // number of the fadingSlider() function iteration to be set according to slidenum
    var captionFadeinSpeed = 4000;
    
    // count the number of the slides to be shown
    function countChildElements(parent, child)
     {
          var parent = document.getElementById(parent);
          var childCount = parent.getElementsByTagName(child).length;
          return(childCount);
     }
    var slidenum = countChildElements('slideshow', 'div'); 
    
    
    //assign numeric data-attributes to all div.slides to be able to reorder them back to the initial order, when user clicks "replay"
    var num =1;
    $('#slideshow > div.slide').each(function(){
        $(this).attr('data-info', num);
      num++;
    });  
    
    // reversing the order of the images in slideshow
    $.fn.reverseChildren = function() {
        return this.each(function(){
            var $this = $(this);
            $this.children().each(function(){ $this.prepend(this);});
        });
    };    
    $('#slideshow').reverseChildren(); 
    
    
    // call fadingSlider function 
    fadingSlider();
            
    function fadingSlider() {     
             
        var slide = $('#slideshow > div.active');
        var paragraph = $('#slideshow > div.active > p.caption');
        var caption = paragraph.text();
        var splitedCaption = caption.trim().match( /([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g );
        
    /*
     * Number of the sentances in each image caption used to calculate the slide fading speed.
     * The fade-in speed for each sentance is defined by var captionFadeinSpeed. To ensure that slide will
     * fade out only after all parts of its caption have faded in, the fade-out speed must be
     * captionFadeinSpeed x (captionNumber+1)
     */ 
        var captionNumber = splitedCaption.length;       
        var fontsize;        
        if ($(window).width()<1025) {
            fontsize = 60;
            }
            else {
            fontsize = 150;
        }
        var left = 100;        
        // animate caption
        paragraph.text(" ").css("opacity","1"); //make the caption <p> visible (defaul is opacity:0)
        
        fadeinCaptions(fadeoutSlide);
        
        function fadeinCaptions (callback) {
        for(i=0; i<captionNumber; i++){
           fontsize += 30;
           left += 10;
           paragraph.append("<span class=\"fadein\">" + splitedCaption[i]+"</span><br />");
           paragraph.find('span.fadein:last').css({"font-size":fontsize + "%", "margin-left":left+"px", "font-weight":"900","text-shadow":"1px 1px 2px black, 0 0 1em rgba(240, 220, 180, 0.5), 0 0 0.2em rgba(240, 220, 180, 0.5)"}).stop(true, true).delay(i*4000).fadeIn(captionFadeinSpeed, "linear", function(){});   
        }
        callback();
        }
                
        function fadeoutSlide (callback) {
        // prepare the slide, previous to .active, for smooth animation by making it visible        
            
        setTimeout(function () {           
            slide.prev('div').css('opacity','1');
        }, 500);
        
        // start fadeOut for the .active slide
        slide.stop(true, false).animate({opacity:'1'},captionFadeinSpeed*(captionNumber),'').fadeOut(captionFadeinSpeed, "linear", function() {            
            // animation complete.           
            $(this).prependTo('#slideshow').removeClass("active");            
            $('#slideshow > div:last').addClass("active");
            if(iteration < slidenum) {          
            fadingSlider();
            iteration++;
            }
            else{
            showTopics();    
            }
        });
        //end of fadingSlider function     
        }
              
            function showTopics(){
                $('#underslideshow').stop().animate({opacity:1},captionFadeinSpeed*(captionNumber)*slidenum,'');    
            }   
           
        
        
        //stop and replay on click
        $('#slideshow > button.control').on('click', function(){
        
        iteration = 1;
        $('#underslideshow').stop().animate({opacity:0},captionFadeinSpeed,'');
        //stop any animation on #slideshow's children
        $('#slideshow').find('*').stop(true, true);        
        $('#slideshow > div.active').removeClass('active');
        $('#slideshow').find('p.caption').each(function(){
            var spanText = $(this).find('span').text();
            $(this).append(spanText);
            $(this).find('span').remove();
        });
        
        //reorder div.slides back to their initial order
        $('#slideshow div.slide').sort(sort_slide).appendTo('#slideshow'); // append again to the list
                // sort function callback
                function sort_slide(a, b){
                return ($(b).data('info')) < ($(a).data('info')) ? 1 : -1;    
                }
               
         $('#slideshow > div.slide > p.caption').each( function() {
            $(this).css({'opacity':'0'});
        });  
        
        $('#slideshow').find('div').css({'display':'block','opacity':'1'});
        
        $('#slideshow > div:first').addClass("active");     
        
        $('#slideshow').reverseChildren();        
        
        fadingSlider();
        
});
};
});
      
