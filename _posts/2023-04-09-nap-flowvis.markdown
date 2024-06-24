---
layout: blog-post
title: "Flow-vis for Net-A-Porter"
seo_title:  "Flow-vis for Net-A-Porter - Data Visualisation For Online Fashion Retail | Darren Shaw, UK Software Developer"
date_written: 2023-04-09 13:00:00 +0000
location: Winchester, UK
categories: blog
tags: [graphic, tech]
excerpt: What does a day's trading at Net-A-Porter look like? Taking inspiration from Formula 1's use of flow-vis paint, I came up with a visualisation for a YNAP hackday.
---
Formula 1 engineers use [flow-vis](https://the-race.com/formula-1/gary-andersons-guide-to-flow-vis-in-f1-testing/) paint to see air flow. It’s a simple technique that turns something hidden, visible. It can also be beautiful. Acting on that inspiration, this is what a day’s trading at Net-A-Porter looks like rendered in flow-vis.

{% include image.html path='images/blog/nap-flowvis/net-a-porter-flowvis.jpg' class='wide' %}

A flow field is a grid of forces acting on objects passing through that grid. I learned about flow fields from [Charlotte Dann](https://charlottedann.com/article/magical-vector-fields) and [Tyler Hobbs](https://tylerxhobbs.com/essays/2020/flow-fields), both generative artists who use them to produce visual effects. Engineers also use flow fields to model physical forces in simulations.

For the Net-A-Porter visualisation I generated a flow field based on product and trading data. Each product was represented by a force derived from its sales and views. The position of the force was based on the product’s age and price.

{% include image.html path='images/blog/nap-flowvis/002-forces.jpg' class='square' %}

I was under the illusion that this would produce something that looked like air flowing over an F1 car. But no.

{% include image.html path='images/blog/nap-flowvis/005-v1.jpg' class='wide' %}

The flow field had too many extreme forces. The “air” was getting stuck going back and forth between forces. I was able to get something that looked more organic by limiting the maximum strength of a force, but still not what I was aiming for.

{% include image.html path='images/blog/nap-flowvis/006-v2.jpg' class='wide' %}

To remove the extreme forces I normalised the data, basing the forces on percentiles to provide an even spread. I added momentum to the air, meaning even a big force wouldn’t completely change its flow. It still didn’t look like what I had in mind. But I think it works, like threads of material under a microscope? Or maybe hair?

Given that image was based on a single days’ trading, I thought it would be interesting to see what a whole month looked like.

<iframe width="800" height="450" src="https://www.youtube.com/embed/8MN5GmzKNVk?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I’ve been asked if I could show specific things, product categories performing well, peak age of product performance or how a sale period might look. All would be possible, but could be seen much more clearly on a simple graph. My priority was to come up with something based on data that looked pretty rather than being insightful. It’s ok that this visualisation is ultimately meaningless.

## Notes
If you’re interested in flow fields or any kind of generative art, I can’t recommend [Charlotte Dann](https://charlottedann.com) and [Tyler Hobbs](https://tylerxhobbs.com) more highly. They are both real artists, producing beautiful things and are amazingly generous in sharing their techniques.

I use [p5.js](https://p5js.org) to play around with things like this.

Thanks to [Kristian](https://uk.linkedin.com/in/kristian-flint) for organising the Hackday which I made this for and everyone else for taking part and coming up with much more useful ideas.


