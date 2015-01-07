<?php get_header(); ?>

<?php get_template_part('menu'); ?>

<!-- containe -->
<div class="container">
    <?php
        if (have_posts()){
            // Start the Loop.
            while( have_posts() ){
                the_post();
                ?>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="shoots-col-text">
                            <h3><?php the_title(); ?></h3>
                            <p class="subtext"><?php echo get_the_content()?></p>        
                        </div>
                    </div>
                </div>
    
                <?php
                    // get images attached to this post
                    $args = array(
                        'post_type' => 'attachment',
                        'numberposts' => -1,
                        'post_status' => null,
                        'post_parent' => $post->ID,
                        'order' => 'ASC',
                        'orderby' => 'menu_order'
                    );
                    $attachments = get_posts($args);
                    
                    if($attachments && sizeof($attachments)>0){
                        $odd = true; //first one is odd col
                      
                        foreach($attachments as $attachment){
                            $meta = wp_prepare_attachment_for_js($attachment->ID);
                            
                            // if alt is set to w its a full width image
                            $wide = false;
                            if($meta['alt']=='w'){
                                $wide = true;
                            }
                            
                            if($wide){ // if its a wide image its one per row
                                if($odd){
                                    ?>
                                        <div class="row shoots-detail-row">
                                            <div class="col-sm-12 shoots-detail-col shoots-detail-col-w">
                                                <img src="<?php echo $meta['url']?>"/>
                                                <?php if($meta['caption'] && strlen($meta['caption'])>0){ ?>
                                                    <p class="subtext"><?php echo $meta['caption']?></p>
                                                <?php } ?>
                                            </div>
                                        </div>
                                    <?php
                                }
                                else{
                                    ?>  
                                        <div class="col-sm-6 shoots-detail-col shoots-detail-col-empty"></div>
                                        </div><!--fill in rest of row with empty column -->
                                        <div class="row shoots-detail-row">
                                            <div class="col-sm-12 shoots-detail-col">
                                                <img src="<?php echo $meta['url']?>"/>
                                                <?php if($meta['caption'] && strlen($meta['caption'])>0){ ?>
                                                    <p class="subtext"><?php echo $meta['caption']?></p>
                                                <?php } ?>        
                                            </div>
                                        </div>
                                    <?php
                                }
                                 $odd = true; //next one is always new row
                            }//end wide
                            
                            else{ // if its not a wide image we do two per row
                                if($odd){ 
                                    $odd = false;
                                    ?>
                                    <div class="row shoots-detail-row">
                                        <div class="col-sm-6 shoots-detail-col shoots-detail-col-left">
                                            <img src="<?php echo $meta['url']?>"/>
                                            <?php 
                                            if($meta['caption'] && strlen($meta['caption'])>0){
                                                ?>
                                                <p class="subtext"><?php echo $meta['caption']?></p>
                                                <?php
                                            }
                                            ?>
                                            <!-- <p class="subtext"><?php echo $meta['caption']?></p> -->
                                        </div>
                                        <?php
                                }//odd
                                else{
                                    $odd = true
                                    ?>
                                    <div class="col-sm-6 shoots-detail-col shoots-detail-col-right">
                                        <img src="<?php echo $meta['url']?>"/>
                                        <!-- <p class="subtext"><?php echo $meta['caption']?></p> -->
                                    </div>
                                </div>
                                <?php
                                }//even
                            }// end not wide
                            
                        }//end foreach
                        
                        if(!$odd){
                            ?>
                                </div>
                            <?php
                        }//end !$odd
                    }//if attachments
                    ?>
                
                <?php
            }//end while posts
        }//end if posts
    ?>
</div><!-- /.container -->

<?php get_footer(); ?>