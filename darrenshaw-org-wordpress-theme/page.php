<?php get_header(); ?>

<?php get_template_part('menu'); ?>

<div class="container-fluid">
    <div class="row">
        <div class="full-bleed-image"></div>
    </div> 
</div>

<div class="container">
    <div class="row profile-row">
        <div class="col-sm-8">
            <p class="subtext">
                <span class="first-word">HELLO!</span> I'm Darren Shaw, a fashion and portrait photographer living and working around Southampton in Hampshire.  I mainly shoot beauty and editorial work. As well as digital, I enjoy working with older film cameras and love soft, naturally lit black and white images. I’m always looking to meet new models, makeup artists and stylists. So if you’re interested in working together, get in touch.
            </p>
            <p class="subtext">
                - Darren
            </p>
            <p class="subtext">
                <a href="http://twitter.com/shawdm">Twitter</a> | <a href="http://facebook.com/shawdm">Facebook</a> | <a href="mailto:shawdm@gmail.com">Email</a>
            </p>
        </div>
        <div class="col-sm-4 col-profile-image">
              <img alt="Darren Shaw" title="Darren Shaw" class="profile-image" src="<?php echo get_template_directory_uri();?>/images/darren_shaw.jpg"/>
        </div>
    </div>
</div>

<?php get_footer(); ?>
