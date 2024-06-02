---
layout: interactive-fashion-palette
title:  "My Favourite Net-A-Porter Colour is Black"
date:   2022-07-10 12:00:00 +0000
date_written: 2022-07-10 12:00:00 +0000
location: Winchester, UK
categories: blog
tags: [tech]
excerpt: Net-A-Porter's Spring Summer 2022 marketing campaign, "Go for Bold", centred around a collection of colourful products. Marketing wanted to add a technology element and one idea was to use palettes as a route to finding products. Ultimately this was binned, but I built it anyway.
---
<a href='{% link _posts/2022-05-28-nap-colour-palette.markdown %}'>
    {% include image.html path='images/blog/colour-of-net-a-porter/palette-black.png' title='Black Net-A-Porter Palette' alt='Black Net-A-Porter Palette' %}
</a>

[Net-A-Porter](https://www.net-a-porter.com/en-gb/)'s Spring Summer 2022 marketing campaign, "Go for Bold", centred around a collection of colourful products. The campaign photography (which I love) used dramatic angles, shadows and vivid palettes. Marketing wanted to add a technology element to the project and one idea was to use palettes as a route to finding products.

{% include image.html path='images/blog/colour-of-net-a-porter/go-for-bold-campaign.jpg' class='wide' %}

Ultimately this idea was binned for [something else](https://www.ynap.com/news/net-a-porter-launches-its-spring-summer-22-campaign-go-for-bold-integrating-ar-and-ai-technologies), but Kris and Naz from our Future Strategy and Design team had already discussed how we might do this with Google, who had done something similar with [Art Palette](https://artsexperiments.withgoogle.com/artpalette/). I was too attached to the idea and what Google had done to not build it anyway.

The starting point was to identify a colour palette for every product. I used [ColorThief](https://lokeshdhakar.com/projects/color-thief/) to sample product images and extract the five most dominant colours from each. These colours would define a product's palette.

I needed to score how similar any two palettes were. A colour is a point in 3D space made up of Red, Green and Blue (RGB) coordinates. A Euclidean distance measures how close any two points in that 3D space are. Unfortunately, proximity in RGB is not a good proxy for how our eyes and brains perceive colour similarity. An alternative to RGB is [CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space#CIELAB) which was designed to represent colour in a way that more closely aligns with  human perception. Euclidean distances between CIELAB colours do provide a good proxy for perceived colour similarity.

With five CIELAB colours per palette, measuring the distance between any two palettes (ignoring the order of colours) would mean 25 distance calculations. Not practical in a realtime query. For a catalogue the size of Net-A-Porter it would mean executing over a million calculations to find the closest palettes.

This is where I leant heavily on what Google had done with a clever optimisation trick. Offline, Goolge had calculated the distance between every possible palette in the colour space. Those distance values were then used to train a machine learning model to predict how similar any two palettes were. Removing the final layer in that model provided embeddings that represented the palettes in an n-dimensional space. Significantly, that space would locate similar palettes near to each other. These embeddings could be used to measure the distance between palettes directly, replacing 25 calculations with one.

The final step was to create an index of palette embeddings for the catalogue. An index provides a fast way to search for the nearest neighbours of any palette and to the products represented by those palettes. I used Jon Chamber's [implementation](https://github.com/jchambers/jvptree) of a  data structure to hold the index in memory.

The final step was to create an index of palette embeddings for the catalogue. An index provides a fast way to search for the nearest neighbours of any palette and to the products represented by those palettes. I used [Jon Chamber](https://github.com/jchambers/jvptree)'s [Vantage Point Tree](https://en.wikipedia.org/wiki/Vantage-point_tree) implementation as an in-memory index.

What makes this fun is that with an index of embeddings and a means of converting a palette to an embedding it's possible to search for products that are the nearest neighbour to any palette. There's no reason a palette needs to come from a product image. 

{% include image.html path='blog/colour-of-net-a-porter/palette-starrynight.png' class='wide' title='Starry Night Net-A-Porter Palette'%}

References:
1. Google's [Art Palette](https://artsexperiments.withgoogle.com/artpalette/) and [source code](https://github.com/googleartsculture/art-palette).
1. Lokesh Dhakar's [ColorThief](https://lokeshdhakar.com/projects/color-thief/).
1. Jon Chamber's [VP Tree](https://github.com/jchambers/jvptree) implementation.
1. Per Bang's [colour names](http://www.procato.com/home/).