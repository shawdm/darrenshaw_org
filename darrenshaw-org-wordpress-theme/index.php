<?php get_header(); ?>

<?php get_template_part('menu'); ?>

<div class="container shoots">
    <?php
    $args = array(
        'tag' => 'public',
        'paged' => get_query_var('paged')
    );
    query_posts($args);
    ?>
     
    <?php
    while( have_posts() ){
        the_post();
    ?>
        <div class="row shoots-row">
            
            <div class="col-sm-6 shoots-col-picture">
            <?php
            // get first image attached to this post
            $args = array(
                    'post_type' => 'attachment',
                    'numberposts' => -1,
                    'post_status' => null,
                    'post_parent' => $post->ID,
                    'order' => 'ASC',
                    'orderby' => 'menu_order'
            );
            $attachments = get_posts( $args );
            if($attachments && sizeof($attachments)>0){
                $image_attributes = wp_get_attachment_image_src($attachments[0]->ID, 'full');
                ?>
                <a href="<?php the_permalink(); ?>">
                <img src="<?php echo $image_attributes[0] ?>"/></a> 
                <?php
            }
            ?>
                    
            </div>
            <div class="col-sm-6">
                <div class="shoots-col-text">
                    <h3><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>
                    <p class="subtext"><?php the_excerpt_rss()?></p>
                </div>
            </div>
        </div>
            
    <?php 
    }
    ?>
        
    <div class="row pagination-row">
        <div class="col-sm-12">
            <?php posts_nav_link(' : ','Newer Posts','Older Posts'); ?>
        </div>
    </div>
    
</div><!-- /.container -->

<?php get_footer(); ?>