(function( $, window, undefined ) {
    // Menu
    $("a#slide").click(function(){
        $("#sidebar,a#slide,#fade").addClass("slide");
        $("#open").hide();
        $("#search").hide();
    });

    function closeMenu() {
        $("#sidebar,a#slide,#fade").removeClass("slide");
        $("#open").show();
        $("#search").show();
    }

    $("#fade").click(closeMenu);

    //Remove space scroll
    window.onkeydown = function(e) {
        if(e.keyCode == 32 && e.target == document.body) {
            e.preventDefault();
            return false;
        }
    };
    //Keys
    $(document).keydown(function(e){
        if(! $('.search-form').hasClass('active')){
            switch(e.code) {
                case "Space":
                case "Escape":
                    if ($('#fade').hasClass('slide')) {
                        $('#fade').trigger('click');
                    } else {
                        $('a#slide').trigger('click');
                    }
                    break;
            }
        }
        //sidebar active
        if($('#sidebar').hasClass('slide')){
            switch(e.code) {
                case "Digit1":
                    $("#sidebar ul li:first-child a").trigger('click');
                    break;
                case "Digit2":
                    $("#sidebar ul li:nth-child(2) a").trigger('click');
                    break;
                case "Digit3":
                    $("#sidebar ul li:nth-child(3) a").trigger('click');
                    break;
                case "Digit4":
                    $("#sidebar ul li:nth-child(4) a").trigger('click');
                    break;
                case "Digit5":
                    $("#sidebar ul li:nth-child(5) a").trigger('click');
                    break;
                case "Digit6":
                    $("#sidebar ul li:nth-child(6) a").trigger('click');
                    break;
                case "Digit7":
                    $("#sidebar ul li:nth-child(7) a").trigger('click');
                    break;
                case "KeyG":
                    $("#github").trigger('click');
                    break;
                case "KeyS":
                    $("#menu-search").trigger('click');
                    break;
                case "KeyT":
                    $("#twitter").trigger('click');
                    break;
                case "KeyK":
                    $("#keybase").trigger('click');
                    break;
            }
            return false;
        }
        if($('.search-form').hasClass('active')){
            switch(e.code) {
                case "Escape":
                    $('.icon-remove-sign').trigger('click');
                    break;
            }
        }
    })
    // Search
    $('#menu-search').on('click', function() {
        $('#fade').trigger('click');
        $('#search').trigger('click');
    });
    var bs = {
        close: $(".icon-remove-sign"),
        searchform: $(".search-form"),
        canvas: $("body"),
        dothis: $('.dosearch')
    };

    bs.dothis.on('click', function() {
        $('.search-wrapper').toggleClass('active');
        bs.searchform.toggleClass('active');
        bs.searchform.find('input').focus();
        bs.canvas.toggleClass('search-overlay');
        $('.search-field').simpleJekyllSearch();
    });

    bs.close.on('click', function() {
        $('.search-wrapper').toggleClass('active');
        bs.searchform.toggleClass('active');
        bs.canvas.removeClass('search-overlay');
    });

    /*
        // Scroll
  smoothScroll.init({
    updateURL: false
  })
  */

})( Zepto, window );
