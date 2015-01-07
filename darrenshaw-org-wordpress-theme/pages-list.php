<ul class="list-inline menu">
    <?php
    $page = get_page_by_title('Home');
    wp_list_pages('title_li=&exclude=' . $page->ID); 
    ?>
    <li><a href="mailto:shawdm@gmail.com">Email</a></li>
</ul>