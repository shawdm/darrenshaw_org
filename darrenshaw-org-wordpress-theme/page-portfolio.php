<?php get_header(); ?>

<?php get_template_part('menu'); ?>

<!-- container -->
<div class="container">
    <div class="row">
        <div class="col-sm-12 col-masonry">
            <div id="masonry" class="masonry-wrapper">
                <div class="grid-sizer"></div>
                <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); $args = array(
                    'order' => 'ASC',
                    'orderby' => 'menu_order',
                    'post_type' => 'attachment',
                    'numberposts' => -1,
                    'post_status' => null,
                    'post_parent' => $post->ID);
                    $attachments = get_posts( $args );
                    if($attachments){   
                        foreach ( $attachments as $attachment ) {
                            $image_attributes = wp_get_attachment_image_src($attachment->ID, 'full'); // returns an array
                            $image_meta = wp_prepare_attachment_for_js($attachment->ID); 
                            echo "<div class=\"masonry-block\" id=\"masonry-1\" onclick=\"toggleInfo('image-meta-".$attachment->ID."');\">";
                            echo "<img src=\"".$image_attributes[0]."\">";
                            echo "<div id=\"image-meta-".$attachment->ID."\" class=\"image-meta hidden\">";
                            echo "<p class=\"subtext\">".$image_meta['description']."</p>";
                            echo "</div>";
                            echo "</div>";
                        }
                    }
                endwhile; endif; ?>  
            </div>
        </div>
    </div>
</div><!-- /.container -->
        
<!-- script for masonry layout -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="<?php echo get_template_directory_uri(); ?>/libs/masonry/masonry.pkgd.min.js"></script>
<script type="application/javascript">
     
    function toggleInfo(id){
        if($("#"+id).hasClass("hidden")){
            $(".image-meta").addClass("hidden");
            $("#"+id).removeClass("hidden");
        }
        else{
            $(".image-meta").addClass("hidden");
        }  
    }
    
    var container = document.querySelector('#masonry');
        var msnry = new Masonry( container, {
        // options
        'itemSelector': '.masonry-block',
        'columnWidth': '.grid-sizer',
        'gutter':0
    });
    
    // relayout when everything (i.e. images have loaded)
    $(window).load(function() {
        msnry.layout();
    });
    
</script>
   
<?php get_footer(); ?>