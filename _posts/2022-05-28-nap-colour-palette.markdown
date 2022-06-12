---
layout: interactive-fashion-palette
title:  "My Favourite Net-A-Porter Colour is Black"
date:   2022-07-10 12:00:00 +0000
date_written: 2022-07-10 12:00:00 +0000
location: Winchester, UK
categories: blog
tags: [front, tech]
excerpt: Net-A-Porter's Spring Summer 2022 marketing campaign, "Go for Bold", centred around a collection of colourful products. Marketing wanted to add a technology element and one idea was to use palettes as a route to finding products. Ultimately this was binned, but I built it anyway.
---
[![Black Net-A-Porter Palette](images/blog/colour-of-net-a-porter/palette-black.png)]({% link _posts/2022-05-28-nap-colour-palette.markdown %})

[Net-A-Porter](https://www.net-a-porter.com/en-gb/)'s Spring Summer 2022 marketing campaign, "Go for Bold", centred around a collection of colourful products. The campaign photography (which I love) used dramatic angles, shadows and vivid palettes. Marketing wanted to add a technology element to the project and one idea was to use palettes as a route to finding products.

{% responsive_image path: images/blog/colour-of-net-a-porter/go-for-bold-campaign.jpg %}

Ultimately this idea was binned for [something else](https://www.ynap.com/news/net-a-porter-launches-its-spring-summer-22-campaign-go-for-bold-integrating-ar-and-ai-technologies), but Kris and Naz from our Future Strategy and Design team had already talked to Google about how we might develop it. Google had solved a similar problem for their [Art Palette](https://artsexperiments.withgoogle.com/artpalette/) project. At this point I was too attached to the idea and what Google had done, so I built it anyway.

The starting point was to identify a colour palette for every product. I used [ColorThief](https://lokeshdhakar.com/projects/color-thief/) to sample product images and extract the five most dominant colours in each. These colours would define a product's palette.

To find the most similar palettes I needed a means of scoring how similar any two palettes were. A colour is a point in 3D space made up of Red, Green and Blue (RGB) coordinates. A Euclidean distance provides a measure of how close any two points in that 3D space are. Unfortunately, proximity in RGB is not a good proxy for how our eyes and brains perceive colour similarity. An alternative to RGB is [CIELAB](https://en.wikipedia.org/wiki/CIELAB_color_space#CIELAB) which was designed to represent colour in a way that more closely matches human perception. Euclidean distances between CIELAB colours do provide a good proxy for perceived colour similarity.

With five CIELAB colours per palette, measuring the closest possible distance between any two palettes (ignoring the order of colours) would mean 25 individual distance calculations. Not practical in a realtime query. For a catalogue the size of Net-A-Porter it would mean executing over a million calculations to find the closest palettes to a given search palette.

This is where I lent heavily on what Google had done with a clever optimisation trick. Offline, Goolge had calculated the distance between every possible palette in the colour space. Those distance values were then used to train a machine learning model to predict how close any two palettes were. Removing the final layer in that model provided embeddings that represented the palettes in an n-dimensional space. Significantly, that space would locate similar palettes near to each other. These embeddings could be used to measure the distance between any two palettes directly, replacing 25 calculations with one.

The final step was to create an index of palette embeddings for all products in the catalogue. The index provides a fast way to search for the nearest neighbours of any initial embedding and from those neighbouring embeddings to the products they represented. I used Jon Chamber's [implementation](https://github.com/jchambers/jvptree) of a [Vantage Point Tree](https://en.wikipedia.org/wiki/Vantage-point_tree) data structure to hold the index in memory.

What makes this fun is that with an index of embeddings and a means of converting a palette to an embedding it's possible to search for products that are the nearest neighbour to any palette. There's no reason a palette needs to come from a product image. 

[![Starry Night Net-A-Porter Palette](images/blog/colour-of-net-a-porter/palette-starrynight.png)]({% link _posts/2022-05-28-nap-colour-palette.markdown %})

References:
1. Google's [Art Palette](https://artsexperiments.withgoogle.com/artpalette/) and [source code](https://github.com/googleartsculture/art-palette).
1. Lokesh Dhakar's [ColorThief](https://lokeshdhakar.com/projects/color-thief/).
1. Jon Chamber's [VP Tree](https://github.com/jchambers/jvptree) implementation.
1. Per Bang's [colour names](http://www.procato.com/home/).