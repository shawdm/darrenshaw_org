<?php get_header(); ?>

<?php get_template_part('menu'); ?>

<div class="container shoots">
    <?php
        query_posts('tag=instant');
        if (have_posts()){
            // Start the Loop.
            while( have_posts() ){
                the_post();
                ?>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="shoots-col-text">
                            <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                            <p class="subtext"><?php echo get_the_content()?></p>   
                        </div>
                    </div>
                </div>
                <?php
                // get first image attached to this post
                $args = array(
                    'post_type' => 'attachment',
                    'numberposts' => 1,
                    'post_status' => null,
                    'post_parent' => $post->ID,
                    'order' => 'ASC',
                    'orderby' => 'menu_order'
                );
                $attachments = get_posts( $args );
                if($attachments && sizeof($attachments)>0){
                    $meta = wp_prepare_attachment_for_js($attachments[0]->ID);
                    ?>
                    <div class="row">
                        <div class="col-sm-12 shoots-detail-col shoots-detail-col-w">
                            <a href="<?php the_permalink(); ?>"><img src="<?php echo $meta['url']?>"/></a>
                            <?php if($meta['caption'] && strlen($meta['caption'])>0){ ?>
                                <p class="subtext"><?php echo $meta['caption']?></p>
                            <?php } ?>
                        </div>
                    </div>
                    <?php 
                } // IF 
            } // WHILE
        } // IF
    ?> 
</div><!-- /.container -->

<?php get_footer(); ?>